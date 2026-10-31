import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
  visitCount: { type: Number, default: 0 }, // ✅ added
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model("Url", urlSchema);
export default Url;
