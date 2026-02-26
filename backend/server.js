const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const roomRoutes = require("./routes/roomRoutes");
const examRoutes = require("./routes/examRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const app = express();


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/pdf", pdfRoutes);
app.get("/", (req, res) => {
  res.send("AutoSeatX Backend Running 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});