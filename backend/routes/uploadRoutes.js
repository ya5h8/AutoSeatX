const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadStudents, getDatasets, deleteDataset } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV or Excel files are allowed"), false);
    }
  }
});

router.post("/students", authMiddleware, upload.single("file"), uploadStudents);
router.get("/datasets", authMiddleware, getDatasets);
router.delete("/datasets/:id", authMiddleware, deleteDataset);

module.exports = router;