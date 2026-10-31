import axios from "axios";

const API_BASE1 = import.meta.env.VITE_ANALYTICS_URL || "http://localhost:8001"


const api1 = axios.create({
    baseURL:API_BASE1,
})

export default api1
