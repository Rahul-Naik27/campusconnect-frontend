import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../auth';
import NotificationBell from './NotificationBell';
import api from '../api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(getUser);
  const navigate = useNavigate();

  // Re-read user from localStorage whenever auth changes
  useEffect(() => {
    const syncUser = () => setUser(getUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('cc-auth-change', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('cc-auth-change', syncUser);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.dispatchEvent(new Event('cc-auth-change'));
    navigate('/auth');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-950 via-purple-900 to-indigo-950 text-white shadow-2xl sticky top-0 z-50 border-b border-purple-500/30 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">🎓 CampusConnect</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/" className="hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm font-medium">
              Home
            </Link>

            {user ? (
              <>
                {/* USER links */}
                {user.role === 'user' && (
                  <Link to="/dashboard" className="hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm font-medium">
                    Dashboard
                  </Link>
                )}

                {/* ADMIN links */}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm font-medium">
                      Admin
                    </Link>
                    <Link to="/checkin-scanner" className="hover:bg-white/20 px-3 py-2 rounded-lg transition text-sm font-medium">
                      Scanner
                    </Link>
                  </>
                )}

                {/* Notification Bell (non-admin only) */}
                {user.role !== 'admin' && <NotificationBell />}

                {/* User avatar + name */}
                <Link to="/profile" className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-xl transition">
                  <img
                    src={user.avatar || '/boy.png'}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover border-2 border-purple-400"
                  />
                  <span className="text-sm font-semibold truncate max-w-[100px]">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-sm font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition text-sm"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user && user.role !== 'admin' && <NotificationBell />}
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-purple-900/95 backdrop-blur px-4 pt-2 pb-4 space-y-1 border-t border-purple-700/50">
          <Link to="/" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg text-sm">Home</Link>
          {user ? (
            <>
              {user.role === 'user' && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg text-sm">Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg text-sm">Admin</Link>
                  <Link to="/checkin-scanner" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg text-sm">Scanner</Link>
                </>
              )}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="block hover:bg-white/20 px-3 py-2 rounded-lg text-sm">✏️ Edit Profile</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-semibold">Logout</button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)} className="block bg-white text-purple-600 px-3 py-2 rounded-lg font-semibold text-sm">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
