const db = require("../config/db");

const normalizeYearLabel = (rawYear) => {
  if (!rawYear && rawYear !== 0) return "Unknown Year";
  const yearText = String(rawYear).trim().toLowerCase();
  if (!yearText) return "Unknown Year";
  if (yearText.includes("first") || yearText === "1" || yearText === "1st") return "First Year";
  if (yearText.includes("second") || yearText === "2" || yearText === "2nd") return "Second Year";
  if (yearText.includes("third") || yearText === "3" || yearText === "3rd") return "Third Year";
  if (yearText.includes("fourth") || yearText === "4" || yearText === "4th") return "Fourth Year";
  return "Unknown Year";
};

// GET /api/feedback/questions
exports.getQuestions = (req, res) => {
  // If user is logged in, use their admin_id. Otherwise (for students), use a provided admin_id (handled via route param or body)
  // For simplicity, I'll assume for now that students access a public route where the exam_id is known.
  // Actually, getQuestions for students should probably find the admin_id from the exam_id.
  
  const { exam_id } = req.query;
  if (exam_id) {
     db.query("SELECT admin_id FROM exams WHERE id = ?", [exam_id], (err, exams) => {
        if (err || exams.length === 0) return res.status(404).json({ message: "Exam/Questions not found" });
        const adminId = exams[0].admin_id;
        db.query("SELECT * FROM feedback_questions WHERE admin_id = ? ORDER BY id ASC", [adminId], (err, results) => {
            if (err) return res.status(500).json({ message: "Error fetching questions", error: err });
            res.json(results);
        });
     });
  } else {
     // Fallback for admin preview
     const adminId = req.user ? req.user.id : 1;
     db.query("SELECT * FROM feedback_questions WHERE admin_id = ? ORDER BY id ASC", [adminId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching questions", error: err });
        res.json(results);
     });
  }
};

// POST /api/feedback/questions (Admin Only)
exports.saveQuestions = (req, res) => {
  const { questions } = req.body; // Array of { label, type, is_required }
  if (!Array.isArray(questions)) return res.status(400).json({ message: "Questions must be an array" });

  db.query("DELETE FROM feedback_questions WHERE admin_id = ?", [req.user.id], (err) => {
    if (err) return res.status(500).json({ message: "Error resetting questions", error: err });
    
    if (questions.length === 0) return res.json({ message: "All questions removed" });

    const values = questions.map(q => [req.user.id, q.label, q.type || 'rating', q.is_required !== false]);
    db.query("INSERT INTO feedback_questions (admin_id, label, type, is_required) VALUES ?", [values], (err) => {
      if (err) return res.status(500).json({ message: "Error saving questions", error: err });
      res.json({ message: "Feedback form updated successfully" });
    });
  });
};

// POST /api/feedback
exports.submitFeedback = (req, res) => {
  const { roll_no, exam_id, comments, ...responses } = req.body;

  if (!roll_no || !exam_id) {
    return res.status(400).json({ message: "Roll number and Exam ID are required" });
  }

  // Fetch student's academic year
  db.query("SELECT year FROM students WHERE roll_no = ?", [roll_no], (err, students) => {
    let studentYear = "Unknown Year";
    if (!err && students.length > 0 && students[0].year) {
      studentYear = normalizeYearLabel(students[0].year);
    }

    db.query(
      "INSERT INTO feedbacks (roll_no, exam_id, responses, student_year, comments) VALUES (?, ?, ?, ?, ?)",
      [roll_no, exam_id, JSON.stringify(responses), studentYear, comments],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Feedback already submitted for this exam" });
          }
          return res.status(500).json({ message: "Server error saving feedback", error: err });
        }
        res.status(201).json({ message: "Feedback submitted successfully" });
      }
    );
  });
};

// GET /api/feedback
exports.getFeedbacks = (req, res) => {
  db.query(
    `SELECT f.*, e.exam_type, DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date, s.name as student_name,
            DATE_FORMAT(f.created_at, '%Y-%m-%d %h:%i %p') as submitted_at
     FROM feedbacks f
     JOIN exams e ON f.exam_id = e.id
     LEFT JOIN students s ON f.roll_no = s.roll_no
     WHERE e.admin_id = ?
     ORDER BY f.created_at DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      
      // Parse JSON responses for frontend
      const parsedResults = results.map(row => {
        try {
          return { ...row, responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses };
        } catch (e) {
          return { ...row, responses: {} };
        }
      });
      res.json(parsedResults);
    }
  );
};
