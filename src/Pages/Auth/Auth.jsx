import React, { useState } from 'react';
import api from '../../api';
import { setAuth } from '../../auth';
import { useNavigate } from 'react-router-dom';

// Precomputed once at module load — avoids re-render flicker
const STARS = Array.from({ length: 18 }, () => ({
  top: Math.random() * 100,
  left: Math.random() * 100,
  opacity: Math.random() * 0.5 + 0.1,
  delay: Math.random() * 3,
}));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/sign-in' : '/auth/sign-up';
      const { data } = await api.post(endpoint, formData);
      const token = data.token;
      const user = data.user;
      if (!token || !user) throw new Error('Invalid auth response');
      setAuth(token, user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      window.dispatchEvent(new Event('cc-auth-change'));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */

        @keyframes blob-float {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.05); }
          66% { transform: translate(-20px,20px) scale(0.97); }
        }
        .blob { animation: blob-float 10s ease-in-out infinite; }
        .blob-delay { animation-delay: 4s; }

        @keyframes slide-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .slide-up { animation: slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes card-appear {
          from { opacity:0; transform:scale(0.97) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .card-appear { animation: card-appear 0.45s cubic-bezier(0.16,1,0.3,1) both; }

        .glass-field {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.15);
          color: #fff;
          transition: border-color 0.2s, background 0.2s;
        }
        .glass-field:focus {
          background: rgba(255,255,255,0.10);
          border-color: rgba(167,139,250,0.8);
          outline: none;
        }
        .glass-field::placeholder { color: rgba(255,255,255,0.35); }
        .glass-field:-webkit-autofill,
        .glass-field:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #3b0764 inset;
          -webkit-text-fill-color: #fff;
        }
      `}</style>

      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 px-4 py-16" style={{ fontFamily: 'Inter,sans-serif' }}>

        {/* Animated blobs */}
        <div className="blob absolute w-[420px] h-[420px] rounded-full bg-purple-600 opacity-20 blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="blob blob-delay absolute w-[360px] h-[360px] rounded-full bg-indigo-500 opacity-20 blur-3xl bottom-0 right-0 pointer-events-none" />
        <div className="blob absolute w-[280px] h-[280px] rounded-full bg-pink-600 opacity-10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Stars — positions are precomputed at module load to prevent flicker */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {STARS.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative w-full max-w-md card-appear">

          {/* Logo */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl mb-4 text-3xl">
              🎓
            </div>
            <h1 className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit,sans-serif' }}>
              CampusConnect
            </h1>
            <p className="text-purple-300 mt-1 text-sm font-medium">Your Campus. Your Events. Your Story.</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>

            {/* Tab switcher */}
            <div className="flex border-b border-white/10">
              {['Sign In', 'Sign Up'].map((label, idx) => {
                const active = (idx === 0) === isLogin;
                return (
                  <button
                    key={label}
                    onClick={() => { setIsLogin(idx === 0); setError(''); setFormData({ name: '', email: '', password: '' }); }}
                    className={`flex-1 py-4 text-sm font-bold transition-all duration-200 ${active ? 'text-white border-b-2 border-purple-400' : 'text-white/40 hover:text-white/70'}`}
                    style={{ background: active ? 'rgba(124,58,237,0.15)' : 'transparent' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="p-8">
              {/* Welcome text */}
              <div className="mb-7">
                <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit,sans-serif' }}>
                  {isLogin ? 'Welcome back 👋' : 'Create your account'}
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  {isLogin ? 'Sign in to access your dashboard and tickets.' : 'Join thousands of students on CampusConnect.'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold text-red-300 border border-red-400/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-field w-full px-4 py-3.5 rounded-xl text-sm"
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-field w-full px-4 py-3.5 rounded-xl text-sm"
                    placeholder="you@college.edu"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="glass-field w-full px-4 py-3.5 rounded-xl text-sm pr-12"
                      placeholder="Enter password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      aria-label="Toggle password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition text-sm"
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-black text-base transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: loading ? 'none' : '0 8px 24px rgba(124,58,237,0.5)', color: '#fff' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? '🚀 Sign In' : '✨ Create Account'
                  )}
                </button>
              </form>

              <p className="text-center text-white/40 text-xs mt-6">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={switchMode} className="text-purple-400 hover:text-purple-300 font-semibold transition">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-white/20 text-xs mt-6">
            🔒 Secure login · CampusConnect © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
