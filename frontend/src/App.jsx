import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Heatmap from './components/Heatmap';
import Sessions from './components/Sessions';
import Auth from './components/Auth';

function App() {
  const [token, setToken] = useState(localStorage.getItem('insighttrack_auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('insighttrack_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [view, setView] = useState(token ? 'app' : 'landing'); // 'landing', 'auth', or 'app'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'heatmap', 'sessions'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('insighttrack_auth_token');
    localStorage.removeItem('insighttrack_user');
    setToken(null);
    setUser(null);
    setView('landing');
  };

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setView('app');
  };

  const handleGetStarted = () => {
    if (token) {
      setView('app');
    } else {
      setView('auth');
    }
  };

  if (view === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} isLoggedIn={!!token} />;
  }

  if (view === 'auth') {
    return <Auth onAuthSuccess={handleAuthSuccess} onBack={() => setView('landing')} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body-md text-left relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-surface-container border-r border-outline-variant/10 flex flex-col p-lg justify-between transform transition-transform duration-300 md:relative md:transform-none shrink-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-xl">
            <div className="flex items-center gap-sm cursor-pointer" onClick={() => { setView('landing'); setIsSidebarOpen(false); }}>
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>filter_alt</span>
              <span className="text-xl font-bold tracking-tight text-gradient-hero">InsightTrack</span>
            </div>
            <button 
              className="material-symbols-outlined text-on-surface-variant md:hidden cursor-pointer p-xs hover:bg-slate-200/50 rounded-lg active:scale-95 transition-transform"
              onClick={() => setIsSidebarOpen(false)}
            >
              close
            </button>
          </div>
          <nav className="flex flex-col gap-sm">
            <button 
              className={`flex items-center gap-sm p-md text-sm font-medium text-left rounded-lg cursor-pointer transition-all duration-150 w-full ${
                activeTab === 'dashboard' 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-[12px]' 
                  : 'text-on-surface-variant hover:bg-slate-200/50 hover:text-on-surface'
              }`}
              onClick={() => handleTabClick('dashboard')}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button 
              className={`flex items-center gap-sm p-md text-sm font-medium text-left rounded-lg cursor-pointer transition-all duration-150 w-full ${
                activeTab === 'heatmap' 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-[12px]' 
                  : 'text-on-surface-variant hover:bg-slate-200/50 hover:text-on-surface'
              }`}
              onClick={() => handleTabClick('heatmap')}
            >
              <span className="material-symbols-outlined">heat_pump</span>
              <span>Heatmaps</span>
            </button>
            <button 
              className={`flex items-center gap-sm p-md text-sm font-medium text-left rounded-lg cursor-pointer transition-all duration-150 w-full ${
                activeTab === 'sessions' 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-[12px]' 
                  : 'text-on-surface-variant hover:bg-slate-200/50 hover:text-on-surface'
              }`}
              onClick={() => handleTabClick('sessions')}
            >
              <span className="material-symbols-outlined">videocam</span>
              <span>Sessions</span>
            </button>
          </nav>
        </div>
        
        <div className="border-t border-outline-variant/10 pt-md flex flex-col gap-xs">
          <button 
            className="flex items-center gap-sm p-md text-sm font-medium text-left rounded-lg cursor-pointer transition-all duration-150 w-full text-on-surface-variant hover:bg-slate-200/50 hover:text-on-surface"
            onClick={() => { setView('landing'); setIsSidebarOpen(false); }}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Landing</span>
          </button>
          <button 
            className="flex items-center gap-sm p-md text-sm font-medium text-left rounded-lg cursor-pointer transition-all duration-150 w-full text-red-400 hover:bg-red-500/10"
            onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="grow flex flex-col bg-background overflow-y-auto">
        <header className="h-[70px] border-b border-outline-variant/10 px-md sm:px-xl flex items-center justify-between bg-surface-container/20 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-md">
            <button 
              className="material-symbols-outlined text-on-surface md:hidden cursor-pointer p-xs hover:bg-slate-200/50 rounded-lg active:scale-95 transition-transform"
              onClick={() => setIsSidebarOpen(true)}
            >
              menu
            </button>
            <div className="text-sm sm:text-lg font-bold tracking-tight text-on-surface">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'heatmap' && 'Click Heatmap Overlay'}
              {activeTab === 'sessions' && 'User Sessions Timeline'}
            </div>
          </div>
          <div className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
            <span className="text-xs font-medium max-w-[80px] sm:max-w-none truncate">{user?.name || 'Developer Admin'}</span>
          </div>
        </header>

        <section className="p-md sm:p-xl grow flex flex-col">
          <div className="glass-card rounded-2xl p-md sm:p-xl min-h-[400px] flex flex-col justify-start grow">
            {activeTab === 'dashboard' && <Dashboard token={token} onSessionExpired={handleLogout} />}
            {activeTab === 'heatmap' && <Heatmap token={token} onSessionExpired={handleLogout} />}
            {activeTab === 'sessions' && <Sessions token={token} onSessionExpired={handleLogout} />}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
