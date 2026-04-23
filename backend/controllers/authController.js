const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query("SELECT * FROM admin WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, college_name: admin.college_name },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.json({
      message: "Login successful",
      token,
      college_name: admin.college_name
    });
  });
};

exports.signupAdmin = async (req, res) => {
  const { college_name, email, password } = req.body;

  if (!college_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO admin (college_name, email, password) VALUES (?, ?, ?)",
      [college_name, email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          return res.status(500).json(err);
        }

        const adminId = result.insertId;

        // Initialize default questions for this new admin
        const defaultQuestions = [
          [adminId, "Clear Instructions", "rating", true],
          [adminId, "Seat Comfort", "rating", true],
          [adminId, "Invigilation Quality", "rating", true],
          [adminId, "Hall Environment", "rating", true],
          [adminId, "Check-in Process", "rating", true]
        ];

        db.query(
          "INSERT INTO feedback_questions (admin_id, label, type, is_required) VALUES ?",
          [defaultQuestions],
          (err) => {
            if (err) console.error("Error setting default feedback questions:", err);
            
            res.status(201).json({ message: "Admin registered successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};
