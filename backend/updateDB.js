const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autoseatx'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("MySQL Connected");

  const createFeedbackTable = `
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      roll_no VARCHAR(50) NOT NULL,
      exam_id INT NOT NULL,
      clear_instructions INT NOT NULL,
      seat_comfort INT NOT NULL,
      invigilation INT NOT NULL,
      hall_environment INT NOT NULL,
      checkin_process INT NOT NULL,
      student_year VARCHAR(50) DEFAULT 'Unknown Year',
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_feedback (roll_no, exam_id),
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    )
  `;

  db.query(createFeedbackTable, (err, result) => {
    if (err) {
      console.error("Error creating feedbacks table:", err);
    } else {
      console.log("Feedbacks table ready");
    }
    
    db.end();
    process.exit(0);
  });
});
