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

  const alterTableQueries = [
    "ALTER TABLE feedbacks ADD COLUMN clear_instructions INT NOT NULL DEFAULT 3 AFTER exam_id;",
    "ALTER TABLE feedbacks ADD COLUMN checkin_process INT NOT NULL DEFAULT 3 AFTER hall_environment;",
    "ALTER TABLE feedbacks ADD COLUMN student_year VARCHAR(50) DEFAULT 'Unknown Year' AFTER student_name;" // student_name might not exist if it's purely a join, let me check the existing table.
  ];

  // Actually, checking updateDB.js, the table only has roll_no, exam_id, seat_comfort, invigilation, hall_environment, comments, created_at.
  // There is NO student_name column in the feedbacks table, it's fetched via JOIN in the controller.
  
  const correctAlterQueries = [
    "ALTER TABLE feedbacks ADD COLUMN clear_instructions INT NOT NULL DEFAULT 3 AFTER exam_id;",
    "ALTER TABLE feedbacks ADD COLUMN checkin_process INT NOT NULL DEFAULT 3 AFTER hall_environment;",
    "ALTER TABLE feedbacks ADD COLUMN student_year VARCHAR(50) DEFAULT 'Unknown Year';"
  ];

  /* Let's execute sequentially */
  const executeQuery = (index) => {
    if (index >= correctAlterQueries.length) {
      console.log("Feedbacks table successfully altered");
      db.end();
      process.exit(0);
      return;
    }

    db.query(correctAlterQueries[index], (err) => {
      if (err) {
        // Ignore duplicate column errors, just print and continue.
        if (err.code === 'ER_DUP_FIELDNAME') {
           console.log(`Column already exists: ${correctAlterQueries[index]}`);
           executeQuery(index + 1);
        } else {
           console.error("Error altering feedbacks table:", err);
           db.end();
           process.exit(1);
        }
      } else {
        console.log(`Executed: ${correctAlterQueries[index]}`);
        executeQuery(index + 1);
      }
    });
  };

  executeQuery(0);

});
