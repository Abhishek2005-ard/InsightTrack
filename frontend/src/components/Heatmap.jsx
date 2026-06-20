import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const Heatmap = ({ token, onSessionExpired }) => {
  const [clicks, setClicks] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [loading, setLoading] = useState(true);
  const [dotSize, setDotSize] = useState(12);
  const [dotOpacity, setDotOpacity] = useState(0.6);

  const fetchHeatmapData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/heatmap`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        onSessionExpired?.();
        return;
      }
      const json = await res.json();
      setClicks(json);
      
      // Extract unique page URLs
      const uniquePages = [...new Set(json.map(c => c.pageUrl))];
      setPages(uniquePages);
      if (uniquePages.length > 0 && !selectedPage) {
        setSelectedPage(uniquePages[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-md">progress_activity</span>
        <p className="text-sm font-medium">Loading click coordinate data...</p>
      </div>
    );
  }

  // Filter clicks by selected page
  const filteredClicks = clicks.filter(c => c.pageUrl === selectedPage && c.clickCoords);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md border-b border-outline-variant/10 pb-md">
        <div>
          <h3 className="font-bold text-lg text-on-surface">Click Map Visualization</h3>
          <p className="text-xs text-on-surface-variant">Analyze where users click on specific pages of your site.</p>
        </div>

        {/* Page Selector */}
        <div className="flex items-center gap-xs">
          <span className="text-xs font-bold text-on-surface-variant">Select Page:</span>
          <select 
            value={selectedPage} 
            onChange={(e) => setSelectedPage(e.target.value)}
            className="border border-outline-variant/60 rounded-lg p-sm text-xs bg-surface text-on-surface font-semibold focus:outline-none focus:border-primary cursor-pointer"
          >
            {pages.length === 0 ? (
              <option value="">No recorded pages</option>
            ) : (
              pages.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="flex flex-wrap gap-lg bg-slate-50 border border-outline-variant/10 rounded-xl p-md">
        <div className="flex items-center gap-sm">
          <span className="text-xs font-bold text-on-surface-variant">Dot Size:</span>
          <input 
            type="range" 
            min="6" 
            max="30" 
            value={dotSize} 
            onChange={(e) => setDotSize(Number(e.target.value))} 
            className="w-24 accent-primary cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-on-surface-variant">{dotSize}px</span>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-xs font-bold text-on-surface-variant">Opacity:</span>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.05"
            value={dotOpacity} 
            onChange={(e) => setDotOpacity(Number(e.target.value))} 
            className="w-24 accent-primary cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-on-surface-variant">{(dotOpacity * 100).toFixed(0)}%</span>
        </div>
        <div className="ml-auto text-xs font-semibold text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-sm">ads_click</span>
          Total Clicks on Page: {filteredClicks.length}
        </div>
      </div>

      {/* Wireframe Canvas Container */}
      <div className="relative border border-outline-variant/10 rounded-xl overflow-hidden bg-slate-100 flex flex-col items-center p-lg">
        
        {/* Wireframe canvas representing the page layout */}
        <div className="relative w-full max-w-[800px] aspect-[16/10] bg-white border border-outline-variant/10 rounded-lg shadow-sm overflow-hidden select-none">
          
          {/* 1. MOCK WIREFRAME BACKDROP FOR LANDING PAGE */}
          {selectedPage === '/' && (
            <div className="w-full h-full flex flex-col p-lg justify-between opacity-30 text-left">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-sm">
                <div className="font-bold text-sm text-slate-800">InsightTrack</div>
                <div className="flex gap-sm text-[10px] font-semibold text-slate-600">
                  <span>Platform</span>
                  <span>Features</span>
                  <span>Simulator</span>
                </div>
              </div>
              {/* Hero Section */}
              <div className="flex flex-col items-center text-center my-auto gap-sm max-w-md mx-auto">
                <div className="font-black text-xl text-slate-800 leading-tight">Understand Why Your Users Convert—Or Leave.</div>
                <div className="text-[10px] text-slate-500">Connect the dots between user actions and business outcomes.</div>
                <div className="flex gap-xs mt-xs">
                  <div className="bg-primary text-white text-[9px] font-bold px-lg py-sm rounded">Start Free Trial</div>
                  <div className="bg-slate-100 text-slate-700 text-[9px] font-bold px-lg py-sm rounded">Launch Live Demo</div>
                </div>
              </div>
              {/* Footer */}
              <div className="border-t border-slate-200 pt-xs text-[8px] text-slate-400 text-center">
                © InsightTrack. Built for developers.
              </div>
            </div>
          )}

          {/* 2. MOCK WIREFRAME BACKDROP FOR MOCK E-COMMERCE PAGE */}
          {selectedPage && selectedPage.includes('tracker') && (
            <div className="w-full h-full flex flex-col justify-between opacity-30 text-left">
              {/* Header */}
              <div className="bg-indigo-600 text-white p-md text-center">
                <div className="font-bold text-xs">InsightTrack Mock E-Commerce Store</div>
                <div className="text-[8px] opacity-80">Simulating user interactions to test client-side tracking script.</div>
              </div>
              {/* Product */}
              <div className="p-xl my-auto max-w-sm mx-auto flex flex-col gap-sm border border-slate-200 rounded-lg shadow-sm">
                <div className="w-full h-24 bg-slate-100 rounded"></div>
                <div className="font-bold text-xs text-slate-800">Premium Leather Backpack</div>
                <div className="text-[9px] text-slate-500">Handcrafted durable backpack ideal for daily engineering commutes.</div>
                <div className="flex gap-xs">
                  <div className="bg-indigo-600 text-white text-[9px] font-bold px-lg py-sm rounded">Add to Cart</div>
                  <div className="bg-indigo-700 text-white text-[9px] font-bold px-lg py-sm rounded">Buy Now</div>
                </div>
              </div>
              {/* Footer */}
              <div className="p-sm text-[8px] text-slate-400 text-center bg-slate-50">
                Mock store page loading tracker.js.
              </div>
            </div>
          )}

          {/* 3. DEFAULT BACKDROP FOR ANY OTHER PAGE */}
          {selectedPage !== '/' && !selectedPage.includes('tracker') && (
            <div className="w-full h-full flex flex-col p-lg justify-center items-center text-center opacity-30">
              <span className="material-symbols-outlined text-4xl text-slate-400">web</span>
              <div className="font-bold text-sm text-slate-700 mt-sm">Page: {selectedPage}</div>
              <div className="text-[10px] text-slate-500">Overlaying recorded click coordinates.</div>
            </div>
          )}

          {/* GLOWING HEATMAP CLICK POINTS OVERLAY */}
          {filteredClicks.map((click, idx) => (
            <div
              key={idx}
              className="absolute rounded-full pointer-events-auto group cursor-crosshair transition-all duration-300"
              style={{
                left: `${click.clickCoords.percentX}%`,
                top: `${click.clickCoords.percentY}%`,
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                boxShadow: `0 0 ${dotSize}px ${dotSize/2}px rgba(249, 115, 22, ${dotOpacity})`,
                opacity: dotOpacity
              }}
            >
              {/* Tooltip on Hover */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-xs bg-slate-900 text-white text-[10px] py-xs px-md rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                Click: ({click.clickCoords.percentX}%, {click.clickCoords.percentY}%) <br />
                {new Date(click.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Heatmap;
