import React, { useState, useEffect, useRef } from 'react';

const LandingPage = ({ onGetStarted, isLoggedIn }) => {
  const [logs, setLogs] = useState([
    { id: 1, type: 'INFO', time: '14:32:01', msg: 'InsightTrack pipeline initialized successfully' },
    { id: 2, type: 'DATA', time: '14:32:02', msg: 'Edge-node US-East handshake established (12ms)' },
    { id: 3, type: 'EVENT', time: '14:32:05', msg: 'Session started: sess_948a2bc3f' },
    { id: 4, type: 'EVENT', time: '14:32:06', msg: 'Event tracked: landing_hero_cta_click' },
    { id: 5, type: 'INFO', time: '14:32:08', msg: 'Processing heatmap segment #4019' },
  ]);

  const [copied, setCopied] = useState(false);
  const [chartBars, setChartBars] = useState([45, 60, 52, 70, 85, 90, 78, 65, 80, 95, 88, 70, 72, 85, 99]);
  
  // Funnel Simulator State
  const [friction, setFriction] = useState(40); // 0 to 100
  const visitors = 100000;
  
  // Funnel Simulator Calculations
  const clickRate = Math.round(95 - (friction * 0.65));
  const clicks = Math.round(visitors * (clickRate / 100));
  const convRate = parseFloat((15 - (friction * 0.12)).toFixed(1));
  const conversions = Math.round(clicks * (convRate / 100));
  const revenue = conversions * 45;
  const overallRate = parseFloat(((conversions / visitors) * 100).toFixed(2));

  const terminalBodyRef = useRef(null);

  // Dynamic log generator
  useEffect(() => {
    const eventMsgs = [
      'Button clicked: cta_start_free',
      'Scroll depth: 75% reached (sess_293a)',
      'Form submitted: newsletter_signup',
      'Page viewed: /pricing',
      'Funnel step complete: checkout_step_2',
      'Hover detected: pro_tier_card',
      'Session ended: sess_948a2bc3f (duration: 4m 12s)',
    ];
    const infoMsgs = [
      'WebSocket partition re-balanced to cluster_EU_WEST',
      'Garbage collector sweep: cleared 4.2 MB',
      'Edge latency stabilized: 11.4ms average',
      'Indexed events batch #8292 to main cluster',
    ];
    const dataMsgs = [
      'S3 raw database partition write confirmed',
      'Flushed 150 events buffer to Clickhouse DB',
      'Replay file chunk 4 uploaded successfully',
    ];

    const interval = setInterval(() => {
      const types = ['EVENT', 'INFO', 'DATA'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      let msg = '';
      
      if (randomType === 'EVENT') msg = eventMsgs[Math.floor(Math.random() * eventMsgs.length)];
      else if (randomType === 'INFO') msg = infoMsgs[Math.floor(Math.random() * infoMsgs.length)];
      else msg = dataMsgs[Math.floor(Math.random() * dataMsgs.length)];

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs((prevLogs) => {
        const nextLogs = [
          ...prevLogs,
          { id: Date.now(), type: randomType, time: timeStr, msg }
        ];
        return nextLogs.slice(-15);
      });

      // Animate chart bars slightly
      setChartBars((prevBars) => 
        prevBars.map(bar => {
          const change = Math.floor(Math.random() * 15) - 7;
          return Math.max(30, Math.min(100, bar + change));
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal body
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm install @insighttrack/sdk-web');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary/30">
      {/* Background ambient glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.05)_0%,rgba(59,130,246,0.02)_50%,transparent_100%)] top-[-100px] left-1/2 -translate-x-1/2 pointer-events-none z-[1]"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.03)_0%,transparent_80%)] bottom-[20%] -right-[100px] pointer-events-none z-[1]"></div>

      {/* Top Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 shadow-md shadow-primary/5">
        <div className="max-w-container-max mx-auto px-gutter py-md flex justify-between items-center">
          <a className="flex items-center gap-sm font-display-sm text-display-sm font-bold tracking-tight text-on-surface" href="#">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>filter_alt</span>
            <span>InsightTrack</span>
          </a>
          <div className="hidden md:flex items-center gap-lg">
            <a className="text-primary font-bold border-b-2 border-primary py-1" href="#">Platform</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#features">Features</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#simulator">Simulator</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#dashboard" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Dashboard</a>
          </div>
          <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md active:scale-95 transition-transform duration-150" onClick={onGetStarted}>
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-3xl pb-2xl px-gutter max-w-container-max mx-auto overflow-hidden text-center flex flex-col items-center">
        <h1 className="font-display-lg text-display-lg md:text-[80px] leading-tight mb-md text-gradient-hero max-w-4xl">
          See exactly how users interact with your web app.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-2xl">
          Track clicks, map page-view patterns, and explore visitor session journeys in real time. InsightTrack is a lightweight, full-stack analytics platform built to keep your data simple and clean.
        </p>
        <div className="flex flex-col sm:flex-row gap-md">
          <button className="bg-gradient-to-r from-primary to-secondary text-on-primary px-2xl py-md rounded-xl font-label-md text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer" onClick={onGetStarted}>
            {isLoggedIn ? 'Go to Dashboard' : 'Open Dashboard'}
          </button>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-xl px-gutter max-w-container-max mx-auto" id="features">
        <div className="text-center mb-xl">
          <h2 className="font-display-sm text-display-sm text-on-surface mb-sm">Built for Performance. Engineered for Insight.</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
            Everything you need to capture user journeys and optimize conversion paths without overloading your website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Feature 1 */}
          <div className="md:col-span-8 glass-card rounded-2xl p-lg flex flex-col justify-between group">
            <div className="mb-xl">
              <span className="material-symbols-outlined text-primary text-4xl mb-md">query_stats</span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Real-time Event Tracking</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Never miss a click. Capture every interaction—taps, scroll depths, and forms—in real time. The lightweight script loads asynchronously and runs outside the main thread, keeping your Lighthouse scores perfect.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-md font-mono text-sm space-y-2">
              <div className="flex items-center gap-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-100 font-semibold">checkout_completed</span>
                <span className="ml-auto text-slate-400 text-xs">just now</span>
              </div>
              <div className="w-full h-[1px] bg-slate-800"></div>
              <div className="flex items-center gap-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-100 font-semibold">card_declined</span>
                <span className="ml-auto text-slate-400 text-xs">2s ago</span>
              </div>
              <div className="w-full h-[1px] bg-slate-800"></div>
              <div className="flex items-center gap-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-slate-100 font-semibold">newsletter_opt_in</span>
                <span className="ml-auto text-slate-400 text-xs">5s ago</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="md:col-span-4 glass-card rounded-2xl p-lg flex flex-col justify-between">
            <div className="mb-md">
              <span className="material-symbols-outlined text-secondary text-4xl mb-md">heat_pump</span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Behavioral Heatmaps</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                See what catches their eye. Turn raw data into visual clarity with instant click-maps and scroll heatmaps. Spot where users get stuck.
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-200/60 flex flex-col p-sm">
              <div className="h-4 bg-slate-200/60 rounded mb-sm"></div>
              <div className="flex-grow bg-slate-100/50 rounded flex items-center justify-center relative">
                <div className="px-md py-sm bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-semibold z-10">Submit Form</div>
                {/* Heatmap overlay glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_80px_at_50%_50%,rgba(239,68,68,0.45)_0%,rgba(245,158,11,0.2)_40%,rgba(16,185,129,0.08)_70%,transparent_100%)] pointer-events-none group-hover:bg-[radial-gradient(circle_100px_at_50%_50%,rgba(239,68,68,0.55)_0%,rgba(245,158,11,0.3)_45%,rgba(16,185,129,0.12)_75%,transparent_100%)] transition-all duration-300"></div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="md:col-span-4 glass-card rounded-2xl p-lg">
            <span className="material-symbols-outlined text-tertiary text-4xl mb-md">videocam</span>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Session Replays</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Step into your users' shoes. Reconstruct sessions exactly as they happened. Watch full replays of clicks, page transitions, and form typing to catch bugs.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-8 glass-card rounded-2xl p-lg overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center mb-md">
              <div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">Lighthouse Score Impact: 0%</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Active tracking nodes: 1,204 | Avg Latency: 12ms. Keep your app lightning fast.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-sm py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600 text-xs font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Stream</span>
              </div>
            </div>
            <div className="h-[180px] flex items-end gap-1.5 pt-sm">
              {chartBars.map((height, i) => (
                <div 
                  key={i} 
                  className="flex-grow bg-gradient-to-t from-primary/10 to-primary/60 rounded-t hover:from-primary/20 hover:to-cyan-400 transition-all duration-300"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Log Stream Section */}
      <section className="py-2xl bg-surface-container-lowest/50 relative overflow-hidden px-gutter">
        <div className="text-center mb-xl">
          <h2 className="font-display-sm text-display-sm text-on-surface mb-sm">Live Infrastructure Stream</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Watch real-time interaction packets process through our global edge network.</p>
        </div>
        <div className="bg-slate-900 rounded-xl font-label-md text-label-md overflow-hidden max-w-4xl mx-auto border border-slate-800 shadow-2xl">
          <div className="bg-slate-950/60 px-md py-sm border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-slate-400 font-mono text-xs">terminal — insighttrack-edge-stream</span>
          </div>
          <div className="p-md h-64 overflow-y-auto font-mono text-sm space-y-2 bg-slate-950" ref={terminalBodyRef}>
            {logs.map((log) => (
              <div key={log.id} className="flex gap-sm animate-[log-fade-in_0.25s_ease_forwards]">
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase ${
                  log.type === 'INFO' ? 'bg-indigo-500/15 text-indigo-300' :
                  log.type === 'EVENT' ? 'bg-purple-500/15 text-purple-300' :
                  'bg-cyan-500/15 text-cyan-300'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-500">[{log.time}]</span>
                <span className="text-slate-300">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Funnel Simulator Section */}
      <section className="py-2xl px-gutter bg-surface-container-low/30 relative z-10" id="simulator">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-xl">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-primary/10 rounded-full border border-primary/20 mb-md">
              <span className="material-symbols-outlined text-primary text-sm">science</span>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Interactive Sandbox</span>
            </div>
            <h2 className="font-display-sm text-display-sm text-on-surface mb-sm">Simulate Your Conversion Potential</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              Drag the slider to adjust friction (page load speed, signup steps, visual noise) and watch the conversion funnel scale.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
            {/* Control Panel */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-lg flex flex-col gap-lg">
              <div>
                <h4 className="font-headline-lg text-lg text-on-surface mb-xs">Funnel Friction Controls</h4>
                <p className="text-sm text-on-surface-variant">Fine-tune your UX parameters to forecast visitor conversions and revenue.</p>
              </div>

              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-on-surface">UX Friction & Latency</span>
                  <span className="text-sm font-bold text-primary">{friction}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={friction}
                  onChange={(e) => setFriction(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-200" 
                />
                <div className="flex justify-between text-xs text-on-surface-variant/60">
                  <span>Fast & Frictionless (0%)</span>
                  <span>Slow & Complex (100%)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-md border-t border-outline-variant/10 pt-lg">
                <div className="text-center">
                  <div className="text-xs text-on-surface-variant/70 mb-1">Click-Through</div>
                  <div className="text-lg font-bold text-primary">{clickRate}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-on-surface-variant/70 mb-1">Conv. Rate</div>
                  <div className="text-lg font-bold text-secondary">{overallRate}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-on-surface-variant/70 mb-1">Est. Revenue</div>
                  <div className="text-lg font-bold text-emerald-600">${revenue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Visual Funnel Representation */}
            <div className="lg:col-span-7 flex flex-col gap-md">
              {/* Funnel Step 1 */}
              <div className="flex items-center gap-md">
                <div className="w-24 text-right text-xs font-mono text-on-surface-variant">100,000 Users</div>
                <div className="grow bg-primary/10 border border-primary/20 rounded-xl p-md flex justify-between items-center transition-all duration-300" style={{ width: '100%' }}>
                  <span className="font-semibold text-sm">1. Website Visitors</span>
                  <span className="text-xs font-bold text-primary bg-primary/15 px-2 py-0.5 rounded">100%</span>
                </div>
              </div>

              {/* Funnel Step 2 */}
              <div className="flex items-center gap-md">
                <div className="w-24 text-right text-xs font-mono text-on-surface-variant">{clicks.toLocaleString()} Users</div>
                <div className="grow">
                  <div 
                    className="bg-secondary/10 border border-secondary/20 rounded-xl p-md flex justify-between items-center transition-all duration-300 min-w-[30%]" 
                    style={{ width: `${Math.max(30, clickRate)}%` }}
                  >
                    <span className="font-semibold text-sm">2. Feature Interaction</span>
                    <span className="text-xs font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded">{clickRate}%</span>
                  </div>
                </div>
              </div>

              {/* Funnel Step 3 */}
              <div className="flex items-center gap-md">
                <div className="w-24 text-right text-xs font-mono text-on-surface-variant">{conversions.toLocaleString()} Users</div>
                <div className="grow">
                  <div 
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-md flex justify-between items-center transition-all duration-300 min-w-[20%]" 
                    style={{ width: `${Math.max(20, overallRate * 6)}%` }}
                  >
                    <span className="font-semibold text-sm">3. Conversions</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{overallRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Code Steps */}
      <section className="py-2xl px-gutter max-w-container-max mx-auto text-center" id="docs">
        <h2 className="font-display-sm text-display-sm text-on-surface mb-sm">Integrate in Minutes</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Add tracking to your codebase with just three simple steps.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mt-xl relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[40px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent -z-10"></div>
          
          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-lg group-hover:border-primary transition-colors text-2xl font-bold text-primary group-hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]">1</div>
            <h4 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Install the Tracker</h4>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[250px]">Add our optimized web tracker via npm or a CDN script tag.</p>
            <div className="bg-surface-container border border-outline-variant/60 rounded-lg p-md font-mono text-sm max-w-md mx-auto flex justify-between items-center mt-md gap-4">
              <span className="text-blue-700 font-semibold">npm install @insighttrack/sdk-web</span>
              <button className="text-on-surface-variant hover:text-on-surface bg-none border-none cursor-pointer" onClick={copyToClipboard}>
                <span className="material-symbols-outlined text-md">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-lg group-hover:border-secondary transition-colors text-2xl font-bold text-secondary group-hover:shadow-[0_0_15px_rgba(2,132,199,0.2)]">2</div>
            <h4 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Initialize and Track</h4>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[250px]">Start listening for custom click paths, form actions, and pageviews.</p>
          </div>

          <div className="flex flex-col items-center group">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-lg group-hover:border-tertiary transition-colors text-2xl font-bold text-tertiary group-hover:shadow-[0_0_15px_rgba(79,70,229,0.2)]">3</div>
            <h4 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Analyze Core Funnels</h4>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[250px]">Open the dashboard to visualize drop-offs and track user flows instantly.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-3xl px-gutter max-w-container-max mx-auto relative z-10">
        <div className="glass-card rounded-[2rem] p-2xl text-center overflow-hidden relative">
          {/* Ambient inner glow */}
          <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.05)_0%,transparent_70%)] bottom-[-200px] left-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <h2 className="font-display-sm text-display-sm md:text-headline-lg text-on-surface mb-lg">Ready to scale your insights?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-xl mx-auto">Join 2,000+ engineering teams shipping better products with InsightTrack.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-md">
            <button className="bg-primary text-on-primary px-2xl py-md rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all" onClick={onGetStarted}>
              Create Free Account
            </button>
            <button className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-on-surface px-2xl py-md rounded-xl font-bold transition-colors" onClick={onGetStarted}>
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 w-full py-xl relative z-10">
        <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 gap-md items-center">
          <div>
            <div className="flex items-center gap-sm font-display-sm text-lg font-bold text-on-surface mb-xs">
              <span className="material-symbols-outlined text-primary">filter_alt</span>
              <span>InsightTrack</span>
            </div>
            <p className="text-on-surface-variant/60 text-sm">© {new Date().getFullYear()} InsightTrack. Built for developers.</p>
          </div>
          <div className="flex gap-lg md:justify-end">
            <div className="flex flex-col gap-sm text-left">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Product</span>
              <ul className="space-y-xs text-sm">
                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Dashboard</a></li>
                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a></li>
                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#simulator">Simulator</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-sm text-left">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Resources</span>
              <ul className="space-y-xs text-sm">
                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Documentation</a></li>
                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Changelog</a></li>
                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
