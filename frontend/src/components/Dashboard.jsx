import React, { useEffect, useState } from 'react';

const Dashboard = ({ token, onSessionExpired }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/stats', { headers });
      if (statsRes.status === 401) {
        onSessionExpired?.();
        return;
      }
      const statsJson = await statsRes.json();
      setData(statsJson);

      // Fetch sessions to extract recent events
      const sessionsRes = await fetch('http://localhost:5000/api/sessions', { headers });
      if (sessionsRes.status === 401) {
        onSessionExpired?.();
        return;
      }
      const sessionsJson = await sessionsRes.json();
      
      // Flatten last 15 events
      const allEvents = [];
      sessionsJson.forEach(sess => {
        const browser = sess.metadata?.browser || 'Unknown';
        const os = sess.metadata?.os || 'Unknown';
        sess.events.forEach(evt => {
          allEvents.push({
            ...evt,
            browser,
            os,
            sessionId: sess._id
          });
        });
      });
      // Sort by timestamp descending
      allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentEvents(allEvents.slice(0, 10));
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the InsightTrack backend API.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s for real-time feel
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-md">progress_activity</span>
        <p className="text-sm font-medium">Fetching analytics dashboard details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-red-500 p-xl text-center">
        <span className="material-symbols-outlined text-5xl mb-md">cloud_off</span>
        <p className="font-bold text-lg mb-sm">Connection Refused</p>
        <p className="text-sm text-on-surface-variant max-w-md mb-lg">{error}</p>
        <button 
          onClick={() => { setLoading(true); fetchData(); }} 
          className="bg-primary text-on-primary px-xl py-md rounded-lg font-bold text-sm cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, devices, browsers, trend } = data;

  // Helpers to calculate SVG coordinates for the trend line
  const trendMax = Math.max(...trend.map(t => Math.max(t.pageviews, t.clicks, 5)));
  const width = 500;
  const height = 150;
  const padding = 20;

  const pointsPageviews = trend.map((t, idx) => {
    const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
    const y = height - padding - (t.pageviews / trendMax) * (height - padding * 2);
    return { x, y };
  });

  const pointsClicks = trend.map((t, idx) => {
    const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
    const y = height - padding - (t.clicks / trendMax) * (height - padding * 2);
    return { x, y };
  });

  const makePath = (points) => points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const makeAreaPath = (points) => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${makePath(points)} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
  };

  return (
    <div className="flex flex-col gap-xl">
      {/* Real-time indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Live Telemetry Pipeline Active</span>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-xs text-xs font-semibold text-primary hover:bg-primary/5 px-md py-sm rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        {/* Total Sessions */}
        <div className="bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 mb-xs">Total Sessions</p>
            <h3 className="text-2xl font-bold text-on-surface">{summary.totalSessions}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-md rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>

        {/* Total Pageviews */}
        <div className="bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 mb-xs">Page Views</p>
            <h3 className="text-2xl font-bold text-on-surface">{summary.totalEvents - summary.totalClicks}</h3>
          </div>
          <div className="bg-cyan-50 text-cyan-600 p-md rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">visibility</span>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 mb-xs">Recorded Clicks</p>
            <h3 className="text-2xl font-bold text-on-surface">{summary.totalClicks}</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-md rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">touch_app</span>
          </div>
        </div>

        {/* Average Pageviews */}
        <div className="bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 mb-xs">Pages / Session</p>
            <h3 className="text-2xl font-bold text-on-surface">{summary.avgPageViews}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-md rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">query_stats</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Trend Area Chart (Left 2 cols) */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-xs">Traffic & Interactions (Last 7 Days)</h4>
            <p className="text-xs text-on-surface-variant mb-lg">Chronological distribution of clicks and page views</p>
          </div>
          
          <div className="w-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {/* Gradients */}
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="clkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" strokeDasharray="3" />
              <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" strokeDasharray="3" />

              {/* Areas */}
              <path d={makeAreaPath(pointsPageviews)} fill="url(#pvGrad)" />
              <path d={makeAreaPath(pointsClicks)} fill="url(#clkGrad)" />

              {/* Lines */}
              <path d={makePath(pointsPageviews)} fill="none" stroke="rgb(6, 182, 212)" strokeWidth="2.5" strokeLinecap="round" />
              <path d={makePath(pointsClicks)} fill="none" stroke="rgb(99, 102, 241)" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interaction dots */}
              {pointsPageviews.map((p, idx) => (
                <circle key={`pv-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="white" stroke="rgb(6, 182, 212)" strokeWidth="2" />
              ))}
              {pointsClicks.map((p, idx) => (
                <circle key={`clk-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="white" stroke="rgb(99, 102, 241)" strokeWidth="2" />
              ))}

              {/* X Axis Labels */}
              {trend.map((t, idx) => {
                const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
                return (
                  <text key={`lbl-${idx}`} x={x} y={height - 4} fontSize="7" fill="rgba(100, 116, 139, 0.8)" textAnchor="middle">
                    {t.date}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="flex gap-lg justify-start mt-md">
            <div className="flex items-center gap-xs text-xs font-semibold text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
              Pageviews
            </div>
            <div className="flex items-center gap-xs text-xs font-semibold text-on-surface-variant">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
              Clicks
            </div>
          </div>
        </div>

        {/* Device breakdown & Browser breakdown (Right 1 col) */}
        <div className="bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm flex flex-col justify-between gap-md">
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-xs">Device Distribution</h4>
            <p className="text-xs text-on-surface-variant mb-md">Breakdown of incoming device categories</p>
            <div className="flex flex-col gap-sm">
              {devices.length === 0 ? (
                <p className="text-xs text-on-surface-variant">No device data recorded yet.</p>
              ) : (
                devices.map((dev, idx) => {
                  const total = devices.reduce((sum, d) => sum + d.count, 0);
                  const pct = total > 0 ? ((dev.count / total) * 100).toFixed(0) : 0;
                  const icons = { Desktop: 'desktop_windows', Mobile: 'phone_android', Tablet: 'tablet_mac' };
                  return (
                    <div key={idx} className="flex flex-col gap-xs">
                      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                        <span className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-sm">{icons[dev.name] || 'devices'}</span>
                          {dev.name}
                        </span>
                        <span>{pct}% ({dev.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-md">
            <h4 className="text-sm font-bold text-on-surface mb-xs">Browsers</h4>
            <div className="flex flex-wrap gap-xs">
              {browsers.length === 0 ? (
                <p className="text-xs text-on-surface-variant">No browser data.</p>
              ) : (
                browsers.map((br, idx) => (
                  <span key={idx} className="bg-slate-100 text-on-surface-variant/80 px-md py-sm rounded-lg text-xs font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-xs">language</span>
                    {br.name}: {br.count}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Event Feed */}
      <div className="bg-surface border border-outline-variant/10 rounded-2xl p-xl shadow-sm">
        <h4 className="text-sm font-bold text-on-surface mb-xs">Recent Event Logs</h4>
        <p className="text-xs text-on-surface-variant mb-lg">Latest chronological user interactions in the application</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 text-on-surface-variant font-bold">
                <th className="py-md px-md">Event Type</th>
                <th className="py-md px-md">Page URL</th>
                <th className="py-md px-md">Session ID</th>
                <th className="py-md px-md">Browser & OS</th>
                <th className="py-md px-md">Location Coords</th>
                <th className="py-md px-md">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-xl text-center text-on-surface-variant">
                    No visitor events ingested yet. Use the Mock E-Commerce Store page to generate events.
                  </td>
                </tr>
              ) : (
                recentEvents.map((evt, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/5 hover:bg-slate-50 transition-all">
                    <td className="py-md px-md">
                      <span className={`px-md py-sm rounded-lg text-[10px] font-bold ${
                        evt.eventType === 'click' 
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/30' 
                          : 'bg-cyan-50 text-cyan-600 border border-cyan-200/30'
                      }`}>
                        {evt.eventType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-md px-md font-mono text-on-surface/80">{evt.pageUrl}</td>
                    <td className="py-md px-md text-on-surface-variant/80 font-mono">{evt.sessionId.substring(0, 12)}...</td>
                    <td className="py-md px-md text-on-surface-variant/80">
                      {evt.browser} / {evt.os}
                    </td>
                    <td className="py-md px-md text-on-surface-variant/80 font-mono">
                      {evt.clickCoords ? `(${evt.clickCoords.percentX}%, ${evt.clickCoords.percentY}%)` : '-'}
                    </td>
                    <td className="py-md px-md text-on-surface-variant/80">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
