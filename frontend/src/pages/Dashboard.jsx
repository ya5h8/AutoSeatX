import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: "#f5f7fa" }}>
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Header />
        <div style={{ padding: "30px 40px" }}>
          {activeSection === "home" && <Home />}
          {activeSection === "upload" && <Upload />}
          {activeSection === "exam" && <ExamSeating />}
          {activeSection === "pdf" && <PDFs />}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{
      backgroundColor: "white",
      padding: "20px 40px",
      borderBottom: "1px solid #e1e8ed",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#1a1a1a" }}>AutoSeatX Management</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span style={{ color: "#666", fontSize: "14px" }}>Admin Portal</span>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#2a5298",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "600"
        }}>A</div>
      </div>
    </div>
  );
}

function Sidebar({ activeSection, setActiveSection }) {
  const menuItems = [
    { id: "home", label: "Dashboard" },
    { id: "upload", label: "Upload Data" },
    { id: "exam", label: "Exam Seating" },
    { id: "pdf", label: "Generate PDF" }
  ];

  return (
    <div style={{
      width: "260px",
      backgroundColor: "#1e3c72",
      color: "white",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ padding: "30px 25px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700" }}>AutoSeatX</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: "13px", opacity: 0.8 }}>Seating Management System</p>
      </div>
      
      <nav style={{ padding: "20px 0", flex: 1 }}>
        {menuItems.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              padding: "14px 25px",
              cursor: "pointer",
              backgroundColor: activeSection === item.id ? "rgba(255,255,255,0.15)" : "transparent",
              borderLeft: activeSection === item.id ? "4px solid #fff" : "4px solid transparent",
              fontSize: "15px",
              fontWeight: activeSection === item.id ? "600" : "400",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) e.target.style.backgroundColor = "transparent";
            }}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
}

