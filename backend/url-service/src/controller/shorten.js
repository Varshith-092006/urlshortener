import Url from "../model/urlModel.js";
import redisClient from "../../config/redis.js";
import shortid from "shortid";

export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    // 🧠 Validate URL
    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    if (!urlPattern.test(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    let shortCode = customCode || shortid.generate();

    // ❌ Prevent duplicate custom codes
    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return res.status(409).json({ error: "Custom short code already exists" });
    }

    // 🌐 Construct short URL (based on frontend or backend domain)
    const baseUrl = process.env.BASE_URL || "http://ScaleURL";
    const shortUrl = `${baseUrl}/${shortCode}`;

    // 🗃 Save to MongoDB
    const newUrl = await Url.create({
      originalUrl,
      shortCode,
    });

  // ⚡ Cache immediately with 24 hours TTL
  // Use SETEX to ensure the cache entry expires after 24 hours (24*60*60 seconds)
  await redisClient.setEx(shortCode, 24 * 60 * 60, originalUrl);

    return res.status(201).json({
      message: "Short URL created successfully",
      shortUrl,
      shortCode,
      originalUrl,
    });
  } catch (err) {
    console.error("Error in shortenUrl:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const redirectToOriginal = async (req, res) => {
  try {
    const { code } = req.params;

    // --- Rate limiter: allow up to 100 clicks per 60 seconds per shortCode ---
    // Implementation: INCR the counter and set EXPIRE on first creation. Only return 429
    // when the key still exists (TTL > 0) and count > 100. This ensures that after
    // the 60s window expires, a new window of 100 clicks is allowed.
    const rateKey = `rate:${code}`;
    try {
      const count = await redisClient.incr(rateKey);
      if (count === 1) {
        // First hit in this window, set 60s TTL
        await redisClient.expire(rateKey, 60);
      }

      if (count > 100) {
        // double-check that the key still exists / has TTL > 0 before rejecting
        // ttl: -2 = key does not exist, -1 = key exists but has no associated expire
        const ttl = await redisClient.ttl(rateKey);
        if (ttl > 0) {
          console.warn(`Rate limit exceeded for ${code}: ${count} (ttl=${ttl}s)`);
          return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
        } else {
          // If key somehow has no TTL or has expired, allow the request and ensure a TTL
          if (ttl === -1) {
            // ensure expire is set so window semantics hold
            await redisClient.expire(rateKey, 60);
          }
          // allow the request to continue (window has effectively reset)
        }
      }
    } catch (rlErr) {
      // If Redis errors, fail-open: allow request but log the error
      console.error("Rate limiter error (allowing request):", rlErr);
    }
    // 1️⃣ Check Redis cache for the original URL
    const cachedUrl = await redisClient.get(code);
    if (cachedUrl) {
      console.log(`Cache hit for ${code}`);

      // ⚡ Push a visit event to the Redis queue (list)
      await redisClient.rPush("visitQueue", JSON.stringify({ shortCode: code, timestamp: Date.now() }));

      return res.redirect(cachedUrl);
    }

    // 2️⃣ If not cached, check MongoDB
    const urlDoc = await Url.findOne({ shortCode: code });
    if (!urlDoc) {
      return res.status(404).json({ error: "Short URL not found" });
    }

  // 3️⃣ Cache the URL for future requests with 24 hours TTL
  await redisClient.setEx(code, 24 * 60 * 60, urlDoc.originalUrl);

    // 4️⃣ Push visit event to queue
    await redisClient.rPush("visitQueue", JSON.stringify({ shortCode: code, timestamp: Date.now() }));

    // 5️⃣ Redirect immediately (no waiting for DB)
    return res.redirect(urlDoc.originalUrl);
  } catch (err) {
    console.error("Error in redirect:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getVisitCount = async (req, res) => {
//   try {
//     const { code } = req.params;

//     const count = await redisClient.get(`visits:${code}`);
//     if (count === null) {
//       // fallback from DB
//       const urlDoc = await Url.findOne({ shortCode: code });
//       if (!urlDoc) return res.status(404).json({ error: "Short code not found" });
//       return res.json({ shortCode: code, visitCount: urlDoc.visitCount });
//     }

//     res.json({ shortCode: code, visitCount: parseInt(count) });
//   } catch (err) {
//     console.error("Error in getVisitCount:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

