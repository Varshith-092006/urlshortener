import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import './TopToday.css';

const truncate = (s, n = 50) => (s && s.length > n ? s.substring(0, n) + '...' : s);

const TopToday = () => {
  const [topUrls, setTopUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      try {
        const res = await api1.get('/analytics/top/today');
        if (res.data && Array.isArray(res.data.topUrls)) {
          setTopUrls(res.data.topUrls);
        } else {
          setTopUrls([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch top today:', err);
        toast.error('Failed to load top links for today');
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, []);

  // Map chart data safely
  const chartData = topUrls.map((u) => ({
    name: u.shortCode || truncate(u.originalUrl, 20),
    clicks: u.visitCount || 0,
  }));

  return (
    <div className="top-today-card card">
      <h3>Top 10 Most Clicked Short Links — Today</h3>

      {loading && <p>Loading...</p>}
      {!loading && topUrls.length === 0 && <p>No data for today.</p>}

      {!loading && topUrls.length > 0 && (
        <div className="top-today-grid">
          {/* Chart Section */}
          {/* <div className="top-today-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tick={{ fill: '#004fbdff' }}
                  tickLine={{ stroke: '#005cdeff' }}
                  axisLine={{ stroke: '#06449cff' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={160}
                  tick={{ fill: '#06459cff' }}
                  tickLine={{ stroke: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(14,165,233,0.1)' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="clicks" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div> */}

          {/* List Section */}
          <div className="top-today-list">
            {topUrls.map((u, idx) => (
              <div key={u.shortCode || u._id || idx} className="top-link">
                <div className="row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="rank">#{idx + 1}</div>
                    <div className="short-code">
                      {u.shortCode || '(no alias)'}
                    </div>
                  </div>
                  <div className="clicks">{u.visitCount || 0} clicks</div>
                </div>
                <div className="original">{truncate(u.originalUrl, 80)}</div>
                <div className="meta">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopToday;
