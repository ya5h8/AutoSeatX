const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

exports.generatePDF = (req, res) => {
  const { exam_id } = req.body;

  db.query(
    `SELECT e.exam_type, DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date, 
     DATE_FORMAT(e.start_time, '%h:%i %p') as start_time, 
     DATE_FORMAT(e.end_time, '%h:%i %p') as end_time
     FROM exams e WHERE e.id = ?`,
    [exam_id],
    (err, examInfo) => {
      if (err) return res.status(500).json(err);
      if (examInfo.length === 0) return res.status(400).json({ message: "Exam not found" });

      const exam = examInfo[0];

      db.query(
        `SELECT sa.*, r.room_no, r.total_rows, r.total_columns, s.branch
         FROM seating_allocations sa
         JOIN rooms r ON sa.room_id = r.id
         JOIN students s ON sa.roll_no = s.roll_no
         WHERE sa.exam_id = ?
         ORDER BY r.room_no, sa.seat_row, sa.seat_column`,
        [exam_id],
        (err, results) => {
          if (err) return res.status(500).json(err);
          if (results.length === 0)
            return res.status(400).json({ message: "No seating data found" });

          const fileName = `Seating_Exam_${exam_id}.pdf`;
          const filePath = path.join(__dirname, "../uploads", fileName);

          const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
          doc.pipe(fs.createWriteStream(filePath));

          let currentRoom = "";
          let roomData = [];

          results.forEach((row, index) => {
            if (currentRoom !== row.room_no) {
              if (roomData.length > 0) {
                drawRoom(doc, currentRoom, roomData, exam);
                doc.addPage();
              }
              currentRoom = row.room_no;
              roomData = [];
            }

            roomData.push(row);

            if (index === results.length - 1) {
              drawRoom(doc, currentRoom, roomData, exam);
            }
          });

          doc.end();
          res.json({ message: "PDF Generated", fileName });
        }
      );
    }
  );
};

function drawRoom(doc, roomNo, data, exam) {
  const branches = [...new Set(data.map(d => d.branch))];
  const department = branches.length === 1 ? branches[0] : branches.join(', ');

  doc.fontSize(18).font('Helvetica-Bold').text("P. R. Pote Patil College of Engineering & Management", { align: "center" });
  doc.fontSize(12).font('Helvetica').text(`Department of ${department}`, { align: "center" });
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text("SEATING ARRANGEMENT", { align: "center" });
  doc.moveDown();

  const leftX = 60;
  const rightX = 500;
  doc.fontSize(11).font('Helvetica');
  doc.text(`Room No: ${roomNo}`, leftX, doc.y, { continued: true });
  doc.text(`Exam: ${exam.exam_type}`, rightX, doc.y, { align: "right" });
  doc.text(`Date: ${exam.exam_date}`, leftX, doc.y, { continued: true });
  doc.text(`Time: ${exam.start_time} - ${exam.end_time}`, rightX, doc.y, { align: "right" });
  doc.moveDown();

  doc.fontSize(10).text(`Total Students: ${data.length}`, leftX, doc.y);
  doc.moveDown(2);

  const cellWidth = 100;
  const cellHeight = 35;
  let maxRow = Math.max(...data.map(d => d.seat_row));
  let maxCol = Math.max(...data.map(d => d.seat_column));

  const gridWidth = maxCol * cellWidth;
  const startX = (doc.page.width - gridWidth) / 2;
  const startY = doc.y + 30;

  doc.fontSize(10).font('Helvetica-Bold').text("Door Side →", startX, doc.y);
  doc.moveDown();

  for (let c = 0; c < maxCol; c++) {
    const colLetter = String.fromCharCode(65 + c);
    doc.fontSize(12).font('Helvetica-Bold').text(colLetter, startX + c * cellWidth + 40, startY - 20);
  }

  data.forEach(seat => {
    const x = startX + (seat.seat_column - 1) * cellWidth;
    const y = startY + (seat.seat_row - 1) * cellHeight;

    doc.rect(x, y, cellWidth, cellHeight).stroke();
    doc.fontSize(10).font('Helvetica').text(seat.roll_no, x + 10, y + 12, { width: cellWidth - 20, align: 'center' });
  });

  const bottomY = startY + maxRow * cellHeight + 40;
  doc.fontSize(10).font('Helvetica');
  doc.text("Invigilator Signature: ____________________", 60, bottomY, { continued: false });
  doc.text("HOD Signature: ____________________", 500, bottomY, { continued: false });
}
