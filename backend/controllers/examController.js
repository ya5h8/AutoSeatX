const db = require("../config/db");

exports.generateSeating = (req, res) => {
  const { dataset_id, examDate, startTime, endTime } = req.body;

  if (!dataset_id || !examDate || !startTime || !endTime) {
    return res.status(400).json({ message: "Dataset, date, and time required" });
  }

  db.query(
    "SELECT * FROM students WHERE dataset_id = ? ORDER BY roll_no ASC",
    [dataset_id],
    (err, students) => {
      if (err) return res.status(500).json(err);

      if (students.length === 0) {
        return res.status(400).json({ message: "No students found for this dataset" });
      }

      db.query(
        `SELECT r.* FROM rooms r
         WHERE r.id NOT IN (
           SELECT DISTINCT sa.room_id FROM seating_allocations sa
           JOIN exams e ON sa.exam_id = e.id
           WHERE e.exam_date = ? 
           AND NOT (e.end_time <= ? OR e.start_time >= ?)
         )
         ORDER BY r.capacity DESC`,
        [examDate, startTime, endTime],
        (err, rooms) => {
          if (err) return res.status(500).json(err);

          if (rooms.length === 0) {
            return res.status(400).json({ message: "No available rooms for this time slot. Rooms are occupied by overlapping exams." });
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
                seats: roomSeats
              });
            }
          });

          if (studentIndex < students.length) {
            return res.status(400).json({
              message: "Not enough room capacity for this time slot."
            });
          }

          res.json(seatingPlan);
        }
      );
    }
  );
};

exports.saveExam = (req, res) => {
  const { examType, examDate, startTime, endTime, dataset_id, seatingPlan } = req.body;

  db.query(
    "INSERT INTO exams (exam_type, exam_date, start_time, end_time, dataset_id) VALUES (?, ?, ?, ?, ?)",
    [examType, examDate, startTime, endTime, dataset_id],
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
     GROUP BY e.id
     ORDER BY e.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.deleteExam = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM seating_allocations WHERE exam_id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);

    db.query("DELETE FROM exams WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Exam deleted successfully" });
    });
  });
};

exports.getStudentSeat = (req, res) => {
  const { roll_no } = req.body;

  if (!roll_no) {
    return res.status(400).json({ message: "Roll number required" });
  }

  db.query(
    `SELECT 
        sa.roll_no,
        sa.seat_row,
        sa.seat_column,
        r.room_no,
        e.exam_type,
        DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date,
        DATE_FORMAT(e.start_time, '%h:%i %p') as start_time,
        DATE_FORMAT(e.end_time, '%h:%i %p') as end_time
     FROM seating_allocations sa
     JOIN rooms r ON sa.room_id = r.id
     JOIN exams e ON sa.exam_id = e.id
     WHERE sa.roll_no = ?
     ORDER BY e.exam_date DESC
     LIMIT 1`,
    [roll_no],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "Seat not found" });
      }

      res.json(result[0]);
    }
  );
};
