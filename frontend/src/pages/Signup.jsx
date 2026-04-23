import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Signup() {
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        college_name: collegeName,
        email,
        password,
      });

      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
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
          }}>Create Account</h2>
          <p style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            margin: 0
          }}>Join our platform to manage your exams.</p>
        </div>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "0.88rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginBottom: "7px",
            }}>College Name</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. Stanford University"
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
                outline: "none"
              }}
            />
          </div>

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
                outline: "none"
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
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#ccc" : "var(--gradient-button)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all var(--transition-smooth)",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)"
            }}
          >
            {loading ? "Creating Account..." : "Register College"}
          </button>
        </form>

        <div style={{
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-light)",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            Already have an account?
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.95rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all var(--transition-smooth)"
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
