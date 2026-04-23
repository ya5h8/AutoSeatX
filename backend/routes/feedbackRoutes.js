const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { 
  submitFeedback, 
  getFeedbacks, 
  getQuestions, 
  saveQuestions 
} = require("../controllers/feedbackController");

router.post("/", submitFeedback);
router.get("/", authMiddleware, getFeedbacks);
router.get("/questions", getQuestions);
router.post("/questions", authMiddleware, saveQuestions);

module.exports = router;