function Home() {
  const [rooms, setRooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [ongoingExams, setOngoingExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [stats, setStats] = useState({ totalRooms: 0, totalExams: 0, totalCapacity: 0, occupiedRooms: 0 });

  useEffect(() => {
    axios.get(`${API_URL}/rooms`, { headers: authHeaders() })
      .then(res => {
        setRooms(res.data);
        const capacity = res.data.reduce((sum, room) => sum + room.capacity, 0);
        setStats(prev => ({ ...prev, totalRooms: res.data.length, totalCapacity: capacity }));
      })
      .catch(err => console.log(err));

    axios.get(`${API_URL}/exams`, { headers: authHeaders() })
      .then(res => {
        const allExams = res.data;
        const now = new Date();
        const currentDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        console.log('Current Date:', currentDate);
        console.log('Current Time:', now.getHours() + ':' + now.getMinutes());
        
        const ongoing = allExams.filter(exam => {
          if (exam.exam_date !== currentDate) return false;
          
          const examStart = exam.start_time.toLowerCase();
          const examEnd = exam.end_time.toLowerCase();
          
          const startHour = parseInt(examStart.split(':')[0]);
          const startMin = parseInt(examStart.split(':')[1]);
          const endHour = parseInt(examEnd.split(':')[0]);
          const endMin = parseInt(examEnd.split(':')[1]);
          
          const startAdjusted = examStart.includes('pm') && startHour !== 12 ? startHour + 12 : (examStart.includes('am') && startHour === 12 ? 0 : startHour);
          const endAdjusted = examEnd.includes('pm') && endHour !== 12 ? endHour + 12 : (examEnd.includes('am') && endHour === 12 ? 0 : endHour);
          
          const startTime = startAdjusted * 60 + startMin;
          const endTime = endAdjusted * 60 + endMin;
          const currentTime = now.getHours() * 60 + now.getMinutes();
          
          return currentTime >= startTime && currentTime <= endTime;
        });

        const upcoming = allExams.filter(exam => {
          if (exam.exam_date > currentDate) return true;
          if (exam.exam_date < currentDate) return false;
          
          const examStart = exam.start_time.toLowerCase();
          const startHour = parseInt(examStart.split(':')[0]);
          const startMin = parseInt(examStart.split(':')[1]);
          const startAdjusted = examStart.includes('pm') && startHour !== 12 ? startHour + 12 : (examStart.includes('am') && startHour === 12 ? 0 : startHour);
          const startTime = startAdjusted * 60 + startMin;
          const currentTime = now.getHours() * 60 + now.getMinutes();
          
          return startTime > currentTime;
        });

        const occupiedRoomNos = ongoing.flatMap(exam => exam.rooms ? exam.rooms.split(', ') : []);

        axios.get(`${API_URL}/rooms`, { headers: authHeaders() })
          .then(res => {
            const roomsWithStatus = res.data.map(room => ({
              ...room,
              is_occupied: occupiedRoomNos.includes(room.room_no)
            }));
            setRooms(roomsWithStatus);
          });

        setExams(allExams);
        setOngoingExams(ongoing);
        setUpcomingExams(upcoming);
        setStats(prev => ({ ...prev, totalExams: allExams.length, occupiedRooms: ongoing.length }));
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "25px" }}>Dashboard Overview</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <StatCard title="Total Rooms" value={stats.totalRooms} color="#3498db" />
        <StatCard title="Occupied Rooms" value={stats.occupiedRooms} color="#e74c3c" />
        <StatCard title="Total Exams" value={stats.totalExams} color="#27ae60" />
        <StatCard title="Total Capacity" value={stats.totalCapacity} color="#f39c12" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <Card title="Live Exams">
          {ongoingExams.length === 0 ? (
            <EmptyState message="No exams running currently" />
          ) : (
            <div>
              {ongoingExams.map(exam => (
                <div key={exam.id} style={{
                  padding: "15px",
                  marginBottom: "12px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  borderLeft: "4px solid #ffc107",
                  animation: "pulse 2s infinite"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>{exam.exam_type}</h4>
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: "#ffc107",
                      color: "#000",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    <div style={{ marginBottom: "4px" }}>Date: {exam.exam_date}</div>
                    <div style={{ marginBottom: "4px" }}>Time: {exam.start_time} - {exam.end_time}</div>
                    <div style={{ fontWeight: "600", color: "#1a1a1a" }}>Rooms: {exam.rooms || 'Not assigned'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Upcoming Exams">
          {upcomingExams.length === 0 ? (
            <EmptyState message="No upcoming exams scheduled" />
          ) : (
            <div>
              {upcomingExams.slice(0, 5).map(exam => (
                <div key={exam.id} style={{
                  padding: "15px",
                  marginBottom: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  borderLeft: "4px solid #3498db"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>{exam.exam_type}</h4>
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: "#3498db",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>#{exam.id}</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    <div style={{ marginBottom: "4px" }}>Date: {exam.exam_date}</div>
                    <div style={{ marginBottom: "4px" }}>Time: {exam.start_time} - {exam.end_time}</div>
                    <div style={{ fontWeight: "600", color: "#1a1a1a" }}>Rooms: {exam.rooms || 'Not assigned'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Room Status">
        {rooms.length === 0 ? (
          <EmptyState message="No rooms added yet" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e1e8ed" }}>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Room</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Capacity</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px", fontSize: "14px", fontWeight: "600" }}>{room.room_no}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{room.capacity}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: room.is_occupied ? "#e74c3c" : "#27ae60",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {room.is_occupied ? "Occupied" : "Available"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${color}`
    }}>
      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666", fontWeight: "500" }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: "36px", fontWeight: "700", color: "#1a1a1a" }}>{value}</h2>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
      <p style={{ fontSize: "15px" }}>{message}</p>
    </div>
  );
}

function Upload() {
  const [datasetName, setDatasetName] = useState("");
  const [file, setFile] = useState(null);
  const [roomNo, setRoomNo] = useState("");
  const [rows, setRows] = useState("");
  const [cols, setCols] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [rooms, setRooms] = useState([]);

  const fetchData = () => {
    axios.get(`${API_URL}/upload/datasets`, { headers: authHeaders() })
      .then(res => setDatasets(res.data))
      .catch(err => console.log(err));

    axios.get(`${API_URL}/rooms`, { headers: authHeaders() })
      .then(res => setRooms(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("datasetName", datasetName);
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/upload/students`, formData, { headers: authHeaders() });
      alert(res.data.message);
      setDatasetName("");
      setFile(null);
      e.target.reset();
      fetchData();
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/rooms`, 
        { room_no: roomNo, total_rows: rows, total_columns: cols },
        { headers: authHeaders() }
      );
      alert(res.data.message);
      setRoomNo("");
      setRows("");
      setCols("");
      fetchData();
    } catch (err) {
      alert("Room creation failed");
    }
  };

  const handleDeleteDataset = async (id) => {
    if (!confirm("Are you sure you want to delete this dataset?")) return;

    try {
      await axios.delete(`${API_URL}/upload/datasets/${id}`, { headers: authHeaders() });
      alert("Dataset deleted successfully");
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await axios.delete(`${API_URL}/rooms/${id}`, { headers: authHeaders() });
      alert("Room deleted successfully");
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "25px" }}>Upload Data</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <Card title="Upload Student Dataset">
          <form onSubmit={handleUpload}>
            <FormGroup label="Dataset Name">
              <input
                type="text"
                placeholder="e.g., 3rd Year AIDS"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                required
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Select File">
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setFile(e.target.files[0])}
                required
                style={inputStyle}
              />
            </FormGroup>
            <button type="submit" style={buttonStyle}>Upload Dataset</button>
          </form>
        </Card>

        <Card title="Add New Room">
          <form onSubmit={handleRoomSubmit}>
            <FormGroup label="Room Number">
              <input
                type="text"
                placeholder="e.g., 101"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                required
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Number of Rows">
              <input
                type="number"
                placeholder="e.g., 5"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                required
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Number of Columns">
              <input
                type="number"
                placeholder="e.g., 10"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                required
                style={inputStyle}
              />
            </FormGroup>
            <button type="submit" style={buttonStyle}>Add Room</button>
          </form>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <Card title="Uploaded Datasets">
          {datasets.length === 0 ? (
            <EmptyState message="No datasets uploaded yet" />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e1e8ed" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Name</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Students</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map(dataset => (
                  <tr key={dataset.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{dataset.dataset_name}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{dataset.total_students}</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleDeleteDataset(dataset.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="All Rooms">
          {rooms.length === 0 ? (
            <EmptyState message="No rooms added yet" />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e1e8ed" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Room</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Layout</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Capacity</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px", fontSize: "14px", fontWeight: "600" }}>{room.room_no}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{room.total_rows}x{room.total_columns}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{room.capacity}</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
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
  const [seatingPlan, setSeatingPlan] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/upload/datasets`, { headers: authHeaders() })
      .then(res => setDatasets(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleGenerate = async () => {
    if (!examDate || !startTime || !endTime) {
      alert("Please fill in exam date and time");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/exams/generate`, 
        { dataset_id: selectedDataset, examDate, startTime, endTime }, 
        { headers: authHeaders() }
      );
      setSeatingPlan(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Generation failed");
    }
  };

  const handleConfirm = async () => {
    try {
      await axios.post(`${API_URL}/exams/save`, {
        examType,
        examDate,
        startTime,
        endTime,
        dataset_id: selectedDataset,
        seatingPlan
      }, { headers: authHeaders() });

      alert("Exam Saved Successfully!");
      setSeatingPlan(null);
      setExamType("");
      setExamDate("");
      setStartTime("");
      setEndTime("");
      setSelectedDataset("");
    } catch (err) {
      alert("Save failed");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "25px" }}>Exam Seating Arrangement</h1>

      <Card title="Configure Exam Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <FormGroup label="Select Student Dataset">
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              style={inputStyle}
            >
              <option value="">Choose a dataset</option>
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.dataset_name} ({ds.total_students} students)</option>
              ))}
            </select>
          </FormGroup>

          <FormGroup label="Exam Type">
            <input
              type="text"
              placeholder="e.g., Mid-Term, Final"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              style={inputStyle}
            />
          </FormGroup>

          <FormGroup label="Exam Date">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              style={inputStyle}
            />
          </FormGroup>

          <FormGroup label="Start Time">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={inputStyle}
            />
          </FormGroup>

          <FormGroup label="End Time">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={inputStyle}
            />
          </FormGroup>
        </div>
        <button onClick={handleGenerate} style={{ ...buttonStyle, marginTop: "20px" }}>Generate Seating Plan</button>
      </Card>

      {seatingPlan && Array.isArray(seatingPlan) && seatingPlan.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Card title="Seating Plan Preview">
            {seatingPlan.map(room => {
              const maxRow = Math.max(...room.seats.map(s => s.row));
              const maxCol = Math.max(...room.seats.map(s => s.column));
              
              const grid = Array(maxRow).fill(null).map(() => Array(maxCol).fill(null));
              room.seats.forEach(seat => {
                grid[seat.row - 1][seat.column - 1] = seat.roll_no;
              });

              return (
                <div key={room.room_id} style={{
                  marginBottom: "25px",
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e1e8ed"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Room {room.room_no}</h4>
                    <span style={{
                      padding: "6px 12px",
                      backgroundColor: "#2a5298",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}>{room.seats?.length || 0} Students</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
                      <thead>
                        <tr>
                          {Array(maxCol).fill(null).map((_, i) => (
                            <th key={i} style={{
                              padding: "10px 15px",
                              backgroundColor: "#1e3c72",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "600",
                              border: "1px solid #ddd"
                            }}>
                              Column {String.fromCharCode(65 + i)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grid.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} style={{
                                padding: "12px 15px",
                                border: "1px solid #ddd",
                                backgroundColor: "white",
                                textAlign: "center",
                                fontSize: "13px",
                                fontWeight: "500"
                              }}>
                                {cell || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleConfirm}
              style={{
                ...buttonStyle,
                backgroundColor: "#27ae60",
                fontSize: "16px",
                padding: "14px 32px"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#229954"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#27ae60"}
            >
              Confirm & Save Seating Plan
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

function PDFs() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const fetchExams = () => {
    axios.get(`${API_URL}/exams`, { headers: authHeaders() })
      .then(res => setExams(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleGeneratePDF = async () => {
    if (!selectedExam) {
      alert("Please select an exam");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/pdf/generate`,
        { exam_id: selectedExam },
        { headers: authHeaders() }
      );

      alert("PDF Generated Successfully!");
      window.open(`http://localhost:5000/uploads/${res.data.fileName}`, "_blank");
    } catch (err) {
      alert("PDF generation failed");
    }
  };

  const handleDeleteExam = async (id) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      await axios.delete(`${API_URL}/exams/${id}`, { headers: authHeaders() });
      alert("Exam deleted successfully");
      fetchExams();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a1a", marginBottom: "25px" }}>Generate PDF Reports</h1>
      
      <Card title="Export Seating Plan">
        <FormGroup label="Select Exam">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={inputStyle}
          >
            <option value="">Choose an exam</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                Exam #{exam.id} - {exam.exam_type} ({exam.exam_date})
              </option>
            ))}
          </select>
        </FormGroup>
        <button onClick={handleGeneratePDF} style={buttonStyle}>Generate & Download PDF</button>
      </Card>

      {exams.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Card title="All Exams">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e1e8ed" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Exam ID</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Type</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Date</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Time</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Rooms</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#666" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px", fontSize: "14px", fontWeight: "600" }}>#{exam.id}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{exam.exam_type}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{exam.exam_date}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{exam.start_time} - {exam.end_time}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{exam.rooms || 'N/A'}</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
        marginBottom: "8px"
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "2px solid #e1e8ed",
  borderRadius: "8px",
  fontSize: "14px",
  boxSizing: "border-box",
  transition: "all 0.3s",
  outline: "none"
};

const buttonStyle = {
  padding: "12px 24px",
  backgroundColor: "#2a5298",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s"
};

export default Dashboard;
