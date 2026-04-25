import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/api`;
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

const inputStyle = {
  width: "100%", padding: "12px 14px",
  background: "var(--bg-input)", border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)", fontSize: "0.95rem", color: "var(--text-primary)",
  boxSizing: "border-box", transition: "var(--transition-fast)", outline: "none"
};
const buttonStyle = {
  padding: "12px 22px", background: "var(--gradient-button)", color: "#fff",
  border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.95rem", fontWeight: "600",
  cursor: "pointer", transition: "all var(--transition-fast)",
  boxShadow: "0 3px 12px rgba(79,70,229,0.2)"
};
const thStyle = {
  padding: "12px 12px", textAlign: "left", fontSize: "0.76rem", fontWeight: "700",
  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px"
};
const tdStyle = { padding: "14px 12px", fontSize: "0.93rem", color: "var(--text-primary)" };

function Card({ title, children }) {
  return (
    <div style={{ background: "var(--bg-white)", padding: "24px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
      <h3 style={{ margin: "0 0 18px 0", fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: "var(--bg-white)", padding: "22px", borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)",
      borderLeft: `4px solid ${color}`, transition: "all var(--transition-fast)", cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      <p style={{ margin: "0 0 4px 0", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "700", color: "var(--text-primary)" }}>{value}</h2>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--text-muted)", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
      <p style={{ fontSize: "0.95rem", fontWeight: "500", margin: 0 }}>{message}</p>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "7px" }}>{label}</label>
      {children}
    </div>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", backgroundColor: "var(--accent-rose-light)",
      color: "var(--accent-rose)", border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: "var(--radius-sm)", fontSize: "0.82rem", cursor: "pointer", fontWeight: "600", transition: "var(--transition-fast)"
    }}
      onMouseEnter={e => e.target.style.backgroundColor = "rgba(239,68,68,0.15)"}
      onMouseLeave={e => e.target.style.backgroundColor = "var(--accent-rose-light)"}
    >Delete</button>
  );
}

function TableRow({ children }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border-light)", transition: "var(--transition-fast)" }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-subtle)"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
    >{children}</tr>
  );
}

function RoomMap({ room }) {
  const maxRow = room.total_rows || Math.max(...room.seats.map(s => s.row));
  const maxCol = room.total_columns || Math.max(...room.seats.map(s => s.column));
  return (
    <div style={{ marginBottom: "24px", padding: "24px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Room {room.room_no}{room.floor_no ? <span style={{ fontSize: "0.78rem", fontWeight: "500", color: "var(--text-muted)", marginLeft: "8px" }}>Floor {room.floor_no}</span> : null}
        </h4>
        <span style={{ padding: "4px 12px", backgroundColor: "var(--accent-primary-light)", color: "var(--accent-primary)", border: "1px solid rgba(79,70,229,0.15)", borderRadius: "var(--radius-pill)", fontSize: "0.8rem", fontWeight: "700" }}>{room.seats?.length || 0} Allocated</span>
      </div>
      <div style={{ padding: "24px", background: "var(--bg-white)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          {room.door_side === "left" || !room.door_side ? <div style={{ width: 40, height: 50, border: "3px solid var(--border-color)", borderLeft: "none", borderRadius: "0 8px 8px 0", background: "var(--bg-white)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "700", color: "var(--text-muted)", marginLeft: "-24px" }}><span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>DOOR</span></div> : <div style={{ width: 40 }} />}
          <div style={{ display: "inline-block", padding: "8px 50px", background: "var(--bg-subtle)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px" }}>Front / Instructor Area</div>
          {room.door_side === "right" ? <div style={{ width: 40, height: 50, border: "3px solid var(--border-color)", borderRight: "none", borderRadius: "8px 0 0 8px", background: "var(--bg-white)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "700", color: "var(--text-muted)", marginRight: "-24px" }}><span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>DOOR</span></div> : <div style={{ width: 40 }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxCol}, minmax(40px, 1fr))`, gap: "8px", overflowX: "auto", padding: "8px", maxWidth: "100%" }}>
          {Array(maxRow).fill(null).map((_, ri) => (
            Array(maxCol).fill(null).map((_, ci) => {
              const seat = room.seats.find(s => s.row === ri + 1 && s.column === ci + 1);
              const isOcc = !!seat;
              return (
                <div key={`${ri}-${ci}`}
                  title={isOcc ? `${seat.student_name} (Roll: ${seat.roll_no})` : `Row ${ri + 1}, Col ${String.fromCharCode(65 + ci)} - Empty`}
                  style={{
                    height: "70px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: isOcc ? "var(--accent-primary-light)" : "var(--bg-subtle)",
                    border: `1px solid ${isOcc ? "rgba(79,70,229,0.2)" : "var(--border-light)"}`,
                    borderRadius: "6px", transition: "all 0.25s ease", cursor: isOcc ? "pointer" : "default",
                  }}
                  onMouseEnter={e => { if (isOcc) { e.currentTarget.style.transform = "translateY(-3px) scale(1.05)"; e.currentTarget.style.backgroundColor = "rgba(79,70,229,0.15)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; } }}
                  onMouseLeave={e => { if (isOcc) { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.backgroundColor = "var(--accent-primary-light)"; e.currentTarget.style.borderColor = "rgba(79,70,229,0.2)"; } }}
                >
                  <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", marginBottom: "1px", opacity: 0.6 }}>{ri + 1}{String.fromCharCode(65 + ci)}</span>
                  {isOcc && <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--accent-primary)" }}>{seat.roll_no.toString().slice(-3)}</div>}
                </div>
              );
            })
          ))}
        </div>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
            <div style={{ width: "13px", height: "13px", background: "var(--accent-primary-light)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: "3px" }} /> Allocated
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
            <div style={{ width: "13px", height: "13px", background: "var(--bg-subtle)", border: "1px solid var(--border-color)", borderRadius: "3px" }} /> Available
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeSection, setActiveSection, mobileMenuOpen }) {
  const items = [
    { id: "home", label: "Dashboard" }, { id: "upload", label: "Students & Rooms" },
    { id: "exam", label: "Seat Allocation" }, { id: "fbconfig", label: "Form Builder" },
    { id: "feedback", label: "Feedback Analytics" }, { id: "pdf", label: "Generate Reports" }
  ];
  return (
    <div className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
      <div style={{ padding: "30px 24px", borderBottom: "1px solid var(--border-color)" }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Auto<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Seat</span>X
        </h1>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.2px", lineHeight: "1.4" }}>
          {localStorage.getItem("college_name") || "Admin Workspace"}
        </p>
      </div>
      <nav style={{ padding: "20px 0", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {items.map(item => {
          const isActive = activeSection === item.id;
          return (
            <div key={item.id} onClick={() => setActiveSection(item.id)}
              style={{
                padding: "12px 24px", cursor: "pointer", position: "relative",
                backgroundColor: isActive ? "var(--accent-primary-light)" : "transparent",
                color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                fontSize: "0.92rem", fontWeight: isActive ? "600" : "500",
                transition: "var(--transition-fast)",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            >
              {isActive && <div style={{ position: "absolute", left: 0, top: "10%", height: "80%", width: "3px", background: "var(--gradient-primary)", borderRadius: "0 3px 3px 0" }} />}
              {item.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function Header({ toggleMenu }) {
  const navigate = useNavigate();
  const collegeName = localStorage.getItem("college_name") || "Management Portal";
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("college_name");
    navigate("/");
  };
  return (
    <div style={{
      background: "var(--bg-white)", borderBottom: "1px solid var(--border-color)", padding: "16px 32px",
      display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">☰</button>
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "600", color: "var(--text-primary)" }}>
          Auto<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Seat</span>X Management
        </h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: "600", letterSpacing: "0.8px" }}>{collegeName.toUpperCase()}</span>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--gradient-button)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "0.95rem" }}>
          {collegeName.charAt(0).toUpperCase()}
        </div>
        <button onClick={handleLogout} style={{
          padding: "7px 16px", backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)",
          border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)",
          fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", transition: "var(--transition-fast)"
        }}
          onMouseEnter={e => { e.target.style.backgroundColor = "var(--accent-rose-light)"; e.target.style.color = "var(--accent-rose)"; e.target.style.borderColor = "rgba(239,68,68,0.2)"; }}
          onMouseLeave={e => { e.target.style.backgroundColor = "var(--bg-subtle)"; e.target.style.color = "var(--text-secondary)"; e.target.style.borderColor = "var(--border-color)"; }}
        >Logout</button>
      </div>
    </div>
  );
}

function Home() {
  const [rooms, setRooms] = useState([]);
  const [ongoingExams, setOngoingExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [stats, setStats] = useState({ totalRooms: 0, totalExams: 0, totalCapacity: 0, occupiedRooms: 0 });

  useEffect(() => {
    axios.get(`${API_URL}/rooms`, { headers: authHeaders() })
      .then(res => {
        setRooms(res.data);
        const capacity = res.data.reduce((sum, room) => sum + room.capacity, 0);
        setStats(prev => ({ ...prev, totalRooms: res.data.length, totalCapacity: capacity }));
      }).catch(console.log);

    axios.get(`${API_URL}/exams`, { headers: authHeaders() })
      .then(res => {
        const allExams = res.data;
        const now = new Date();
        const currentDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        const ongoing = allExams.filter(exam => {
          if (exam.exam_date !== currentDate) return false;
          const es = exam.start_time.toLowerCase(), ee = exam.end_time.toLowerCase();
          const sh = parseInt(es.split(':')[0]), sm = parseInt(es.split(':')[1]);
          const eh = parseInt(ee.split(':')[0]), em = parseInt(ee.split(':')[1]);
          const sa = es.includes('pm') && sh !== 12 ? sh + 12 : (es.includes('am') && sh === 12 ? 0 : sh);
          const ea = ee.includes('pm') && eh !== 12 ? eh + 12 : (ee.includes('am') && eh === 12 ? 0 : eh);
          const ct = now.getHours() * 60 + now.getMinutes();
          return ct >= sa * 60 + sm && ct <= ea * 60 + em;
        });
        const upcoming = allExams.filter(exam => {
          if (exam.exam_date > currentDate) return true;
          if (exam.exam_date < currentDate) return false;
          const es = exam.start_time.toLowerCase();
          const sh = parseInt(es.split(':')[0]), sm = parseInt(es.split(':')[1]);
          const sa = es.includes('pm') && sh !== 12 ? sh + 12 : (es.includes('am') && sh === 12 ? 0 : sh);
          return sa * 60 + sm > now.getHours() * 60 + now.getMinutes();
        });
        const occRoomNos = ongoing.flatMap(e => e.rooms ? e.rooms.split(', ') : []);
        axios.get(`${API_URL}/rooms`, { headers: authHeaders() }).then(r => {
          setRooms(r.data.map(rm => ({ ...rm, is_occupied: occRoomNos.includes(rm.room_no) })));
        });
        setOngoingExams(ongoing); setUpcomingExams(upcoming);
        setStats(prev => ({ ...prev, totalExams: allExams.length, occupiedRooms: ongoing.length }));
      }).catch(console.log);

    axios.get(`${API_URL}/feedback`, { headers: authHeaders() })
      .then(res => setStats(prev => ({ ...prev, totalFeedbacks: res.data.length })))
      .catch(console.log);
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "22px" }}>Dashboard Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard title="Total Rooms" value={stats.totalRooms} color="var(--accent-primary)" />
        <StatCard title="Occupied" value={stats.occupiedRooms} color="var(--accent-rose)" />
        <StatCard title="Total Exams" value={stats.totalExams} color="#10B981" />
        <StatCard title="Responses" value={stats.totalFeedbacks || 0} color="#F59E0B" />
        <StatCard title="Capacity" value={stats.totalCapacity} color="#0EA5E9" />
      </div>
      <div className="grid-2-col" style={{ marginBottom: "16px" }}>
        <Card title="Live Exams">
          {ongoingExams.length === 0 ? <EmptyState message="No exams running currently" /> : (
            <div>{ongoingExams.map(exam => (
              <div key={exam.id} style={{ padding: "14px", marginBottom: "8px", backgroundColor: "var(--accent-rose-light)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid var(--accent-rose)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>{exam.exam_type}</h4>
                  <span style={{ padding: "2px 8px", background: "var(--accent-rose)", color: "#fff", borderRadius: "var(--radius-pill)", fontSize: "0.68rem", fontWeight: "700" }}>LIVE</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <div>{exam.exam_date} • {exam.start_time} – {exam.end_time}</div>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)", marginTop: "4px" }}>Rooms: {exam.rooms || 'Not assigned'}</div>
                </div>
              </div>
            ))}</div>
          )}
        </Card>
        <Card title="Upcoming Exams">
          {upcomingExams.length === 0 ? <EmptyState message="No upcoming exams scheduled" /> : (
            <div>{upcomingExams.slice(0, 5).map(exam => (
              <div key={exam.id} style={{ padding: "14px", marginBottom: "8px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", borderLeft: "4px solid #10B981", border: "1px solid var(--border-light)", transition: "var(--transition-fast)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--accent-primary-light)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--bg-subtle)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>{exam.exam_type}</h4>
                  <span style={{ padding: "2px 8px", background: "var(--accent-primary-light)", color: "var(--accent-primary)", borderRadius: "var(--radius-pill)", fontSize: "0.68rem", fontWeight: "700" }}>#{exam.id}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <div>{exam.exam_date} • {exam.start_time} – {exam.end_time}</div>
                  <div style={{ fontWeight: "600", color: "var(--text-primary)", marginTop: "4px" }}>Rooms: {exam.rooms || 'Not assigned'}</div>
                </div>
              </div>
            ))}</div>
          )}
        </Card>
      </div>
      <Card title="Room Status">
        {rooms.length === 0 ? <EmptyState message="No rooms added yet" /> : (
          <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={thStyle}>Room</th><th style={thStyle}>Capacity</th><th style={thStyle}>Status</th>
            </tr></thead>
            <tbody>{rooms.map(room => (
              <TableRow key={room.id}>
                <td style={{ ...tdStyle, fontWeight: "600" }}>{room.room_no}</td>
                <td style={tdStyle}>{room.capacity}</td>
                <td style={tdStyle}>
                  <span style={{ padding: "4px 10px", backgroundColor: room.is_occupied ? "var(--accent-rose-light)" : "rgba(16,185,129,0.08)", color: room.is_occupied ? "var(--accent-rose)" : "#10B981", border: `1px solid ${room.is_occupied ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`, borderRadius: "var(--radius-pill)", fontSize: "0.72rem", fontWeight: "700" }}>
                    {room.is_occupied ? "OCCUPIED" : "AVAILABLE"}
                  </span>
                </td>
              </TableRow>
            ))}</tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
}

// ─── File Converter ────────────────────────────────────────────────────────────
const REQUIRED_FIELDS = ["roll_no", "name", "branch", "year"];
const FIELD_KEYWORDS = {
  roll_no: ["roll", "enrollment", "prn", "regno", "reg", "rollno", "rollnum"],
  name: ["name", "student", "fullname", "studentname"],
  branch: ["branch", "dept", "department", "course", "stream", "program"],
  year: ["year", "sem", "semester", "class", "yr"],
};

function autoMap(headers) {
  const mapping = { roll_no: "", name: "", branch: "", year: "" };
  const usedHeaders = new Set();
  REQUIRED_FIELDS.forEach(field => {
    const keywords = FIELD_KEYWORDS[field];
    const match = headers.find(h => {
      const norm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      return !usedHeaders.has(h) && keywords.some(kw => norm.includes(kw));
    });
    if (match) { mapping[field] = match; usedHeaders.add(match); }
  });
  return mapping;
}

function normalizeYear(val) {
  if (!val) return val;
  const str = String(val).trim().toLowerCase();
  const wordMap = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
  for (const [word, num] of Object.entries(wordMap)) {
    if (str.includes(word)) return num;
  }
  const numeric = parseInt(str.replace(/(st|nd|rd|th)/gi, ""));
  return isNaN(numeric) ? val : numeric;
}

function FileConverter() {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ roll_no: "", name: "", branch: "", year: "" });
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const parseFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (data.length < 2) return;
      // Find header row (first row with at least 2 non-empty cells)
      let headerRowIdx = 0;
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const nonEmpty = data[i].filter(c => String(c).trim() !== "").length;
        if (nonEmpty >= 2) { headerRowIdx = i; break; }
      }
      const rawHeaders = data[headerRowIdx].map(h => String(h).trim()).filter(h => h !== "");
      const dataRows = data.slice(headerRowIdx + 1).filter(r => r.some(c => String(c).trim() !== ""));
      setHeaders(rawHeaders);
      setRows(dataRows.map(r => rawHeaders.map((_, i) => String(r[i] ?? "").trim())));
      setMapping(autoMap(rawHeaders));
      setPreview(null);
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handlePreview = () => {
    const missingFields = REQUIRED_FIELDS.filter(f => !mapping[f]);
    if (missingFields.length > 0) {
      alert(`Please map these fields: ${missingFields.join(", ")}`);
      return;
    }
    const converted = rows.slice(0, 5).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      const rec = REQUIRED_FIELDS.reduce((acc, f) => { acc[f] = obj[mapping[f]] ?? ""; return acc; }, {});
      rec.year = normalizeYear(rec.year);
      return rec;
    }).filter(r => r.roll_no !== "");
    setPreview(converted);
  };

  const handleDownload = () => {
    const missingFields = REQUIRED_FIELDS.filter(f => !mapping[f]);
    if (missingFields.length > 0) { alert(`Please map these fields: ${missingFields.join(", ")}`); return; }
    const converted = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      const rec = REQUIRED_FIELDS.reduce((acc, f) => { acc[f] = obj[mapping[f]] ?? ""; return acc; }, {});
      rec.year = normalizeYear(rec.year);
      return rec;
    }).filter(r => r.roll_no !== "");
    if (converted.length === 0) { alert("No valid rows to export."); return; }
    const header = REQUIRED_FIELDS.join(",");
    const csvRows = converted.map(r => REQUIRED_FIELDS.map(f => `"${String(r[f]).replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `autoseatx_compatible_${Date.now()}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const fieldLabels = { roll_no: "Roll No", name: "Student Name", branch: "Branch", year: "Year" };
  const fieldColors = { roll_no: "#6366F1", name: "#10B981", branch: "#F59E0B", year: "#0EA5E9" };

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ background: "var(--bg-white)", padding: "24px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
        <div style={{ marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid var(--border-light)" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>🔄 File Converter</h3>
          <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-muted)" }}>Upload any student file (CSV / Excel). Auto-detect columns and download a clean, compatible file.</p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fc-file-input").click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent-primary)" : "var(--border-color)"}`,
            borderRadius: "var(--radius-md)", padding: "28px", textAlign: "center",
            cursor: "pointer", transition: "all 0.2s", marginBottom: "20px",
            background: dragOver ? "var(--accent-primary-light)" : "var(--bg-subtle)",
          }}
        >
          <input id="fc-file-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }}
            onChange={e => parseFile(e.target.files[0])} />
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📂</div>
          {fileName
            ? <p style={{ margin: 0, fontWeight: "600", color: "var(--accent-primary)", fontSize: "0.95rem" }}>{fileName} ✓</p>
            : <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.88rem" }}>Drag & drop or <span style={{ color: "var(--accent-primary)", fontWeight: "600" }}>click to browse</span><br /><span style={{ fontSize: "0.75rem" }}>Supports CSV, XLSX, XLS</span></p>
          }
        </div>

        {headers.length > 0 && (
          <>
            {/* Column Mapping */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Map Columns to Required Fields</p>
              <div className="grid-2-col">>
                {REQUIRED_FIELDS.map(field => (
                  <div key={field} style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: `1px solid ${mapping[field] ? fieldColors[field] + "33" : "var(--border-color)"}`, transition: "border 0.2s" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: "700", color: fieldColors[field], marginBottom: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: fieldColors[field], display: "inline-block" }} />
                      {fieldLabels[field]}
                    </label>
                    <select
                      value={mapping[field]}
                      onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
                      style={{ ...inputStyle, fontSize: "0.85rem", padding: "8px 10px" }}
                    >
                      <option value="">— Select column —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: preview ? "20px" : 0 }}>
              <button onClick={handlePreview} style={{ ...buttonStyle, background: "var(--bg-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-color)", boxShadow: "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--accent-primary-light)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--bg-subtle)"}
              >👁 Preview (5 rows)</button>
              <button onClick={handleDownload} style={buttonStyle}>
                ⬇ Download Compatible CSV ({rows.filter(r => r[headers.indexOf(mapping.roll_no)] !== "").length || rows.length} rows)
              </button>
            </div>

            {/* Preview Table */}
            {preview && preview.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Preview — first {preview.length} rows:</p>
                <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-subtle)" }}>
                      {REQUIRED_FIELDS.map(f => (
                        <th key={f} style={{ ...thStyle, color: fieldColors[f] }}>{fieldLabels[f]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {REQUIRED_FIELDS.map(f => (
                          <td key={f} style={{ ...tdStyle, fontWeight: f === "roll_no" ? "600" : "400" }}>{row[f] || <span style={{ color: "var(--accent-rose)", fontSize: "0.75rem" }}>empty</span>}</td>
                        ))}
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────────

function Upload() {
  const [datasetName, setDatasetName] = useState("");
  const [file, setFile] = useState(null);
  const [roomNo, setRoomNo] = useState("");
  const [rows, setRows] = useState("");
  const [cols, setCols] = useState("");
  const [doorSide, setDoorSide] = useState("left");
  const [floorNo, setFloorNo] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [rooms, setRooms] = useState([]);

  const fetchData = () => {
    axios.get(`${API_URL}/upload/datasets`, { headers: authHeaders() }).then(res => setDatasets(res.data)).catch(console.log);
    axios.get(`${API_URL}/rooms`, { headers: authHeaders() }).then(res => setRooms(res.data)).catch(console.log);
  };
  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("datasetName", datasetName);
    formData.append("file", file);
    try {
      const res = await axios.post(`${API_URL}/upload/students`, formData, { headers: authHeaders() });
      alert(res.data.message); setDatasetName(""); setFile(null); e.target.reset(); fetchData();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/rooms`, { room_no: roomNo, total_rows: rows, total_columns: cols, door_side: doorSide, floor_no: floorNo }, { headers: authHeaders() });
      alert(res.data.message); setRoomNo(""); setRows(""); setCols(""); setDoorSide("left"); setFloorNo(""); fetchData();
    } catch (err) { alert("Room creation failed"); }
  };

  const handleDeleteDataset = async (id) => { try { await axios.delete(`${API_URL}/upload/datasets/${id}`, { headers: authHeaders() }); alert("Deleted"); fetchData(); } catch (err) { alert("Delete failed: " + (err.response?.data?.error || err.response?.data?.message || err.message)); console.error(err); } };
  const handleDeleteRoom = async (id) => { try { await axios.delete(`${API_URL}/rooms/${id}`, { headers: authHeaders() }); alert("Deleted"); fetchData(); } catch (err) { alert("Delete failed: " + (err.response?.data?.error || err.response?.data?.message || err.message)); console.error(err); } };

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "22px" }}>Students & Rooms</h1>
      <div className="grid-2-col" style={{ marginBottom: "24px" }}>
        <Card title="Upload Student Dataset">
          <form onSubmit={handleUpload}>
            <FormGroup label="Dataset Name"><input type="text" placeholder="e.g., 3rd Year AIDS" value={datasetName} onChange={e => setDatasetName(e.target.value)} required style={inputStyle} /></FormGroup>
            <FormGroup label="Select File"><input type="file" accept=".xlsx,.csv" onChange={e => setFile(e.target.files[0])} required style={inputStyle} /></FormGroup>
            <button type="submit" style={buttonStyle}>Upload Dataset</button>
          </form>
        </Card>
        <Card title="Add New Room">
          <form onSubmit={handleRoomSubmit}>
            <FormGroup label="Room Number"><input type="text" placeholder="e.g., 101" value={roomNo} onChange={e => setRoomNo(e.target.value)} required style={inputStyle} /></FormGroup>
            <FormGroup label="Floor Number"><input type="number" placeholder="e.g., 1" min="1" value={floorNo} onChange={e => setFloorNo(e.target.value)} required style={inputStyle} /></FormGroup>
            <FormGroup label="Number of Rows"><input type="number" placeholder="e.g., 5" value={rows} onChange={e => setRows(e.target.value)} required style={inputStyle} /></FormGroup>
            <FormGroup label="Number of Columns"><input type="number" placeholder="e.g., 10" value={cols} onChange={e => setCols(e.target.value)} required style={inputStyle} /></FormGroup>
            <FormGroup label="Door Side (From Student Facing Side)">
              <select value={doorSide} onChange={e => setDoorSide(e.target.value)} required style={inputStyle}>
                <option value="left">Left Side</option>
                <option value="right">Right Side</option>
              </select>
            </FormGroup>
            <button type="submit" style={buttonStyle}>Add Room</button>
          </form>
        </Card>
      </div>
      <div className="grid-2-col" style={{ marginBottom: "0" }}>
        <Card title="Uploaded Datasets">
          {datasets.length === 0 ? <EmptyState message="No datasets uploaded yet" /> : (
            <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}><th style={thStyle}>Name</th><th style={thStyle}>Students</th><th style={thStyle}>Action</th></tr></thead>
              <tbody>{datasets.map(ds => (<TableRow key={ds.id}><td style={{ ...tdStyle, fontWeight: "600" }}>{ds.dataset_name}</td><td style={tdStyle}>{ds.total_students}</td><td style={tdStyle}><DeleteBtn onClick={() => handleDeleteDataset(ds.id)} /></td></TableRow>))}</tbody>
            </table>
          </div>
          )}
        </Card>
        <Card title="All Rooms">
          {rooms.length === 0 ? <EmptyState message="No rooms added yet" /> : (
            <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}><th style={thStyle}>Room</th><th style={thStyle}>Floor</th><th style={thStyle}>Layout</th><th style={thStyle}>Capacity</th><th style={thStyle}>Door</th><th style={thStyle}>Action</th></tr></thead>
              <tbody>{rooms.map(room => (<TableRow key={room.id}><td style={{ ...tdStyle, fontWeight: "600" }}>{room.room_no}</td><td style={tdStyle}>{room.floor_no ?? '—'}</td><td style={tdStyle}>{room.total_rows}x{room.total_columns}</td><td style={tdStyle}>{room.capacity}</td><td style={{ ...tdStyle, textTransform: "capitalize" }}>{room.door_side || 'left'}</td><td style={tdStyle}><DeleteBtn onClick={() => handleDeleteRoom(room.id)} /></td></TableRow>))}</tbody>
            </table>
          </div>
          )}
        </Card>
      </div>
      <FileConverter />
    </div>
  );
}

function ExamSeating() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [examType, setExamType] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [floorNo, setFloorNo] = useState("");
  const [seatingPlan, setSeatingPlan] = useState(null);
  const [unallocated, setUnallocated] = useState(0);

  useEffect(() => { axios.get(`${API_URL}/upload/datasets`, { headers: authHeaders() }).then(res => setDatasets(res.data)).catch(console.log); }, []);

  const handleGenerate = async () => {
    if (!examDate || !startTime || !endTime) { alert("Please fill in exam date and time"); return; }
    try {
      const payload = { dataset_id: selectedDataset, examDate, startTime, endTime };
      if (floorNo) payload.floorNo = floorNo;
      const res = await axios.post(`${API_URL}/exams/generate`, payload, { headers: authHeaders() });
      setSeatingPlan(res.data.seatingPlan); setUnallocated(res.data.unallocated || 0);
    } catch (err) { alert(err.response?.data?.message || "Generation failed"); }
  };

  const handleConfirm = async () => {
    try {
      await axios.post(`${API_URL}/exams/save`, { examType, examDate, startTime, endTime, dataset_id: selectedDataset, seatingPlan }, { headers: authHeaders() });
      alert("Exam Saved Successfully!"); setSeatingPlan(null); setUnallocated(0); setExamType(""); setExamDate(""); setStartTime(""); setEndTime(""); setSelectedDataset(""); setFloorNo("");
    } catch (err) { alert("Save failed"); }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "22px" }}>Exam Seating Arrangement</h1>
      <Card title="Configure Exam Details">
        <div className="grid-2-col">>
          <FormGroup label="Student Dataset">
            <select value={selectedDataset} onChange={e => setSelectedDataset(e.target.value)} style={inputStyle}>
              <option value="">Choose a dataset</option>
              {datasets.map(ds => (<option key={ds.id} value={ds.id}>{ds.dataset_name} ({ds.total_students} students)</option>))}
            </select>
          </FormGroup>
          <FormGroup label="Exam Type"><input type="text" placeholder="e.g., Mid-Term, Final" value={examType} onChange={e => setExamType(e.target.value)} style={inputStyle} /></FormGroup>
          <FormGroup label="Exam Date"><input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} style={inputStyle} /></FormGroup>
          <FormGroup label="Start Time"><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} /></FormGroup>
          <FormGroup label="End Time"><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} /></FormGroup>
          <FormGroup label="Floor Filter (Optional)">
            <input type="number" placeholder="e.g., 1 — leave blank for all floors" min="1" value={floorNo} onChange={e => setFloorNo(e.target.value)} style={inputStyle} />
          </FormGroup>
        </div>
        <button onClick={handleGenerate} style={{ ...buttonStyle, marginTop: "14px" }}>Generate Seating Plan</button>
      </Card>
      {seatingPlan && Array.isArray(seatingPlan) && seatingPlan.length > 0 && (
        <div style={{ marginTop: "18px" }}>
          {unallocated > 0 && (
            <div style={{ padding: "14px 18px", backgroundColor: "var(--accent-amber-light)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", marginBottom: "18px", fontSize: "0.92rem", color: "#B45309", fontWeight: "600" }}>
              <strong>Warning:</strong> {unallocated} students could not be seated. Add more rooms.
            </div>
          )}
          <Card title="Seating Plan Preview">
            {seatingPlan.map(room => (<RoomMap key={room.room_id} room={room} />))}
            <button onClick={handleConfirm} style={{ ...buttonStyle, fontSize: "1rem", padding: "14px 32px", marginTop: "8px" }}>Confirm & Save Seating Plan</button>
          </Card>
        </div>
      )}
    </div>
  );
}

function PDFs() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const fetchExams = () => { axios.get(`${API_URL}/exams`, { headers: authHeaders() }).then(res => setExams(res.data)).catch(console.log); };
  useEffect(() => { fetchExams(); }, []);

  const handleGeneratePDF = async () => {
    if (!selectedExam) { alert("Please select an exam"); return; }
    try {
      const res = await axios.post(`${API_URL}/pdf/generate`, { exam_id: selectedExam }, { headers: authHeaders() });
      alert("PDF Generated!"); window.open(`${API_BASE_URL}/uploads/${res.data.fileName}`, "_blank");
    } catch (err) { alert("PDF generation failed"); }
  };

  const handleDeleteExam = async (id) => { if (!confirm("Delete this exam?")) return; try { await axios.delete(`${API_URL}/exams/${id}`, { headers: authHeaders() }); alert("Deleted"); fetchExams(); } catch { alert("Delete failed"); } };

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "22px" }}>Generate PDF Reports</h1>
      <Card title="Export Seating Plan">
        <FormGroup label="Select Exam">
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} style={inputStyle}>
            <option value="">Choose an exam</option>
            {exams.map(exam => (<option key={exam.id} value={exam.id}>Exam #{exam.id} - {exam.exam_type} ({exam.exam_date})</option>))}
          </select>
        </FormGroup>
        <button onClick={handleGeneratePDF} style={buttonStyle}>Generate & Download PDF</button>
      </Card>
      {exams.length > 0 && (
        <div style={{ marginTop: "18px" }}><Card title="All Exams">
          <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th style={thStyle}>ID</th><th style={thStyle}>Type</th><th style={thStyle}>Date</th><th style={thStyle}>Time</th><th style={thStyle}>Rooms</th><th style={thStyle}>Action</th>
            </tr></thead>
            <tbody>{exams.map(exam => (
              <TableRow key={exam.id}>
                <td style={{ ...tdStyle, fontWeight: "600" }}>#{exam.id}</td>
                <td style={tdStyle}>{exam.exam_type}</td>
                <td style={tdStyle}>{exam.exam_date}</td>
                <td style={tdStyle}>{exam.start_time} – {exam.end_time}</td>
                <td style={tdStyle}>{exam.rooms || 'N/A'}</td>
                <td style={tdStyle}><DeleteBtn onClick={() => handleDeleteExam(exam.id)} /></td>
              </TableRow>
            ))}</tbody>
          </table>
        </div>
        </Card></div>
      )}
    </div>
  );
}

const RatingBar = ({ label, value, color }) => (
  <div style={{ marginBottom: "14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.85rem" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{value.toFixed(1)} / 5.0</span>
    </div>
    <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / 5) * 100}%`, background: color, borderRadius: "10px", transition: "width 1s ease-out" }} />
    </div>
  </div>
);

const COMMON_SUGGESTIONS = [
  "Paper Quality", "Difficulty Level", "Water Availability", "Staff Behavior",
  "Lighting & Ventilation", "Question Clarity", "Time Management",
  "Technical Issues", "Cleanliness", "Seating Arrangement", "Invigilation Quality"
];

function FeedbackConfig() {
  const [questions, setQuestions] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { axios.get(`${API_URL}/feedback/questions`).then(res => setQuestions(res.data)).catch(console.error); }, []);

  const handleLabelChange = (val) => {
    setNewLabel(val);
    if (val.trim()) {
      setSuggestions(COMMON_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !questions.some(q => q.label === s)));
    } else { setSuggestions([]); }
  };

  const addQuestion = (label) => {
    const text = label || newLabel;
    if (!text.trim()) return;
    if (questions.some(q => q.label.toLowerCase() === text.toLowerCase())) { alert("Field already exists"); return; }
    setQuestions([...questions, { label: text, type: "rating", is_required: true }]);
    setNewLabel(""); setSuggestions([]);
  };

  const handleSave = async () => {
    setLoading(true);
    try { await axios.post(`${API_URL}/feedback/questions`, { questions }, { headers: authHeaders() }); alert("Feedback form updated successfully!"); }
    catch { alert("Failed to update form"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>Form Builder</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Customize the feedback fields students see after their exam.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
        <Card title="Configure Fields">
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" placeholder="Type a field name (e.g. Paper Quality)" value={newLabel} onChange={e => handleLabelChange(e.target.value)} style={inputStyle} onKeyDown={e => e.key === 'Enter' && addQuestion()} />
              <button onClick={() => addQuestion()} style={{ ...buttonStyle, whiteSpace: "nowrap" }}>Add Field</button>
            </div>
            {suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: "110px", background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", zIndex: 100, marginTop: "4px", boxShadow: "var(--shadow-lg)", maxHeight: "200px", overflowY: "auto" }}>
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => addQuestion(s)} style={{ padding: "10px 14px", cursor: "pointer", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-light)" }}
                    onMouseEnter={e => e.target.style.background = "var(--accent-primary-light)"}
                    onMouseLeave={e => e.target.style.background = "transparent"}
                  >{s}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {questions.length === 0 ? <EmptyState message="No custom fields added yet. Add some above!" /> :
              questions.map((q, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "var(--bg-subtle)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{q.label}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Type: Rating (1-5)</div>
                  </div>
                  <DeleteBtn onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} />
                </div>
              ))
            }
          </div>
          <button onClick={handleSave} disabled={loading} style={{ ...buttonStyle, width: "100%", marginTop: "24px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Updating..." : "Save Form Structure"}
          </button>
        </Card>
        <Card title="Live Preview">
          <div style={{ opacity: 0.8, pointerEvents: "none" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "18px" }}>This is how students will see the form:</p>
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-primary)", marginBottom: "6px" }}>{q.label}</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", color: "var(--text-muted)" }}>{n}</div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-primary)", marginBottom: "6px" }}>Additional Comments</label>
              <textarea placeholder="Write here..." style={{ ...inputStyle, height: "56px", resize: "none" }} readOnly />
            </div>
            <button style={{ ...buttonStyle, width: "100%", opacity: 0.5 }}>Submit Feedback</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FeedbackResponses() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [fbRes, qRes] = await Promise.all([
        axios.get(`${API_URL}/feedback`, { headers: authHeaders() }),
        axios.get(`${API_URL}/feedback/questions`)
      ]);
      setFeedbacks(fbRes.data); setQuestions(qRes.data);
    } catch (err) { console.error("Failed to fetch data", err); }
  };

  const exportToCSV = () => {
    if (feedbacks.length === 0) return;
    const dynamicHeaders = questions.map(q => q.label);
    const headers = ["Student Name", "Roll No", "Exam", "Date", "Year", ...dynamicHeaders, "Comments", "Submitted At"];
    const rows = feedbacks.map(fb => [
      fb.student_name || "Unknown", fb.roll_no, fb.exam_type, fb.exam_date, fb.student_year || "Unknown",
      ...questions.map(q => fb.responses?.[q.label] || fb[q.label.toLowerCase().replace(/ /g, "_")] || 0),
      `"${fb.comments || ""}"`, fb.submitted_at
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `AutoSeatX_Feedback_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const summary = useMemo(() => {
    if (feedbacks.length === 0 || questions.length === 0) return null;
    const categoryAverages = questions.map(q => {
      let total = 0, count = 0;
      feedbacks.forEach(fb => {
        const val = fb.responses?.[q.label] || fb[q.label.toLowerCase().replace(/ /g, "_")];
        if (val !== undefined && val !== null) { total += Number(val); count++; }
      });
      return { label: q.label, avg: count > 0 ? total / count : 0 };
    });
    const totalAvg = categoryAverages.reduce((sum, c) => sum + c.avg, 0) / (categoryAverages.length || 1);
    return { categoryAverages, totalAvg };
  }, [feedbacks, questions]);

  const groupedFeedbacks = useMemo(() => {
    const groups = { "First Year": [], "Second Year": [], "Third Year": [], "Fourth Year": [], "Unknown Year": [] };
    feedbacks.forEach(fb => { const year = fb.student_year || "Unknown Year"; if (!groups[year]) groups[year] = []; groups[year].push(fb); });
    return groups;
  }, [feedbacks]);

  const fbThStyle = { padding: "12px 12px", textAlign: "left", color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.8px", fontWeight: "700", textTransform: "uppercase" };

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out forwards" }}>
      <div style={{ marginBottom: "26px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 6px 0" }}>Feedback Analytics</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>Visualizing student feedback across {questions.length} dynamic categories.</p>
        </div>
        <button onClick={exportToCSV} disabled={feedbacks.length === 0} style={{ ...buttonStyle, padding: "9px 18px", fontSize: "0.82rem", opacity: feedbacks.length === 0 ? 0.5 : 1 }}>Export to CSV</button>
      </div>

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "26px" }}>
          <div style={{ background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "22px", boxShadow: "var(--shadow-card)" }}>
            <h4 style={{ margin: "0 0 18px 0", fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "600" }}>Overall Satisfaction</h4>
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "3.2rem", fontWeight: "800", color: "var(--accent-primary)", lineHeight: 1 }}>{summary.totalAvg.toFixed(1)}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>Average Rating Out of 5.0</div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic", margin: 0 }}>Based on {feedbacks.length} student responses</p>
          </div>
          <div style={{ background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "22px", boxShadow: "var(--shadow-card)" }}>
            <h4 style={{ margin: "0 0 18px 0", fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "600" }}>Category Performance</h4>
            {summary.categoryAverages.map((c, i) => (
              <RatingBar key={i} label={c.label} value={c.avg} color={i % 2 === 0 ? "var(--accent-primary)" : "#10B981"} />
            ))}
          </div>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <Card title="Responses"><EmptyState message="No feedback responses yet." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Object.entries(groupedFeedbacks).map(([year, gf]) => {
            if (gf.length === 0) return null;
            return (
              <div key={year} style={{ background: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden", padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-light)", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--accent-primary)", fontWeight: "600" }}>{year}</h3>
                  <div style={{ background: "var(--bg-subtle)", padding: "4px 12px", borderRadius: "100px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Responses: <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{gf.length}</span>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
                      <th style={fbThStyle}>Student</th><th style={fbThStyle}>Exam</th>
                      {questions.map((q, i) => (<th key={i} style={{ ...fbThStyle, textAlign: "center" }}>{q.label}</th>))}
                      <th style={fbThStyle}>Comments</th><th style={fbThStyle}>Submitted</th>
                    </tr></thead>
                    <tbody>{gf.map(fb => (
                      <TableRow key={fb.id}>
                        <td style={{ padding: "12px", color: "var(--text-primary)" }}>
                          <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{fb.student_name || "Unknown"}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{fb.roll_no}</div>
                        </td>
                        <td style={{ padding: "12px", color: "var(--text-primary)" }}>
                          <div style={{ fontSize: "0.85rem" }}>{fb.exam_type}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{fb.exam_date}</div>
                        </td>
                        {questions.map((q, i) => {
                          const val = fb.responses?.[q.label] || fb[q.label.toLowerCase().replace(/ /g, "_")];
                          return (<td key={i} style={{ padding: "12px", textAlign: "center", color: "#F59E0B", fontSize: "0.85rem" }}>{val || "-"} ★</td>);
                        })}
                        <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.8rem", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fb.comments || "-"}</td>
                        <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{fb.submitted_at || "-"}</td>
                      </TableRow>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <div className={`dashboard-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <Sidebar activeSection={activeSection} setActiveSection={(section) => { setActiveSection(section); setMobileMenuOpen(false); }} mobileMenuOpen={mobileMenuOpen} />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", background: "var(--bg-body)" }}>
        <Header toggleMenu={() => setMobileMenuOpen(true)} />
        <div className="dashboard-content" style={{ padding: "24px 32px", flex: 1, animation: "fadeInUp 0.5s ease-out forwards" }}>
          {activeSection === "home" && <Home />}
          {activeSection === "upload" && <Upload />}
          {activeSection === "exam" && <ExamSeating />}
          {activeSection === "fbconfig" && <FeedbackConfig />}
          {activeSection === "pdf" && <PDFs />}
          {activeSection === "feedback" && <FeedbackResponses />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
