const db = require("../config/db");
const xlsx = require("xlsx");

exports.uploadStudents = (req, res) => {
  const datasetName = req.body.datasetName;
  const filePath = req.file.path;

  if (!datasetName || !req.file) {
    return res.status(400).json({ message: "Dataset name and file required" });
  }

  // Insert dataset first
  db.query(
    "INSERT INTO student_datasets (dataset_name) VALUES (?)",
    [datasetName],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const datasetId = result.insertId;
      console.log("Dataset created with ID:", datasetId);

      // Read Excel
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      console.log("Students to insert:", data.length);

      if (data.length === 0) {
        return res.status(400).json({ message: "No data found in file" });
      }

      let totalInserted = 0;
      let completed = 0;

      data.forEach((student, index) => {
        const { roll_no, name, branch, year } = student;

        db.query(
          "INSERT INTO students (roll_no, name, branch, year, dataset_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE dataset_id = ?, name = ?, branch = ?, year = ?",
          [roll_no, name, branch, year, datasetId, datasetId, name, branch, year],
          (err) => {
            if (err) console.error("Insert error:", err);
            if (!err) totalInserted++;
            completed++;
            
            if (completed === data.length) {
              console.log("Total inserted:", totalInserted);
              // Update total_students
              db.query(
                "UPDATE student_datasets SET total_students = ? WHERE id = ?",
                [totalInserted, datasetId],
                () => {
                  res.json({
                    message: "Students uploaded successfully",
                    total: totalInserted
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
  db.query("SELECT * FROM student_datasets", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.deleteDataset = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM students WHERE dataset_id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);

    db.query("DELETE FROM student_datasets WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Dataset deleted successfully" });
    });
  });
};