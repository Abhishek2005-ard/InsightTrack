import React, { useEffect, useState } from 'react';

const Sessions = ({ token, onSessionExpired }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        onSessionExpired?.();
        return;
      }
      const json = await res.json();
      setSessions(json);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 6000); // refresh sessions list
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-md">progress_activity</span>
        <p className="text-sm font-medium">Loading visitor session journals...</p>
      </div>
    );
  }

  // Helper to format session duration
  const getSessionDuration = (events) => {
    if (events.length <= 1) return '0s';
    const start = new Date(events[0].timestamp);
    const end = new Date(events[events.length - 1].timestamp);
    const diffMs = end - start;
    const diffSecs = Math.round(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s`;
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col gap-lg text-left">
      <div>
        <h3 className="font-bold text-lg text-on-surface">Visitor Journey Timeline</h3>
        <p className="text-xs text-on-surface-variant">Inspect individual session recordings, metadata properties, and click histories.</p>
      </div>

      <div className="flex flex-col gap-md">
        {sessions.length === 0 ? (
          <div className="border border-outline-variant/10 rounded-xl p-xl text-center text-on-surface-variant bg-slate-50">
            <span className="material-symbols-outlined text-4xl mb-sm text-slate-400">group_off</span>
            <p className="text-sm font-semibold">No active sessions detected.</p>
            <p className="text-xs max-w-sm mx-auto mt-xs">Use the tracker script in the E-Commerce Store or Landing Page to generate visitor activities.</p>
          </div>
        ) : (
          sessions.map((sess, idx) => {
            const isExpanded = expandedSessionId === sess._id;
            const duration = getSessionDuration(sess.events);
            const totalEvents = sess.events.length;
            const browser = sess.metadata?.browser || 'Unknown';
            const os = sess.metadata?.os || 'Unknown';
            const device = sess.metadata?.device || 'Desktop';
            const screen = sess.metadata?.screenWidth ? `${sess.metadata.screenWidth}x${sess.metadata.screenHeight}` : 'Unknown';

            const deviceIcons = { Desktop: 'desktop_windows', Mobile: 'phone_android', Tablet: 'tablet_mac' };

            return (
              <div 
                key={sess._id} 
                className="bg-surface border border-outline-variant/15 rounded-xl shadow-sm overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedSessionId(isExpanded ? null : sess._id)}
                  className="p-md sm:p-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md cursor-pointer hover:bg-slate-50/50 transition-all select-none"
                >
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary bg-primary/5 p-sm rounded-lg">
                      {deviceIcons[device] || 'devices'}
                    </span>
                    <div>
                      <div className="flex items-center gap-xs">
                        <span className="text-xs font-bold text-on-surface font-mono">{sess._id.substring(0, 16)}...</span>
                        <span className="text-[10px] bg-slate-100 text-on-surface-variant font-bold px-md py-sm rounded-lg">
                          {device}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-xs mt-xs text-[10px] text-on-surface-variant/80 font-semibold">
                        <span>{browser}</span>
                        <span>•</span>
                        <span>{os}</span>
                        <span>•</span>
                        <span>{screen}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-lg ml-auto sm:ml-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-on-surface">{totalEvents} Events</div>
                      <div className="text-[10px] text-on-surface-variant font-semibold">Duration: {duration}</div>
                    </div>
                    
                    <span className="material-symbols-outlined text-on-surface-variant/60">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* Expanded Timeline details */}
                {isExpanded && (
                  <div className="border-t border-outline-variant/10 bg-slate-50/30 p-lg flex flex-col gap-md">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Session Activity Stream</h4>
                    
                    <div className="relative pl-xl border-l-2 border-primary/20 flex flex-col gap-lg py-sm">
                      {sess.events.map((evt, eIdx) => {
                        const timeStr = new Date(evt.timestamp).toLocaleTimeString('en-US', { hour12: false });
                        
                        return (
                          <div key={evt._id || eIdx} className="relative flex flex-col gap-xs">
                            {/* Timeline bullet indicator */}
                            <span 
                              className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                                evt.eventType === 'click' ? 'bg-indigo-500' : 'bg-cyan-500'
                              }`}
                              style={{ transform: 'translateX(-50%)' }}
                            ></span>

                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-md py-sm rounded-lg ${
                                evt.eventType === 'click' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'
                              }`}>
                                {evt.eventType === 'click' ? 'CLICKED EVENT' : 'VIEWED PAGE'}
                              </span>
                              <span className="text-[10px] font-mono text-on-surface-variant font-bold">{timeStr}</span>
                            </div>

                            <div className="text-xs font-semibold text-on-surface/85">
                              {evt.eventType === 'page_view' ? (
                                <span>Visited path <code className="bg-slate-100 px-sm py-xs rounded font-mono font-bold text-primary">{evt.pageUrl}</code></span>
                              ) : (
                                <span>
                                  Clicked coordinates: <code className="bg-slate-100 px-sm py-xs rounded font-mono font-bold text-indigo-700">({evt.clickCoords?.percentX}%, {evt.clickCoords?.percentY}%)</code> on <code className="bg-slate-100 px-sm py-xs rounded font-mono font-bold">{evt.pageUrl}</code>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sessions;
