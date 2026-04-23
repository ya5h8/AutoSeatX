const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yash',
  database: process.env.DB_NAME || 'exam_seating'
}).promise();

async function migrate() {
  try {
    console.log("Checking database...");

    // Create questions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'rating',
        is_required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Question table ready.");

    // Check if responses column exists in feedbacks (or feedback)
    // Looking at context and updateDB.js, the table name is 'feedbacks'
    const [columns] = await db.query("SHOW COLUMNS FROM feedbacks LIKE 'responses'");
    if (columns.length === 0) {
      await db.query("ALTER TABLE feedbacks ADD COLUMN responses JSON AFTER exam_id");
      console.log("Responses column added.");
    } else {
      console.log("Responses column already exists.");
    }

    // Insert default data if empty
    const [rows] = await db.query("SELECT COUNT(*) as count FROM feedback_questions");
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO feedback_questions (label, type) VALUES 
        ('Clear Instructions', 'rating'),
        ('Seat Comfort', 'rating'),
        ('Invigilation Quality', 'rating'),
        ('Hall Environment', 'rating'),
        ('Check-in Process', 'rating')
      `);
      console.log("Default questions inserted.");
    }

    console.log("Migration successful.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
