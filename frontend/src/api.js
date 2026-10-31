import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";


const api = axios.create({
  baseURL: API_BASE,
});

export default api



