const express = require("express");
const router = express.Router();
const { loginAdmin, signupAdmin } = require("../controllers/authController");

router.post("/login", loginAdmin);
router.post("/signup", signupAdmin);

module.exports = router;