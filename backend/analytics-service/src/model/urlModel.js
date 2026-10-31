import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, unique: true, index: true },
  originalUrl: { type: String, required: true, index: true },
  visitCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
});

// ✅ Compound index for analytics queries (for top URLs by date)
urlSchema.index({ createdAt: -1, visitCount: -1 });

const Url = mongoose.model("Url", urlSchema);
export default Url;
