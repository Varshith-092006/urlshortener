# 🚀 ScaleURL — Scalable URL Shortener

**ScaleURL** is a high-performance, microservices-based URL shortener that focuses on **speed, scalability, and observability**.  
It supports real-time **analytics**, **Redis-based caching**, and **queue-driven background processing** for fast redirects and accurate insights.

---

## 🏗️ System Overview

This project is split into multiple services:

| Service | Description |
|----------|--------------|
| **backend/url-service** | Handles URL shortening, redirection, caching in Redis, and enqueues analytics events. |
| **backend/analytics-service** | Background worker that consumes visit events from Redis and updates analytics data in MongoDB. |
| **frontend** | React-based dashboard that allows users to create short URLs and visualize analytics via Recharts. |

---

## 🧠 Architecture Diagram

![ScaleURL Architecture](assets/architecture-url.jpg)

---

## ⚙️ How It Works — Request Flow

### 🔹 1. Create a Short URL
**Frontend → `url-service`**  
`POST /api/v1/url/shorten`  
- Validates the input URL.
- Stores mapping `{ shortCode → originalUrl }` in **MongoDB**.
- Caches mapping in **Redis** for faster redirects.

### 🔹 2. Redirect Flow
**Client → `url-service` → Redirect**
1. The service first checks **Redis** for the shortCode mapping.
2. If cached, instantly issues a **302 redirect**.
3. If cache miss, fetches from **MongoDB**, sets Redis cache (TTL), and pushes an event into **Redis Queue (`visitQueue`)** for analytics.

### 🔹 3. Analytics Processing
**`analytics-service` (Worker)**
- Continuously consumes `visitQueue` via `BLPOP`.
- Updates MongoDB counters asynchronously using `$inc` or `bulkWrite`.
- Ensures **low latency redirects** while still recording accurate analytics.

---

## ⚡ Backend Optimizations

### 🧩 Caching & Latency
- **Redis** stores `{ shortCode → originalUrl }` with TTL.
- Cache warming on new link creation.
- Cache invalidation when links are updated or expired.

### 🧵 Asynchronous Queue Processing
- Redirect service never blocks — events go into a **Redis queue**.
- **Analytics service** runs in the background, updating visit counts in batches.
- Reduces DB I/O load by ~90% under high traffic.

### 🗄️ Database Design
- MongoDB collection with a **unique index on `shortCode`**.
- Separate analytics collection for aggregate counters.
- Atomic `$inc` for visits; batch writes for scaling.

### 🧠 Rate Limiting & Abuse Control
- Uses Redis `INCR` + `EXPIRE` to apply per-IP rate limits.
- Example: 100 requests/minute per IP.
- Prevents spam, protects infrastructure from abuse.

### 🔁 Resilience & Fault Tolerance
- Automatic retries for transient Redis/Mongo issues.
- Graceful shutdown (drain in-flight requests).
- Circuit breaker for degraded Redis/Mongo state.

### 🔍 Observability & Monitoring
- Exposes metrics: cache hit ratio, queue length, redirect latency.
- Distributed tracing with **OpenTelemetry**.
- Structured logging for performance monitoring.

---

## 🧰 Local Development Setup

### 📦 Prerequisites
- Node.js (v18+)
- MongoDB
- Redis
- Docker (optional, for containerized setup)

### 🧑‍💻 Run Locally
```bash
# Clone the repo
git clone https://github.com/<your-username>/ScaleURL.git
cd ScaleURL

# Install dependencies
npm install

# Start backend services
cd backend/url-service && npm start
cd backend/analytics-service && npm start

# Start frontend
cd frontend && npm start
