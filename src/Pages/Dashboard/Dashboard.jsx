import React, { useEffect, useState } from 'react';
import api from '../../api';
import { clearAuth } from '../../auth';
import { useNavigate } from 'react-router-dom';
import BadgeDisplay from '../../components/BadgeDisplay';
import { requestNotificationPermission, scheduleEventReminders } from '../../utils/notifications';

const Dashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badgeStats, setBadgeStats] = useState(null);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndRegistrations();
    fetchBadges();
    // Request notification permission when dashboard loads
    requestNotificationPermission();
  }, []);

  const fetchUserAndRegistrations = async () => {
    try {
      setUser(getUser());
      const { data } = await api.get('/registrations/me');
      const regs = data || [];
      setRegistrations(regs);
      // Save to localStorage for NotificationBell
      localStorage.setItem('cc_registrations', JSON.stringify(regs));
      // Schedule browser reminders
      scheduleEventReminders(regs);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data } = await api.get('/users/badges');
      setBadgeStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    } finally {
      setBadgesLoading(false);
    }
  };

  const handleViewTicket = async (registration) => {
    try {
      const { data } = await api.post('/tickets/issue', { registrationId: registration._id });
      navigate(`/ticket/${data.ticket.ticketId}`);
    } catch (err) {
      console.error('Failed to issue ticket:', err);
      alert(err.response?.data?.message || 'Failed to issue ticket');
    }
  };

  const handleLogout = () => {
    clearAuth();
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('cc_registrations');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-purple-600 font-bold text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const checkedIn = registrations.filter(r => r.checkedInAt).length;
  const upcoming = registrations.filter(r => r.eventId?.startAt && new Date(r.eventId.startAt) > new Date()).length;

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        * { font-family: 'Inter', sans-serif; }
        .heading { font-family: 'Outfit', sans-serif; }
        @keyframes fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up 0.4s ease-out both; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <div className="flex h-screen relative">

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ── */}
          <div className={`
            fixed md:relative z-30 md:z-auto top-0 left-0 h-full
            w-72 bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900
            flex flex-col overflow-y-auto shadow-2xl
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>

            {/* Profile */}
            <div className="p-6 text-white text-center border-b border-white/10">
              <div className="relative inline-block mb-4">
                <img
                  src={user?.avatar || '/boy.png'}
                  alt="avatar"
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/30 shadow-xl"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow" />
              </div>
              <h2 className="heading text-xl font-black mb-0.5">{user?.name || 'Student'}</h2>
              <p className="text-purple-300 text-xs truncate">{user?.email || ''}</p>
              {user?.role && (
                <span className="mt-2 inline-block bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full capitalize border border-white/20">
                  {user.role}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 border-b border-white/10">
              {[
                { label: 'Registered', value: registrations.length, color: 'text-purple-300' },
                { label: 'Upcoming', value: upcoming, color: 'text-blue-300' },
                { label: 'Attended', value: checkedIn, color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 text-center">
                  <div className={`text-2xl font-black ${color}`}>{value}</div>
                  <div className="text-white/50 text-[10px] font-semibold uppercase tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* User Info */}
            <div className="p-4 space-y-2 border-b border-white/10">
              {[
                { label: 'Roll No', value: user?.rollNumber, icon: '📋' },
                { label: 'Branch', value: user?.branch, icon: '🏢' },
                { label: 'Year', value: user?.yearOfStudy, icon: '📅' },
                { label: 'Class', value: user?.class, icon: '🏫' },
              ].filter(f => f.value).map(({ label, value, icon }) => (
                <div key={label} className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <div>
                    <div className="text-white/50 text-[10px] font-semibold uppercase">{label}</div>
                    <div className="text-white font-bold text-xs">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 🏅 Badges Section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🏅</span>
                <h3 className="text-white font-bold text-sm">My Badges</h3>
                {badgeStats && (
                  <span className="ml-auto bg-purple-500/40 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {[
                      badgeStats.totalRegistrations >= 1,
                      badgeStats.totalRegistrations >= 3,
                      badgeStats.attendedCount >= 5,
                      badgeStats.attendedBigFest,
                      badgeStats.departments >= 3
                    ].filter(Boolean).length}/5
                  </span>
                )}
              </div>
              <BadgeDisplay stats={badgeStats} loading={badgesLoading} />
            </div>

            {/* Actions */}
            <div className="p-4 mt-auto space-y-2">
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-semibold transition text-sm border border-white/20 flex items-center justify-center gap-2"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2"
              >
                🎭 Browse Events
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/80 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Mobile topbar */}
            <div className="md:hidden bg-gradient-to-r from-slate-900 to-purple-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-black text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>Dashboard</span>
              <img src={user?.avatar || '/boy.png'} alt="avatar" className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover" />
            </div>

            <div className="p-4 md:p-8">

            {/* Header */}
            <div className="mb-8 fade-up">
              <h1 className="heading text-4xl font-black text-gray-800 mb-1">My Registrations</h1>
              <p className="text-gray-500">
                {upcoming > 0
                  ? `You have ${upcoming} upcoming event${upcoming > 1 ? 's' : ''} 🎉`
                  : 'All your registered events are here'}
              </p>
            </div>

            {/* Empty State */}
            {registrations.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-16 text-center fade-up">
                <div className="text-7xl mb-4">🎭</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Registrations Yet</h3>
                <p className="text-gray-500 mb-8">Discover and register for amazing campus events!</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition hover:shadow-lg hover:-translate-y-0.5 transform"
                >
                  Browse Events →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {registrations.map((reg, i) => {
                  const ev = reg.eventId;
                  const isUpcoming = ev?.startAt && new Date(ev.startAt) > new Date();
                  const isPast = ev?.endAt ? new Date(ev.endAt) < new Date() : !isUpcoming;
                  const isCheckedInReg = !!reg.checkedInAt;

                  return (
                    <div
                      key={reg._id}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden fade-up hover:-translate-y-1"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {ev?.posterUrl ? (
                        <img src={ev.posterUrl} alt={ev.title} className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-4xl">🎭</div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="heading text-lg font-bold text-gray-800 leading-tight line-clamp-2">{ev?.title || 'Event'}</h3>
                          <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isUpcoming ? 'Upcoming' : 'Past'}
                          </span>
                        </div>

                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{ev?.description}</p>

                        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2"><span>🎫</span><span className="font-semibold">{reg.ticketTypeName}</span></div>
                          <div className="flex items-center gap-2"><span>📅</span><span>{ev?.startAt ? new Date(ev.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
                          <div className="flex items-center gap-2"><span>📍</span><span className="truncate">{ev?.venue || '—'}</span></div>
                        </div>

                        {isCheckedInReg ? (
                          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                            ✅ You attended this event
                          </div>
                        ) : !isUpcoming ? (
                          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-gray-500 border border-gray-200">
                            ⏳ You did not check in
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {reg.status}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewTicket(reg)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg text-sm"
                          >
                            🎫 View Ticket
                          </button>
                          {isPast && (
                            <button
                              onClick={() => navigate(`/feedback/${ev?._id}`)}
                              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg text-sm"
                            >
                              ⭐ Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>  {/* end p-4 md:p-8 */}
          </div>  {/* end main content */}
        </div>  {/* end flex */}
      </div>
    </>
  );
};

export default Dashboard;