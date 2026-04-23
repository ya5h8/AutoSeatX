const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

exports.generatePDF = (req, res) => {
  const { exam_id } = req.body;

  db.query(
    `SELECT e.exam_type, e.admin_id, DATE_FORMAT(e.exam_date, '%Y-%m-%d') as exam_date, 
     DATE_FORMAT(e.start_time, '%h:%i %p') as start_time, 
     DATE_FORMAT(e.end_time, '%h:%i %p') as end_time,
     a.college_name
     FROM exams e 
     JOIN admin a ON e.admin_id = a.id
     WHERE e.id = ? AND e.admin_id = ?`,
    [exam_id, req.user.id],
    (err, examInfo) => {
      if (err) return res.status(500).json(err);
      if (examInfo.length === 0) return res.status(403).json({ message: "Exam not found or access denied" });

      const exam = examInfo[0];

      db.query(
        `SELECT sa.*, r.room_no, r.total_rows, r.total_columns, r.door_side, s.branch
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
                drawRoom(doc, currentRoom, roomData, exam, exam.college_name);
                doc.addPage();
              }
              currentRoom = row.room_no;
              roomData = [];
            }

            roomData.push(row);

            if (index === results.length - 1) {
              drawRoom(doc, currentRoom, roomData, exam, exam.college_name);
            }
          });

          doc.end();
          res.json({ message: "PDF Generated", fileName });
        }
      );
    }
  );
};


function drawRoom(doc, roomNo, data, exam, collegeName) {
  const branches = [...new Set(data.map(d => d.branch))];
  const department = branches.length === 1 ? branches[0] : branches.join(', ');

  const PAGE_W = doc.page.width;
  const PAGE_H = doc.page.height;
  const MARGIN = 40;
  const SIG_H = 50;   // fixed space reserved at bottom for signatures
  const USABLE_W = PAGE_W - MARGIN * 2;

  // ── Header ──────────────────────────────────────────
  doc.fontSize(16).font('Helvetica-Bold')
    .text(collegeName || "AutoSeatX Seating Arrangement", MARGIN, MARGIN, { width: USABLE_W, align: "center" });
  doc.fontSize(11).font('Helvetica')
    .text(`Department of ${department}`, { width: USABLE_W, align: "center" });
  doc.moveDown(0.4);
  doc.fontSize(13).font('Helvetica-Bold')
    .text("SEATING ARRANGEMENT", { width: USABLE_W, align: "center" });
  doc.moveDown(0.6);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Room No: ${roomNo}`, MARGIN, doc.y, { continued: true, width: USABLE_W / 2 });
  doc.text(`Exam: ${exam.exam_type}`, { align: "right" });
  doc.text(`Date: ${exam.exam_date}`, MARGIN, doc.y, { continued: true, width: USABLE_W / 2 });
  doc.text(`Time: ${exam.start_time} - ${exam.end_time}`, { align: "right" });
  doc.moveDown(0.4);
  doc.text(`Total Students: ${data.length}`, MARGIN);
  doc.moveDown(0.6);

  // ── Grid dimensions ─────────────────────────────────
  const maxRow = data[0].total_rows || Math.max(...data.map(d => d.seat_row));
  const maxCol = data[0].total_columns || Math.max(...data.map(d => d.seat_column));

  const headerBottom = doc.y;
  const FRONT_LABEL_H = 28; // space for "FRONT / INSTRUCTOR AREA" + col letters

  // Available height for the grid itself
  const availH = PAGE_H - headerBottom - FRONT_LABEL_H - SIG_H - MARGIN;
  const availW = USABLE_W - 60; // leave room for DOOR label on sides

  // Scale cell size to fit
  let cellW = Math.min(100, availW / maxCol);
  let cellH = Math.min(35, availH / maxRow);

  // Keep cells square-ish but constrain further if needed
  cellW = Math.min(cellW, availW / maxCol);
  cellH = Math.min(cellH, availH / maxRow);

  const gridW = maxCol * cellW;
  const gridH = maxRow * cellH;
  const startX = (PAGE_W - gridW) / 2;

  // ── FRONT label & DOOR label ─────────────────────────
  const frontLabelY = headerBottom;
  const doorSide = data[0].door_side || 'left';

  doc.fontSize(9).font('Helvetica-Bold')
    .text("FRONT / INSTRUCTOR AREA", startX, frontLabelY, { width: gridW, align: 'center' });

  if (doorSide === 'left') {
    doc.text("<< DOOR", startX - 55, frontLabelY);
  } else {
    doc.text("DOOR >>", startX + gridW + 5, frontLabelY);
  }

  // Column letters
  const colLetterY = frontLabelY + 14;
  for (let c = 0; c < maxCol; c++) {
    doc.fontSize(9).font('Helvetica-Bold')
      .text(String.fromCharCode(65 + c), startX + c * cellW, colLetterY, { width: cellW, align: 'center' });
  }

  // ── Seat grid ────────────────────────────────────────
  const startY = colLetterY + 14;
  const seatFontSize = Math.max(6, Math.min(10, cellH * 0.38));

  // Draw empty grid first
  for (let r = 0; r < maxRow; r++) {
    for (let c = 0; c < maxCol; c++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      doc.rect(x, y, cellW, cellH).stroke();
    }
  }

  // Fill allocated seats
  data.forEach(seat => {
    const x = startX + (seat.seat_column - 1) * cellW;
    const y = startY + (seat.seat_row - 1) * cellH;
    const rollStr = String(seat.roll_no);
    doc.fontSize(seatFontSize).font('Helvetica')
      .text(rollStr, x, y + (cellH / 2) - (seatFontSize / 2) + 1, { width: cellW, align: 'center' });
  });

  // ── Signatures — always at a fixed position from bottom ──
  const sigY = PAGE_H - MARGIN - SIG_H + 10;
  doc.fontSize(10).font('Helvetica');
  doc.text("Invigilator Signature: ____________________", MARGIN, sigY);
  doc.text("HOD Signature: ____________________", PAGE_W / 2 + 20, sigY);
}

