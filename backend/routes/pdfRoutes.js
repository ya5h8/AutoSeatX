const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { generatePDF } = require("../controllers/pdfController");

router.post("/generate", authMiddleware, generatePDF);

module.exports = router;
