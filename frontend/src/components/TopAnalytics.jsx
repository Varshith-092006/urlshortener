import React, { useState, useEffect } from 'react';
import api1 from '../api1';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import './TopAnalytics.css';

const TopAnalytics = () => {
  const [topUrls, setTopUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // You can modify the endpoint based on timeRange if you add that functionality
      const res = await api1.get(`/analytics/top/${timeRange}`);
      if (res.data && res.data.topUrls) {
        setTopUrls(res.data.topUrls);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n-1) + "..." : str;
  };

  const chartData = topUrls.map(url => ({
    name: url.shortCode,
    clicks: url.visitCount,
    url: truncate(url.originalUrl, 30)
  })).sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>URL Analytics Dashboard</h1>
        <div className="time-filter">
          <button 
            className={timeRange === 'today' ? 'active' : ''} 
            onClick={() => setTimeRange('today')}
          >
            Today
          </button>
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top URLs Bar Chart */}
        <div className="analytics-card">
          <h2>Top 10 Most Clicked URLs</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: '#64748b' }}
                  label={{ value: 'Clicks', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p className="label">Short Code: {label}</p>
                          <p className="clicks">{payload[0].value} clicks</p>
                          <p className="url">{payload[0].payload.url}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="clicks" 
                  fill="#0ea5e9" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* URL Details Table */}
        <div className="analytics-card">
          <h2>URL Details</h2>
          <div className="url-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Short Code</th>
                  <th>Clicks</th>
                  <th>Original URL</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((url, index) => (
                  <tr key={url.name}>
                    <td className="rank">#{index + 1}</td>
                    <td className="short-code">{url.name}</td>
                    <td className="clicks">{url.clicks}</td>
                    <td className="url" title={url.url}>{url.url}</td>
                    <td className="date">{new Date(topUrls[index].createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="refresh-button">
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export default TopAnalytics;