const db = require('./config/db');

const queries = [
  // Fix seating_allocations
  "ALTER TABLE seating_allocations DROP FOREIGN KEY seating_allocations_ibfk_1",
  "ALTER TABLE seating_allocations DROP FOREIGN KEY seating_allocations_ibfk_2",
  "ALTER TABLE seating_allocations ADD CONSTRAINT seating_allocations_ibfk_1 FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE",
  "ALTER TABLE seating_allocations ADD CONSTRAINT seating_allocations_ibfk_2 FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE",

  // Fix students
  "ALTER TABLE students DROP FOREIGN KEY students_ibfk_1",
  "ALTER TABLE students ADD CONSTRAINT students_ibfk_1 FOREIGN KEY (dataset_id) REFERENCES student_datasets(id) ON DELETE CASCADE",

  // Fix exams (Note: wait, exams might not have FK on dataset_id in the original schema depending on when it was added, but let's try)
  // "ALTER TABLE exams DROP FOREIGN KEY exams_ibfk_1",
  // "ALTER TABLE exams ADD CONSTRAINT exams_ibfk_1 FOREIGN KEY (dataset_id) REFERENCES student_datasets(id) ON DELETE SET NULL",
];

async function runQueries() {
  for (let q of queries) {
    try {
      await new Promise((resolve, reject) => {
        db.query(q, (err) => {
          if (err) {
            console.log("Skipping/Error on query:", q, "Error:", err.message);
          } else {
            console.log("Success:", q);
          }
          resolve(); 
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
  
  // Try feedbacks manually since the name might be different or not exist
  await new Promise((resolve) => {
    db.query("ALTER TABLE feedbacks DROP FOREIGN KEY feedbacks_ibfk_1", (err) => { resolve(); });
  });
  await new Promise((resolve) => {
    db.query("ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_ibfk_1 FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE", (err) => { resolve(); });
  });

  console.log("Migration finished.");
  process.exit();
}

runQueries();
