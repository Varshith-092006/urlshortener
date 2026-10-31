import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Url from "./model/urlModel.js";
import cors from "cors";
import redisClient from "../config/redis.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set. Analytics service cannot start.");
  process.exit(1);
}

// ✅ Background Queue Processor (you can reattach Redis queue later if needed)
async function processQueue() {
  console.log("📥 Listening to Redis visitQueue...");
  console.log("📥 Visit queue processor initialized (Redis queue removed).");
  // Left placeholder if you reintroduce message queue logic later

  while (true) {
    try {
      const data = await redisClient.blPop("visitQueue", 0);
      if (!data) continue;

      const message = JSON.parse(data.element);
      const { shortCode } = message;

      console.log(`🔹 Processing visit for: ${shortCode}`);

      await Url.findOneAndUpdate(
        { shortCode },
        { $inc: { visitCount: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error("❌ Error processing queue:", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Analytics service connected to MongoDB");

    // Ensure indexes exist before serving traffic
    await Url.syncIndexes();
    console.log("⚙️ MongoDB indexes synced successfully.");

    processQueue();

    // ✅ Health check
    app.get("/", (req, res) => {
      res.send("📊 Analytics Service is Running...");
    });

    // ✅ Get analytics by shortCode
    app.get("/analytics/:shortCode", async (req, res) => {
      try {
        const { shortCode } = req.params;
        const urlData = await Url.findOne({ shortCode }).lean();

        if (!urlData) {
          return res.status(404).json({ error: "Short URL not found" });
        }

        res.status(200).json({
          success: true,
          analytics: {
            originalUrl: urlData.originalUrl,
            shortCode: urlData.shortCode,
            visitCount: urlData.visitCount,
            createdAt: urlData.createdAt,
          },
        });
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ✅ Get top 10 most clicked links today
    app.get("/analytics/top/:range", async (req, res) => {
  try {
    const { range } = req.params;
    const now = new Date();
    let start, end = new Date();

    // Define date ranges
    if (range === "today") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } 
    else if (range === "week") {
      // Get Monday as the start of the week
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } 
    else if (range === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } 
    else {
      return res.status(400).json({ error: "Invalid range parameter" });
    }

    const topUrls = await Url.find({
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ visitCount: -1 })
      .limit(10)
      .select("shortCode originalUrl visitCount createdAt -_id");

    res.status(200).json({
      success: true,
      range,
      count: topUrls.length,
      topUrls,
    });
  } catch (error) {
    console.error("❌ Error fetching top URLs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


    app.listen(PORT, () => {
      console.log(`🚀 Analytics service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
