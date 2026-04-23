import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("college_name", res.data.college_name);
      navigate("/dashboard");

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      background: "linear-gradient(160deg, #F5F6FA 0%, #EEF0F7 50%, #F5F6FA 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "var(--bg-white)",
        border: "1px solid var(--border-color)",
        padding: "48px 52px",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-lg)",
        width: "100%",
        maxWidth: "440px",
        animation: "fadeInUp 0.6s ease-out forwards",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <span style={{
            fontSize: "2rem",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            color: "var(--text-primary)",
          }}>
            Auto<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Seat</span>X
          </span>
        </div>

        <div style={{ marginBottom: "36px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "1.6rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "8px"
          }}>Welcome Back</h2>
          <p style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            margin: 0
          }}>Sign in to your administration account.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginBottom: "7px",
            }}>Faculty Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              required
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.95rem",
                color: "var(--text-primary)",
                boxSizing: "border-box",
                transition: "var(--transition-fast)",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent-primary)";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.background = "var(--bg-input)";
              }}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginBottom: "7px",
            }}>Portal Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.95rem",
                color: "var(--text-primary)",
                boxSizing: "border-box",
                transition: "var(--transition-fast)",
                outline: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent-primary)";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.background = "var(--bg-input)";
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "var(--gradient-button)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all var(--transition-smooth)",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.25)";
            }}
          >
            Access Portal
          </button>
        </form>

        <div style={{
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-light)",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            Don't have a portal account?
          </p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--accent-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all var(--transition-smooth)",
              marginBottom: "12px"
            }}
          >
            Request Admin Access
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;