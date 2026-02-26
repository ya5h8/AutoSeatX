const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addRoom, getRooms, deleteRoom } = require("../controllers/roomController");

router.post("/", authMiddleware, addRoom);
router.get("/", authMiddleware, getRooms);
router.delete("/:id", authMiddleware, deleteRoom);

module.exports = router;