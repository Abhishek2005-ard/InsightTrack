import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const Auth = ({ onAuthSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = isLogin ? { email, password } : { name, email, password };
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Save token and user in localStorage
      localStorage.setItem('insighttrack_auth_token', data.token);
      localStorage.setItem('insighttrack_user', JSON.stringify(data.user));

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-lg relative overflow-hidden select-none">
      {/* Background ambient glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.06)_0%,rgba(59,130,246,0.02)_50%,transparent_100%)] top-[-100px] left-1/2 -translate-x-1/2 pointer-events-none z-[1]"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.04)_0%,transparent_80%)] bottom-[10%] -right-[100px] pointer-events-none z-[1]"></div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center gap-xs mb-xl text-center">
          <div className="flex items-center gap-xs cursor-pointer" onClick={onBack}>
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>filter_alt</span>
            <span className="text-2xl font-bold tracking-tight text-gradient-hero">InsightTrack</span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium mt-xs">
            {isLogin ? 'Sign in to access your analytics dashboard' : 'Create your developer account to get started'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-[1.5rem] border border-outline-variant/10 p-xl shadow-xl shadow-primary/5 bg-surface/85 backdrop-blur-xl">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 rounded-lg p-xs mb-lg">
            <button
              type="button"
              className={`flex-1 py-md text-xs font-semibold rounded-md cursor-pointer transition-all duration-150 ${
                isLogin ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-md text-xs font-semibold rounded-md cursor-pointer transition-all duration-150 ${
                !isLogin ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-md p-md bg-red-50 border border-red-200/50 text-red-600 text-xs font-medium rounded-lg text-left flex items-start gap-xs">
              <span className="material-symbols-outlined text-sm mt-[1px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-md text-left">
            {!isLogin && (
              <div className="flex flex-col gap-xs">
                <label className="text-xs font-semibold text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-md py-md rounded-lg border border-outline-variant/20 bg-surface focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="text-xs font-semibold text-on-surface-variant">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. developer@insighttrack.io"
                className="w-full px-md py-md rounded-lg border border-outline-variant/20 bg-surface focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-xs font-semibold text-on-surface-variant">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-md py-md rounded-lg border border-outline-variant/20 bg-surface focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary py-md rounded-lg font-semibold text-sm mt-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-xs"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <button
          onClick={onBack}
          className="mt-xl text-xs font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs mx-auto bg-none border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Landing Page</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;
