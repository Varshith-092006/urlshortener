// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import redisClient from "../config/redis.js"
import { connectDB } from "../config/connectDB.js";
import router from "./routes/route.js";
dotenv.config();


const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

app.use("/", router);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 URL Shortener Microservice is running...");
});

// Start server
const PORT = process.env.PORT || 8000;

// `config/redis.js` already connects the client during import, so don't call it as a function.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
