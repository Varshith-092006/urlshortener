import React, { useState } from "react";
import api1 from "../api1";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import TopToday from './TopToday';

const Analytics = () => {
  const [shortCode, setShortCode] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!shortCode.trim()) return toast.error("Enter a short code");
    setLoading(true);
    try {
      const res = await api1.get(`/analytics/${shortCode}`);
      setAnalyticsData(res.data.analytics);
    } catch (err) {
      toast.error(err.response?.data?.error || "Not found");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getDailyVisitsData = () => {
    if (!analyticsData?.dailyVisits) return [];
    return Object.entries(analyticsData.dailyVisits).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visits: count
    }));
  };

  const getReferrerData = () => {
    if (!analyticsData?.referrers) return [];
    return Object.entries(analyticsData.referrers).map(([referrer, count]) => ({
      name: referrer || 'Direct',
      value: count
    }));
  };

  const getDeviceData = () => {
    if (!analyticsData?.devices) return [];
    return Object.entries(analyticsData.devices).map(([device, count]) => ({
      name: device,
      value: count
    }));
  };

  const getBrowserData = () => {
    if (!analyticsData?.browsers) return [];
    return Object.entries(analyticsData.browsers).map(([browser, count]) => ({
      name: browser,
      value: count
    }));
  };

  const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: '#0ea5e9', fontWeight: 600 }}>
            {payload[0].value} visits
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="analytics-container">
      <div className="card analytics-card">
       <h3 style={{ borderRadius: "10px" }}>ScaleURL Analytics</h3>
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter short code to view analytics"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchAnalytics()}
          />
          <button onClick={fetchAnalytics} disabled={loading}>
            {loading ? 'Loading...' : 'View Analytics'}
          </button>
        </div>

        {analyticsData && (
          <div className="analytics-results">
            {/* Overview Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ fontSize: '1.875rem' }}>👆</div>
                <div className="stat-value" style={{ fontSize: '0.975rem' }}>{analyticsData.visitCount}</div>
                <div className="stat-label">Total Visits</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ fontSize: '1.875rem' }}>📅</div>
                <div className="stat-value" style={{ fontSize: '0.975rem' }} >
                  {new Date(analyticsData.createdAt).toLocaleDateString()}
                </div>
                <div className="stat-label">Created Date</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ fontSize: '1.875rem' }}>🔗</div>
                <div className="stat-value small-url" style={{ fontSize: '0.675rem' }}>
                  {analyticsData.originalUrl?.length > 80 
                    ? `${analyticsData.originalUrl.substring(0, 80)}...`
                    : analyticsData.originalUrl
                  }
                </div>
                <div className="stat-label">Original URL</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ fontSize: '1.875rem' }}>🆔</div>
                <div className="stat-value" style={{ fontSize: '0.975rem' }}>{analyticsData.shortCode}</div>
                <div className="stat-label">Short Code</div>
              </div>
            </div>

            {/* Daily Visits Chart */}
            {getDailyVisitsData().length > 0 && (
              <div className="chart-section">
                <h4>Daily Visits Trend</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={getDailyVisitsData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Referrers Pie Chart */}
              {getReferrerData().length > 0 && (
                <div className="chart-card">
                  <h4>Traffic Sources</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={getReferrerData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {getReferrerData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Devices Pie Chart */}
              {getDeviceData().length > 0 && (
                <div className="chart-card">
                  <h4>Devices Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={getDeviceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {getDeviceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Browser Data */}
            {getBrowserData().length > 0 && (
              <div className="chart-section">
                <h4>Browser Usage</h4>
                <div className="browser-list">
                  {getBrowserData().map((browser, index) => (
                    <div key={browser.name} className="browser-item">
                      <span className="browser-name">{browser.name}</span>
                      <div className="browser-bar">
                        <div 
                          className="browser-fill"
                          style={{ 
                            width: `${(browser.value / Math.max(...getBrowserData().map(b => b.value))) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                      <span className="browser-count">{browser.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      {/* Top today charts placed below the analytics dashboard */}
      <TopToday />
    </>
  );
};

export default Analytics;