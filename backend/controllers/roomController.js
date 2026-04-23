const db = require("../config/db");

// Add Room
exports.addRoom = (req, res) => {
  const { room_no, total_rows, total_columns, door_side, floor_no } = req.body;

  if (!room_no || !total_rows || !total_columns || !door_side || !floor_no) {
    return res.status(400).json({ message: "All fields required" });
  }

  const floorNum = parseInt(floor_no);
  if (isNaN(floorNum) || floorNum < 1) {
    return res.status(400).json({ message: "Floor number must be 1 or higher" });
  }

  const capacity = total_rows * total_columns;

  db.query(
    "INSERT INTO rooms (room_no, total_rows, total_columns, capacity, door_side, floor_no, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [room_no, total_rows, total_columns, capacity, door_side, floorNum, req.user.id],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(400).json({ message: "Room already exists in your college" });
        }
        console.log(err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "Room added successfully" });
    }
  );
};

// Get All Rooms
exports.getRooms = (req, res) => {
  db.query("SELECT * FROM rooms WHERE admin_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Delete Room
exports.deleteRoom = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE sa FROM seating_allocations sa JOIN rooms r ON sa.room_id = r.id WHERE r.id = ? AND r.admin_id = ?", 
    [id, req.user.id], 
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete associated seat allocations", details: err });

      db.query("DELETE FROM rooms WHERE id = ? AND admin_id = ?", [id, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: "Failed to delete room", details: err });
        res.json({ message: "Room deleted successfully" });
      });
    }
  );
};