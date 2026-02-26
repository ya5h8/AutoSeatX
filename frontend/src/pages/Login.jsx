import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif"
    }}>
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "50px 60px",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          width: "450px",
          maxWidth: "100%"
        }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: "8px"
            }}>Welcome Back</h1>
            <p style={{
              fontSize: "15px",
              color: "#666",
              margin: 0
            }}>Sign in to AutoSeatX Admin Portal</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "8px"
              }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "2px solid #e1e8ed",
                  borderRadius: "10px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  transition: "all 0.3s",
                  outline: "none"
                }}
                onFocus={(e) => e.target.style.borderColor = "#2a5298"}
                onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "8px"
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "2px solid #e1e8ed",
                  borderRadius: "10px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  transition: "all 0.3s",
                  outline: "none"
                }}
                onFocus={(e) => e.target.style.borderColor = "#2a5298"}
                onBlur={(e) => e.target.style.borderColor = "#e1e8ed"}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#2a5298",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#1e3c72"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#2a5298"}
            >
              Sign In
            </button>
          </form>

          <div style={{
            marginTop: "30px",
            paddingTop: "25px",
            borderTop: "1px solid #e1e8ed",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>Are you a student?</p>
            <button
              onClick={() => navigate("/student")}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#f8f9fa",
                color: "#2a5298",
                border: "2px solid #2a5298",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
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
              Check Your Seat
            </button>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: "40px"
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "700",
          marginBottom: "20px",
          textAlign: "center"
        }}>AutoSeatX</h1>
        <p style={{
          fontSize: "20px",
          textAlign: "center",
          maxWidth: "500px",
          lineHeight: "1.6",
          opacity: 0.9
        }}>Automated Exam Seating Management System - Streamline your exam hall allocation process with intelligent seat assignment</p>
      </div>
    </div>
  );
}

export default Login;