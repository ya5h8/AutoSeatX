import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentPage() {
  const [rollNo, setRollNo] = useState("");
  const [seatData, setSeatData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!rollNo.trim()) {
      setError("Please enter a roll number");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/exams/student-seat",
        { roll_no: rollNo }
      );

      setSeatData(res.data);
      setError("");
    } catch (err) {
      setError("Seat not found for this roll number");
      setSeatData(null);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "50px 60px",
        maxWidth: "550px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ marginBottom: "35px" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "32px", fontWeight: "700", color: "#1a1a1a" }}>
            Student Seat Lookup
          </h2>
          <p style={{ margin: 0, fontSize: "15px", color: "#666" }}>
            Enter your roll number to find your exam seat
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "8px"
          }}>Roll Number</label>
          <input
            type="text"
            placeholder="Enter your roll number"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "15px",
              border: "2px solid #e1e8ed",
              borderRadius: "10px",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2a5298"}
            onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
          />
        </div>

        <button 
          onClick={handleSearch}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            background: "#2a5298",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#1e3c72"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#2a5298"}
        >
          Search Seat
        </button>

        {error && (
          <div style={{
            marginTop: "20px",
            padding: "16px",
            background: "#fee",
            color: "#c33",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #fcc"
          }}>
            {error}
          </div>
        )}

        {seatData && (
          <div style={{
            marginTop: "30px",
            padding: "25px",
            background: "#f8f9fa",
            borderRadius: "12px",
            border: "2px solid #2a5298"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "600", color: "#2a5298" }}>
              Your Seat Details
            </h3>
            
            <div style={{ display: "grid", gap: "15px" }}>
              <div style={{
                padding: "12px 16px",
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e1e8ed"
              }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>EXAM</div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: "600" }}>{seatData.exam_type}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{
                  padding: "12px 16px",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #e1e8ed"
                }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>DATE</div>
                  <div style={{ fontSize: "15px", color: "#1a1a1a", fontWeight: "600" }}>{seatData.exam_date}</div>
                </div>

                <div style={{
                  padding: "12px 16px",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #e1e8ed"
                }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>TIME</div>
                  <div style={{ fontSize: "15px", color: "#1a1a1a", fontWeight: "600" }}>{seatData.start_time} - {seatData.end_time}</div>
                </div>
              </div>

              <div style={{
                padding: "12px 16px",
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e1e8ed"
              }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>ROOM NUMBER</div>
                <div style={{ fontSize: "16px", color: "#1a1a1a", fontWeight: "600" }}>{seatData.room_no}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{
                  padding: "12px 16px",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #e1e8ed"
                }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>SEAT ROW</div>
                  <div style={{ fontSize: "18px", color: "#2a5298", fontWeight: "700" }}>{seatData.seat_row}</div>
                </div>

                <div style={{
                  padding: "12px 16px",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid #e1e8ed"
                }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>SEAT COLUMN</div>
                  <div style={{ fontSize: "18px", color: "#2a5298", fontWeight: "700" }}>{String.fromCharCode(64 + seatData.seat_column)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            marginTop: "25px",
            padding: "14px",
            fontSize: "15px",
            background: "#f8f9fa",
            color: "#2a5298",
            border: "2px solid #2a5298",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#2a5298";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#f8f9fa";
            e.target.style.color = "#2a5298";
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default StudentPage;
