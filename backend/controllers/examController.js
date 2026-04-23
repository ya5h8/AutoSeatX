const db = require("../config/db");

exports.generateSeating = (req, res) => {
  const { dataset_id, examDate, startTime, endTime, floorNo } = req.body;

  if (!dataset_id || !examDate || !startTime || !endTime) {
    return res.status(400).json({ message: "Dataset, date, and time required" });
  }

  db.query(
    "SELECT * FROM students WHERE dataset_id = ? ORDER BY CAST(roll_no AS UNSIGNED) ASC, roll_no ASC",
    [dataset_id],
    (err, students) => {
      if (err) return res.status(500).json(err);

      if (students.length === 0) {
        return res.status(400).json({ message: "No students found for this dataset" });
      }

      // Build room query — optionally filter by floor
      const floorFilter = floorNo ? " AND r.floor_no = ?" : "";
      const roomParams = [req.user.id, examDate, startTime, endTime];
      if (floorNo) roomParams.push(parseInt(floorNo));

      db.query(
        `SELECT r.* FROM rooms r
         WHERE r.admin_id = ?
         AND r.id NOT IN (
           SELECT DISTINCT sa.room_id FROM seating_allocations sa
           JOIN exams e ON sa.exam_id = e.id
           WHERE e.exam_date = ? 
           AND NOT (e.end_time <= ? OR e.start_time >= ?)
         )${floorFilter}
         ORDER BY r.capacity DESC`,
        roomParams,
        (err, rooms) => {
          if (err) return res.status(500).json(err);

          if (rooms.length === 0) {
            const msg = floorNo
              ? `No available rooms on floor ${floorNo} for this time slot.`
              : "No available rooms for this time slot. Rooms are occupied by overlapping exams.";
            return res.status(400).json({ message: msg });
          }

          let studentIndex = 0;
          const seatingPlan = [];

          rooms.forEach(room => {
            let roomSeats = [];

            for (let c = 1; c <= room.total_columns; c++) {
              for (let r = 1; r <= room.total_rows; r++) {

                if (studentIndex < students.length) {
                  roomSeats.push({
                    roll_no: students[studentIndex].roll_no,
                    student_name: students[studentIndex].name,
                    row: r,
                    column: c
                  });

                  studentIndex++;
                }
              }
            }

            if (roomSeats.length > 0) {
              seatingPlan.push({
                room_id: room.id,
                room_no: room.room_no,
                floor_no: room.floor_no,
                door_side: room.door_side,
                total_rows: room.total_rows,
                total_columns: room.total_columns,
                seats: roomSeats
              });
            }
          });

          const unallocated = students.length - studentIndex;
          res.json({ seatingPlan, unallocated });
        }
      );
    }
  );
};

exports.saveExam = (req, res) => {
  const { examType, examDate, startTime, endTime, dataset_id, seatingPlan } = req.body;

  db.query(
    "INSERT INTO exams (exam_type, exam_date, start_time, end_time, dataset_id, admin_id) VALUES (?, ?, ?, ?, ?, ?)",
    [examType, examDate, startTime, endTime, dataset_id, req.user.id],
    (err, examResult) => {
      if (err) return res.status(500).json(err);

      const examId = examResult.insertId;
      const allocations = [];

      seatingPlan.forEach(room => {
        room.seats.forEach(seat => {
          allocations.push([examId, room.room_id, seat.roll_no, seat.row, seat.column]);
        });
      });

      db.query(
        "INSERT INTO seating_allocations (exam_id, room_id, roll_no, seat_row, seat_column) VALUES ?",
        [allocations],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Exam saved successfully" });
        }
      );
    }
  );
};

exports.getExams = (req, res) => {
  db.query(
    `SELECT e.id, e.exam_type, DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date, 
     DATE_FORMAT(e.start_time, '%h:%i %p') as start_time, 
     DATE_FORMAT(e.end_time, '%h:%i %p') as end_time, 
     e.dataset_id, e.created_at,
     GROUP_CONCAT(DISTINCT r.room_no ORDER BY r.room_no SEPARATOR ', ') as rooms
     FROM exams e
     LEFT JOIN seating_allocations sa ON e.id = sa.exam_id
     LEFT JOIN rooms r ON sa.room_id = r.id
     WHERE e.admin_id = ?
     GROUP BY e.id
     ORDER BY e.created_at DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.deleteExam = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE sa FROM seating_allocations sa JOIN exams e ON sa.exam_id = e.id WHERE e.id = ? AND e.admin_id = ?", 
    [id, req.user.id], 
    (err) => {
    if (err) return res.status(500).json(err);

    db.query("DELETE FROM feedbacks WHERE exam_id = ?", [id], (err) => {
      if (err) return res.status(500).json(err);

      db.query("DELETE FROM exams WHERE id = ? AND admin_id = ?", [id, req.user.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Exam deleted successfully" });
      });
    });
  });
};

exports.getStudentSeat = (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Roll number or Name required" });
  }

  const lookupQuery = `
    SELECT 
        sa.roll_no,
        s.name as student_name,
        sa.seat_row,
        sa.seat_column,
        r.room_no,
        r.total_rows,
        r.total_columns,
        r.door_side,
        e.id as exam_id,
        e.exam_type,
        DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date,
        DATE_FORMAT(e.start_time, '%H:%i') as raw_start_time,
        DATE_FORMAT(e.end_time, '%H:%i') as raw_end_time,
        DATE_FORMAT(e.start_time, '%h:%i %p') as start_time,
        DATE_FORMAT(e.end_time, '%h:%i %p') as end_time,
        IF(f.id IS NOT NULL, true, false) as has_feedback
     FROM seating_allocations sa
     JOIN rooms r ON sa.room_id = r.id
     JOIN exams e ON sa.exam_id = e.id
     LEFT JOIN students s ON sa.roll_no = s.roll_no
     LEFT JOIN feedbacks f ON f.exam_id = sa.exam_id AND f.roll_no = sa.roll_no
     WHERE sa.roll_no = ? OR LOWER(s.name) LIKE ?
     ORDER BY e.exam_date DESC, e.start_time ASC
  `;

  const searchParamName = `%${query.toLowerCase()}%`;

  db.query(lookupQuery, [query, searchParamName], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "No seating allocation found" });
    }

    // If there are multiple unique students found (name collision)
    const uniqueStudents = [...new Set(results.map(r => r.roll_no))];
    if (uniqueStudents.length > 1) {
      // Disambiguation needed
      const options = uniqueStudents.map(roll => {
        const studentRecord = results.find(r => r.roll_no === roll);
        return { roll_no: roll, student_name: studentRecord.student_name };
      });
      return res.status(300).json({
        message: "Multiple matches found. Please select your specific roll number.",
        options
      });
    }

    // Return all exams for the singular matched student (for timetable flow on client)
    // Front-end will pick the "current/next" exam based on date/time logic, and show historic/future ones.
    res.json({
      student_name: results[0].student_name,
      roll_no: results[0].roll_no,
      exams: results
    });
  });
};

exports.getUpcomingTimetable = (req, res) => {
  db.query(
    `SELECT e.id, e.exam_type, DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date, 
     DATE_FORMAT(e.start_time, '%h:%i %p') as start_time, 
     DATE_FORMAT(e.end_time, '%h:%i %p') as end_time 
     FROM exams e 
     WHERE e.admin_id = ? AND e.exam_date >= CURDATE()
     ORDER BY e.exam_date ASC, e.start_time ASC
     LIMIT 10`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};
