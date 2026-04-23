const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { generateSeating, saveExam, getExams, deleteExam, getStudentSeat, getUpcomingTimetable } = require("../controllers/examController");

router.post("/generate", authMiddleware, generateSeating);
router.post("/save", authMiddleware, saveExam);
router.get("/", authMiddleware, getExams);
router.get("/timetable", getUpcomingTimetable);
router.delete("/:id", authMiddleware, deleteExam);
router.post("/student-seat", getStudentSeat);

module.exports = router;