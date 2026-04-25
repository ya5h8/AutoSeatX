import { useNavigate } from "react-router-dom";

function Gateway() {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Students", value: "2,500+", color: "#4F46E5" },
    { label: "Rooms Managed", value: "40+", color: "#0EA5E9" },
    { label: "Exams Scheduled", value: "120+", color: "#10B981" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      background: "linear-gradient(160deg, #F5F6FA 0%, #EEF0F7 50%, #F5F6FA 100%)",
      animation: "fadeInUp 0.6s ease-out forwards",
    }}>
      {/* Subtle decorative shapes */}
      <div style={{
        position: "fixed", top: "-120px", right: "-80px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79, 70, 229, 0.04) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-150px", left: "-100px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem", zIndex: 2, maxWidth: "600px" }}>
        <div style={{
          display: "inline-block",
          padding: "6px 16px",
          background: "var(--accent-primary-light)",
          border: "1px solid rgba(79, 70, 229, 0.15)",
          borderRadius: "var(--radius-pill)",
          fontSize: "0.78rem",
          fontWeight: "600",
          color: "var(--accent-primary)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "20px",
        }}>
          Smart Seat Allocation
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
          fontWeight: "800",
          marginBottom: "16px",
          color: "var(--text-primary)",
          lineHeight: "1.1",
          letterSpacing: "-0.03em",
        }}>
          Auto<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Seat</span>X
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto", lineHeight: "1.7" }}>
          College exam seat allocation made effortless. Find your seat, manage rooms, and organize exams — all in one place.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="responsive-button-group" style={{ zIndex: 2, marginBottom: "3rem" }}>
        <button
          onClick={() => navigate("/student")}
          style={{
            padding: "15px 36px",
            background: "var(--gradient-button)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all var(--transition-smooth)",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(79, 70, 229, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.25)";
          }}
        >
          Student Seat Lookup
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "15px 36px",
            background: "var(--bg-white)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all var(--transition-smooth)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.color = "var(--accent-primary)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
        >
          Admin Login
        </button>
      </div>    </div>
  );
}

export default Gateway;
