// Central API configuration
// In production, VITE_API_URL will be set to your Render backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_BASE_URL;
