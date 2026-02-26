const db = require("../config/db");

// Add Room
exports.addRoom = (req, res) => {
  const { room_no, total_rows, total_columns } = req.body;

  if (!room_no || !total_rows || !total_columns) {
    return res.status(400).json({ message: "All fields required" });
  }

  const capacity = total_rows * total_columns;

  db.query(
    "INSERT INTO rooms (room_no, total_rows, total_columns, capacity) VALUES (?, ?, ?, ?)",
    [room_no, total_rows, total_columns, capacity],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Room already exists" });
      }

      res.json({ message: "Room added successfully" });
    }
  );
};

// Get All Rooms
exports.getRooms = (req, res) => {
  db.query("SELECT * FROM rooms", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Delete Room
exports.deleteRoom = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM rooms WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Room deleted successfully" });
  });
};