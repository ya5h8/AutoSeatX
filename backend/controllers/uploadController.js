const db = require("../config/db");
const xlsx = require("xlsx");

// Normalize year values like "3rd", "Third Year", "3" → 3
function normalizeYear(val) {
  if (!val) return val;
  const str = String(val).trim().toLowerCase();
  const wordMap = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
  for (const [word, num] of Object.entries(wordMap)) {
    if (str.includes(word)) return num;
  }
  // Strip ordinal suffixes: 1st, 2nd, 3rd, 4th
  const numeric = parseInt(str.replace(/(st|nd|rd|th)/gi, ""));
  return isNaN(numeric) ? val : numeric;
}

exports.uploadStudents = (req, res) => {
  const datasetName = req.body.datasetName;
  const filePath = req.file.path;

  if (!datasetName || !req.file) {
    return res.status(400).json({ message: "Dataset name and file required" });
  }

  // Insert dataset first
  db.query(
    "INSERT INTO student_datasets (dataset_name, admin_id) VALUES (?, ?)",
    [datasetName, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const datasetId = result.insertId;
      console.log(`Dataset created with ID: ${datasetId}`);

      // Read Excel
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      // Normalize keys: trim whitespace and lowercase
      const normalizedData = data.map(row => {
        const newRow = {};
        for (let key in row) {
          newRow[key.trim().toLowerCase()] = row[key];
        }
        return newRow;
      });

      // Filter out empty rows
      const validData = normalizedData.filter(row => row.roll_no && String(row.roll_no).trim() !== "");

      console.log("Students to insert:", validData.length);

      if (validData.length === 0) {
        return res.status(400).json({ message: "No data found in file" });
      }

      let errorCount = 0;
      let completed = 0;

      validData.forEach((student, index) => {
        const { roll_no, name, branch, year } = student;
        const normalizedYear = normalizeYear(year);

        db.query(
          "INSERT INTO students (roll_no, name, branch, year, dataset_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE dataset_id = ?, name = ?, branch = ?, year = ?",
          [roll_no, name, branch, normalizedYear, datasetId, datasetId, name, branch, normalizedYear],
          (err) => {
            if (err) { console.error("Insert error:", err); errorCount++; }
            completed++;

            if (completed === validData.length) {
              const totalUpserted = validData.length - errorCount;
              console.log(`Upload complete. Total students upserted: ${totalUpserted}`);
              // Update total_students
              db.query(
                "UPDATE student_datasets SET total_students = ? WHERE id = ?",
                [totalUpserted, datasetId],
                () => {
                  res.json({
                    message: "Students uploaded successfully",
                    total: totalUpserted
                  });
                }
              );
            }
          }
        );
      });
    }
  );
};

exports.getDatasets = (req, res) => {
  db.query("SELECT * FROM student_datasets WHERE admin_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.deleteDataset = (req, res) => {
  const { id } = req.params;

  // 1. Delete feedbacks for students in this dataset (Verify dataset belongs to admin)
  db.query(
    "DELETE f FROM feedbacks f JOIN students s ON f.roll_no = s.roll_no JOIN student_datasets sd ON s.dataset_id = sd.id WHERE sd.id = ? AND sd.admin_id = ?",
    [id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete associated feedbacks", details: err });

      // 2. Delete seating allocations for students in this dataset
      db.query(
        "DELETE sa FROM seating_allocations sa JOIN students s ON sa.roll_no = s.roll_no JOIN student_datasets sd ON s.dataset_id = sd.id WHERE sd.id = ? AND sd.admin_id = ?",
        [id, req.user.id],
        (err) => {
          if (err) return res.status(500).json({ error: "Failed to delete associated seat allocations", details: err });

          // 3. Delete the students
          db.query(
            "DELETE s FROM students s JOIN student_datasets sd ON s.dataset_id = sd.id WHERE sd.id = ? AND sd.admin_id = ?", 
            [id, req.user.id], 
            (err) => {
              if (err) return res.status(500).json({ error: "Failed to delete students", details: err });

              // 4. Delete the dataset
              db.query("DELETE FROM student_datasets WHERE id = ? AND admin_id = ?", [id, req.user.id], (err) => {
                if (err) return res.status(500).json({ error: "Failed to delete dataset", details: err });
                res.json({ message: "Dataset deleted successfully" });
              });
            }
          );
        }
      );
    }
  );
};