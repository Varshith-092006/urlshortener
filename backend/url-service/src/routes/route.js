import express from "express";
import { shortenUrl,redirectToOriginal } from "../controller/shorten.js";

const router = express.Router();

// POST /api/shorten
router.post("/shorten", shortenUrl);
router.get("/:code", redirectToOriginal);

export default router;
