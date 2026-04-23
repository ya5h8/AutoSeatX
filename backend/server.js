const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const roomRoutes = require("./routes/roomRoutes");
const examRoutes = require("./routes/examRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const app = express();

// CORS: allow local dev and production frontend (Cloudflare Pages)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // set this in Render env vars to your Cloudflare Pages URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/feedback", feedbackRoutes);
app.get("/", (req, res) => {
  res.send("AutoSeatX Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});