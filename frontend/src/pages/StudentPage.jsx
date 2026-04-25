import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

/* ===== Mini Room Map Component for Students ===== */
function MiniRoomMap({ totalRows, totalCols, seatRow, seatCol, doorSide }) {
  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      background: "var(--bg-subtle)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-color)",
      textAlign: "center"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        {doorSide === "left" || !doorSide ? <div style={{ width: 30, height: 40, border: "2px solid var(--border-color)", borderLeft: "none", borderRadius: "0 6px 6px 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: "700", color: "var(--text-muted)", marginLeft: "-20px" }}><span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>DOOR</span></div> : <div style={{ width: 30 }} />}
        <div style={{
          display: "inline-block",
          padding: "5px 30px",
          background: "var(--bg-white)",
          border: "1px dashed var(--border-color)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-muted)",
          fontSize: "0.6rem",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "2px"
        }}>
          Front / Instructor Area
        </div>
        {doorSide === "right" ? <div style={{ width: 30, height: 40, border: "2px solid var(--border-color)", borderRight: "none", borderRadius: "6px 0 0 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: "700", color: "var(--text-muted)", marginRight: "-20px" }}><span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>DOOR</span></div> : <div style={{ width: 30 }} />}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${totalCols}, minmax(30px, 1fr))`,
        gap: "5px",
        maxWidth: "100%",
        margin: "0 auto"
      }}>
        {Array(totalRows).fill(null).map((_, ri) => (
          Array(totalCols).fill(null).map((_, ci) => {
            const isStudentSeat = (ri + 1 === seatRow) && (ci + 1 === seatCol);
            return (
              <div key={`${ri}-${ci}`} style={{
                height: "48px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isStudentSeat ? "var(--gradient-button)" : "var(--bg-subtle)",
                border: `1px solid ${isStudentSeat ? "var(--accent-primary)" : "var(--border-light)"}`,
                borderRadius: "6px",
                boxShadow: isStudentSeat ? "0 4px 12px rgba(79, 70, 229, 0.35)" : "none",
                position: "relative",
                transition: "all 0.3s ease",
                zIndex: isStudentSeat ? 2 : 1
              }}>
                {isStudentSeat && (
                  <div style={{
                    position: "absolute",
                    top: "-28px",
                    background: "var(--text-primary)",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: "800",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                    zIndex: 10
                  }}>
                    YOUR SEAT
                  </div>
                )}
                <span style={{
                  fontSize: isStudentSeat ? "0.75rem" : "0.7rem",
                  fontWeight: isStudentSeat ? "800" : "600",
                  color: isStudentSeat ? "#fff" : "var(--text-muted)",
                  opacity: isStudentSeat ? 1 : 0.6
                }}>
                  {ri + 1}{String.fromCharCode(65 + ci)}
                </span>
              </div>
            );
          })
        ))}
      </div>
      <p style={{ marginTop: "15px", fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
        Visual orientation of your seat in the room.
      </p>
    </div>
  );
}

function StudentPage() {
  const [query, setQuery] = useState("");
  const [seatData, setSeatData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [disambiguationOptions, setDisambiguationOptions] = useState(null);
  const [error, setError] = useState("");
  const [feedbackState, setFeedbackState] = useState({
    responses: {},
    comments: "",
    status: ""
  });
  const [questions, setQuestions] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/exams/timetable`)
      .then(res => setTimetable(res.data))
      .catch(err => console.error("Failed to load timetable"));

    axios.get(`${API_BASE_URL}/api/feedback/questions`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error("Failed to load feedback questions"));
  }, []);

  const handleSearch = async (specificRollNo = null) => {
    const searchQuery = specificRollNo || query;
    if (!searchQuery.trim()) {
      setError("Please enter a roll number or full name");
      return;
    }

    try {
      setError("");
      setDisambiguationOptions(null);
      const res = await axios.post(
        `${API_BASE_URL}/api/exams/student-seat`,
        { query: searchQuery }
      );
      setSeatData(res.data);
    } catch (err) {
      if (err.response?.status === 300) {
        setDisambiguationOptions(err.response.data.options);
      } else {
        setError("Seat not found for this input.");
        setSeatData(null);
      }
    }
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const raw = String(timeStr).trim().toUpperCase();
    const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (ampmMatch) {
      let hours = Number(ampmMatch[1]);
      const minutes = Number(ampmMatch[2]);
      const period = ampmMatch[3];
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    const h24Match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (h24Match) {
      const hours = Number(h24Match[1]);
      const minutes = Number(h24Match[2]);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return hours * 60 + minutes;
      }
    }
    return null;
  };

  const isExamPast = (examDateStr, examEndTimeStr) => {
    try {
      if (!examDateStr || !examEndTimeStr) return false;
      const dateParts = examDateStr.split("-").map(Number);
      if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) return false;
      const [year, month, day] = dateParts;
      const today = new Date();
      const examDay = new Date(year, month - 1, day);
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (todayOnly > examDay) return true;
      if (todayOnly < examDay) return false;
      const examEndMinutes = parseTimeToMinutes(examEndTimeStr);
      if (examEndMinutes === null) return false;
      const currentMinutes = today.getHours() * 60 + today.getMinutes();
      return currentMinutes > examEndMinutes;
    } catch (e) {
      return false;
    }
  };

  const submitFeedback = async (examId) => {
    const unanswered = questions.filter(q => q.is_required && !feedbackState.responses[q.label]);
    if (unanswered.length > 0) {
      setFeedbackState(prev => ({ ...prev, status: "error" }));
      return;
    }

    try {
      setFeedbackState(prev => ({ ...prev, status: "submitting" }));
      await axios.post(`${API_BASE_URL}/api/feedback`, {
        roll_no: seatData.roll_no,
        exam_id: examId,
        responses: feedbackState.responses,
        comments: feedbackState.comments
      });
      setFeedbackState(prev => ({ ...prev, status: "success" }));
    } catch (err) {
      if (err.response?.status === 409) {
        setFeedbackState(prev => ({ ...prev, status: "duplicate" }));
      } else {
        setFeedbackState(prev => ({ ...prev, status: "server_error" }));
      }
    }
  };

  const renderStars = (questionLabel, currentValue) => {
    return (
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setFeedbackState(prev => ({
              ...prev,
              responses: { ...prev.responses, [questionLabel]: star },
              status: ""
            }))}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
              color: star <= currentValue ? "#F59E0B" : "#D1D5DB",
              transition: "transform 0.2s ease, color 0.2s ease"
            }}
            onMouseEnter={e => e.target.style.transform = "scale(1.2)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const DetailItem = ({ label, value, accent }) => (
    <div style={{
      padding: "14px 16px",
      background: "var(--bg-subtle)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-light)",
    }}>
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: accent ? "1.3rem" : "1rem", color: accent ? "var(--accent-primary)" : "var(--text-primary)", fontWeight: "600" }}>{value}</div>
    </div>
  );

  return (
    <>
      <div style={{
        minHeight: "100vh",
        padding: "40px 20px",
        position: "relative",
        background: "linear-gradient(160deg, #F5F6FA 0%, #EEF0F7 50%, #F5F6FA 100%)",
        animation: "fadeInUp 0.6s ease-out forwards",
        display: "flex",
        alignItems: seatData ? "flex-start" : "center",
        justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          gap: "24px",
          maxWidth: seatData ? "1100px" : "520px",
          width: "100%",
          flexWrap: "wrap",
          justifyContent: "center",
          paddingTop: seatData ? "40px" : "0",
        }}>
          {/* Main Search / Results Card */}
          <div style={{
            flex: seatData ? "1 1 600px" : "1 1 100%",
            background: "var(--bg-white)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            padding: "44px 44px",
            boxShadow: "var(--shadow-lg)",
            maxWidth: seatData ? "660px" : "520px",
          }}>
            {seatData && (
              <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <div style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  color: "var(--accent-emerald)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}>✓ Seat Confirmed</div>
                <h2 style={{ margin: "0 0 10px 0", fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {seatData.student_name}
                </h2>
                <p style={{ margin: 0, fontSize: "1rem", color: "var(--accent-emerald)", fontWeight: "500" }}>
                  Good Luck for your exam!
                </p>
              </div>
            )}

            {!seatData && (
              <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <div style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  background: "var(--accent-primary-light)",
                  border: "1px solid rgba(79, 70, 229, 0.15)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.76rem",
                  fontWeight: "600",
                  color: "var(--accent-primary)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}>Exam Portal</div>
                <h2 style={{ margin: "0 0 10px 0", fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  Student Seat Locator
                </h2>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)" }}>
                  Enter your university roll number or full name.
                </p>
              </div>
            )}

            {!seatData && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "7px" }}>Roll Number or Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 104203 or John Doe"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    style={{
                      width: "100%", padding: "13px 16px", fontSize: "0.95rem", background: "var(--bg-input)",
                      border: "1px solid var(--border-color)", color: "var(--text-primary)",
                      borderRadius: "var(--radius-sm)", outline: "none", boxSizing: "border-box", transition: "var(--transition-fast)"
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.background = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; e.target.style.background = "var(--bg-input)"; }}
                  />
                </div>

                <button
                  onClick={() => handleSearch()}
                  style={{
                    width: "100%", padding: "14px", fontSize: "1rem", background: "var(--gradient-button)",
                    color: "#fff", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    fontWeight: "600", transition: "all var(--transition-smooth)", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.25)"; }}
                >
                  Check Seat Allocation
                </button>
              </>
            )}

            {error && (
              <div style={{ marginTop: "16px", padding: "14px 16px", background: "var(--accent-rose-light)", color: "var(--accent-rose)", borderRadius: "var(--radius-sm)", fontSize: "0.92rem", fontWeight: "500", border: "1px solid rgba(239, 68, 68, 0.2)", animation: "fadeInUp 0.3s ease-out forwards" }}>{error}</div>
            )}

            {disambiguationOptions && (
              <div style={{ marginTop: "16px", background: "var(--accent-primary-light)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(79, 70, 229, 0.15)", padding: "20px", animation: "fadeInUp 0.4s ease-out forwards" }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: "1.05rem", color: "var(--text-primary)" }}>Multiple matches found. Which one are you?</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {disambiguationOptions.map(opt => (
                    <button key={opt.roll_no} onClick={() => handleSearch(opt.roll_no)} style={{ padding: "12px 16px", background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", transition: "all var(--transition-fast)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.background = "var(--accent-primary-light)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "var(--bg-white)"; }}
                    ><strong>{opt.student_name}</strong> (Roll: {opt.roll_no})</button>
                  ))}
                </div>
              </div>
            )}

            {!seatData && timetable.length > 0 && !disambiguationOptions && (
              <div style={{ marginTop: "28px", paddingTop: "22px", borderTop: "1px solid var(--border-light)", animation: "fadeInUp 0.5s ease-out forwards" }}>
                <h3 style={{ margin: "0 0 14px 0", fontSize: "1.05rem", fontWeight: "600", color: "var(--text-primary)" }}>Upcoming Exam Schedule</h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  {timetable.map(exam => (
                    <div key={exam.id} style={{ padding: "13px 16px", background: "var(--bg-subtle)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all var(--transition-fast)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-primary-light)"; e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.borderColor = "var(--border-light)"; }}>
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.92rem" }}>{exam.exam_type}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "3px" }}>{exam.exam_date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "var(--accent-primary)", fontSize: "0.88rem", fontWeight: "600" }}>{exam.start_time}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>to {exam.end_time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seatData && seatData.exams && seatData.exams.map((exam, idx) => (
              <div key={exam.exam_id || idx} style={{ marginTop: idx === 0 ? "0" : "24px", padding: "22px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", animation: `fadeInUp 0.5s ease-out ${0.1 * idx}s both` }}>
                <div style={{ display: "grid", gap: "10px" }}>
                  <DetailItem label="Examination" value={exam.exam_type} />
                  <div className="grid-2-col" style={{ gap: "10px" }}>
                    <DetailItem label="Date" value={exam.exam_date} />
                    <DetailItem label="Time" value={`${exam.start_time} – ${exam.end_time}`} />
                  </div>
                  <DetailItem label="Room Number" value={exam.room_no} accent />
                  <div className="grid-2-col" style={{ gap: "10px" }}>
                    <DetailItem label="Seat Row" value={exam.seat_row} accent />
                    <DetailItem label="Seat Column" value={String.fromCharCode(64 + exam.seat_column)} accent />
                  </div>
                </div>

                {exam.total_rows && exam.total_columns && (
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "600", marginBottom: "10px" }}>Seat Location Map:</div>
                    <MiniRoomMap
                      totalRows={exam.total_rows}
                      totalCols={exam.total_columns}
                      seatRow={exam.seat_row}
                      seatCol={exam.seat_column}
                      doorSide={exam.door_side}
                    />
                  </div>
                )}

                {isExamPast(exam.exam_date, exam.raw_end_time || exam.end_time) ? (
                  <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--border-light)", animation: "fadeInUp 0.6s ease-out forwards" }}>
                    {exam.has_feedback ? (
                      <div style={{ padding: "16px", background: "var(--bg-subtle)", color: "var(--text-secondary)", borderRadius: "var(--radius-sm)", textAlign: "center", border: "1px solid var(--border-color)", fontWeight: "500" }}>✓ Feedback already submitted. Thank you!</div>
                    ) : feedbackState.status === "success" ? (
                      <div style={{ padding: "16px", background: "var(--accent-emerald-light)", color: "var(--accent-emerald)", borderRadius: "var(--radius-sm)", textAlign: "center", border: "1px solid rgba(16, 185, 129, 0.2)", fontWeight: "600" }}>Thank you for your feedback!</div>
                    ) : feedbackState.status === "duplicate" ? (
                      <div style={{ padding: "16px", background: "var(--accent-amber-light)", color: "#B45309", borderRadius: "var(--radius-sm)", textAlign: "center", border: "1px solid rgba(245, 158, 11, 0.2)" }}>You have already submitted feedback for this exam.</div>
                    ) : (
                      <button
                        onClick={() => {
                          setFeedbackState({ responses: {}, comments: "", status: "" });
                          setFeedbackModal(exam.exam_id);
                        }}
                        style={{ width: "100%", padding: "13px", background: "var(--bg-white)", color: "var(--accent-primary)", border: "1.5px solid var(--accent-primary)", borderRadius: "var(--radius-sm)", fontWeight: "600", cursor: "pointer", transition: "all var(--transition-smooth)", fontSize: "0.95rem" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--gradient-button)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "transparent"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-white)"; e.currentTarget.style.color = "var(--accent-primary)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                      >Give Exam Feedback</button>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: "18px", padding: "12px 16px", background: "var(--bg-subtle)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "0.85rem" }}>Feedback will unlock after the exam ends ({exam.end_time}).</div>
                )}
              </div>
            ))}

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-light)", textAlign: "center" }}>
              {seatData && (
                <button onClick={() => { setSeatData(null); setQuery(""); setError(""); setDisambiguationOptions(null); setFeedbackModal(null); }}
                  style={{ width: "100%", padding: "12px", marginBottom: "10px", background: "var(--gradient-button)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.95rem", fontWeight: "600", cursor: "pointer", transition: "all var(--transition-smooth)" }}
                  onMouseEnter={(e) => { e.target.style.filter = "brightness(1.05)"; }}
                  onMouseLeave={(e) => { e.target.style.filter = "brightness(1)"; }}
                >Search Again</button>
              )}
              <button onClick={() => navigate("/")} style={{ width: "100%", padding: "12px", fontSize: "0.95rem", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "500", transition: "all var(--transition-smooth)" }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = "var(--accent-primary-light)"; e.target.style.color = "var(--accent-primary)"; e.target.style.borderColor = "var(--accent-primary)"; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = "var(--bg-subtle)"; e.target.style.color = "var(--text-secondary)"; e.target.style.borderColor = "var(--border-color)"; }}
              >← Back to Home</button>
            </div>
          </div>

          {seatData && timetable.length > 0 && (
            <div style={{ flex: "1 1 280px", maxWidth: "360px", background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow-md)", alignSelf: "flex-start", animation: "fadeInUp 0.5s ease-out 0.2s both" }}>
              <h3 style={{ margin: "0 0 18px 0", fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>Upcoming Exams</h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {timetable.map(exam => (
                  <div key={exam.id} style={{ padding: "13px 16px", background: "var(--bg-subtle)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", transition: "all var(--transition-fast)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-primary-light)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-subtle)"; }}>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "5px" }}>{exam.exam_type}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{exam.exam_date}</span><span style={{ color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: "600" }}>{exam.start_time}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {feedbackModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out forwards", padding: "20px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setFeedbackModal(null); }}>
          <div style={{ background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)", padding: "36px", maxWidth: "520px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}><h2 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", fontWeight: "700", color: "var(--text-primary)" }}>Exam Feedback</h2><p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-muted)" }}>Rate your experience to help us improve.</p></div>
            <div style={{ display: "grid", gap: "16px" }}>
              {questions.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No feedback categories available yet.</div>
              ) : (
                questions.map(q => (
                  <div key={q.id || q.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.9rem", flex: 1, marginRight: "12px" }}>
                      {q.label} {q.is_required && <span style={{ color: "var(--accent-rose)" }}>*</span>}
                    </span>
                    {renderStars(q.label, feedbackState.responses[q.label] || 0)}
                  </div>
                ))
              )}
              <textarea placeholder="Any additional comments? (optional)" value={feedbackState.comments} onChange={e => setFeedbackState(prev => ({ ...prev, comments: e.target.value }))}
                style={{ width: "100%", padding: "13px", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", minHeight: "80px", resize: "vertical", fontSize: "0.92rem", fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" }} />
              {feedbackState.status === "error" && (<div style={{ color: "var(--accent-rose)", fontSize: "0.85rem", fontWeight: "500" }}>Please rate all required fields.</div>)}
              {feedbackState.status === "duplicate" && (<div style={{ color: "#B45309", fontSize: "0.85rem", fontWeight: "500" }}>Feedback already submitted.</div>)}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button onClick={() => submitFeedback(feedbackModal)} disabled={feedbackState.status === "submitting"}
                  style={{ flex: 1, padding: "13px", background: "var(--gradient-button)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: "600", cursor: "pointer", fontSize: "0.95rem", transition: "all var(--transition-smooth)", opacity: feedbackState.status === "submitting" ? 0.6 : 1 }}
                >{feedbackState.status === "submitting" ? "Sending..." : "Submit Feedback"}</button>
                <button onClick={() => setFeedbackModal(null)} style={{ padding: "13px 20px", background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "500", fontSize: "0.95rem", transition: "all var(--transition-fast)" }}
                  onMouseEnter={(e) => { e.target.style.background = "var(--accent-primary-light)"; e.target.style.color = "var(--accent-primary)"; }}
                  onMouseLeave={(e) => { e.target.style.background = "var(--bg-subtle)"; e.target.style.color = "var(--text-secondary)"; }}
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentPage;
