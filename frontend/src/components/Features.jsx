import React from "react";

const Features = () => {
  return (
    <div className="analytics-container">
      <div className="analytics-card">
        <h3>⚙️ Features & Architecture</h3>
        <div className="analytics-results">
          <section className="chart-section">
            <h4>Overview</h4>
            <p>
              ScaleURL is a microservices-based URL shortener and analytics
              platform. It focuses on low-latency redirects, accurate visit
              analytics, and operational scalability using Redis and MongoDB.
            </p>
          </section>

          <section className="chart-section">
            <h4>How the app works (request flow)</h4>
            <ol>
              <li>Client requests a new short URL → `url-service` validates and stores in MongoDB, caches in Redis.</li>
              <li>Client hits a short URL → `url-service` checks Redis cache and redirects immediately if found.</li>
              <li>If cache miss → `url-service` reads from MongoDB, caches the result, enqueues a visit event into Redis `visitQueue` and redirects.</li>
              <li>`analytics-service` consumes `visitQueue` (BLPOP) and atomically increments visit counters in MongoDB.</li>
            </ol>
          </section>

          <section className="chart-section">
            <h4>Backend architecture</h4>
            <ul>
              <li><strong>url-service</strong>: Node.js/Express — handles URL creation, redirects, Redis caching.</li>
              <li><strong>analytics-service</strong>: Node.js — background consumer that processes visit events and updates analytics.</li>
              <li><strong>Redis</strong>: caching layer and lightweight queue (visitQueue) for decoupling redirects from analytics processing.</li>
              <li><strong>MongoDB</strong>: persistent data store for URL records and aggregated analytics.</li>
              <li><strong>Frontend</strong>: React app with charts (Recharts) to visualize analytics.</li>
            </ul>
          </section>

          <section className="chart-section">
            <h4>Scalability patterns</h4>
            <ul>
              <li>Stateless microservices — scale `url-service` and `analytics-service` horizontally behind a load balancer.</li>
              <li>Redis cluster for high-throughput caching and queueing; avoid single-node bottlenecks.</li>
              <li>MongoDB replica set for read scaling and failover; optionally shard write-heavy collections (e.g., visits) for extreme scale.</li>
              <li>Use connection pooling and keep-alive for DB/Redis clients to reduce latency.</li>
              <li>Implement autoscaling based on CPU, queue length, or request latency.</li>
            </ul>
          </section>

          <section className="chart-section">
            <h4>Backend optimizations & best practices</h4>
            <ul>
              <li>Cache redirects in Redis with TTL to serve low-latency redirects and reduce DB reads.</li>
              <li>Use a Redis LIST (or stream) for visit events and let the analytics consumer process asynchronously to keep redirects fast.</li>
              <li>Apply indexing on MongoDB (shortCode) and compound indexes for analytics queries.</li>
              <li>Batch writes/updates in analytics consumer (bulkWrite) when processing many events.</li>
              <li>Rate limiting at `url-service` (implemented using Redis INCR+EXPIRE) to protect origin links and reduce abuse.</li>
              <li>Graceful degradation: if Redis fails, fall back to DB reads and fail-open for rate limiter if necessary (log and monitor).</li>
              <li>Use monitoring and tracing (Prometheus + Grafana, OpenTelemetry) to observe latency and queue lag.</li>
            </ul>
          </section>

          <section className="chart-section">
            <h4>Operational considerations</h4>
            <ul>
              <li>Health checks for services and readiness probes before serving traffic.</li>
              <li>Backpressure & circuit-breakers for downstream services.</li>
              <li>Alerting on queue length, Redis memory pressure, MongoDB replication lag, and error rates.</li>
              <li>Data retention & aggregation: roll-up or TTL old analytics data if storage cost matters.</li>
            </ul>
          </section>

          <section className="chart-section">
            <h4>Future scope</h4>
            <p>
              Monitoring, observability, and autoscaling are important production
              concerns planned for future work. Suggested items:
            </p>
            <ul>
              <li>Implement Prometheus metrics export and Grafana dashboards (cache hit ratio, redirect latency, queue lag).</li>
              <li>Instrument distributed tracing (OpenTelemetry) to trace requests across services.</li>
              <li>Autoscaling rules for `url-service` and `analytics-service` based on queue length, CPU, and request latency.</li>
              <li>Alerting and runbooks for incidents (Redis/Mongo failures, slow consumers).</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Features;
