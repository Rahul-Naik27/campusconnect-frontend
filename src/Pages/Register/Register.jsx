import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { getUser } from '../../auth';

const Register = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      if (data.ticketTypes && data.ticketTypes.length > 0) {
        setSelectedTicketType(data.ticketTypes[0].name);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load event details.' });
    } finally {
      setFetching(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const user = getUser();
    if (!user) { navigate('/auth'); return; }

    try {
      await api.post('/registrations', {
        eventId: id,
        ticketTypeName: selectedTicketType || 'General'
      });
      setMessage({ type: 'success', text: '🎉 Registration successful! Redirecting to your dashboard...' });
      setTimeout(() => navigate('/dashboard'), 2200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedTicket = event?.ticketTypes?.find(t => t.name === selectedTicketType);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Event Not Found</h2>
          <button onClick={() => navigate('/')} className="text-purple-600 hover:text-purple-700 font-semibold">← Back to Events</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.5s ease-out both; }
        @keyframes success-pop { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .success-pop { animation: success-pop 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .ticket-card { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .ticket-card:hover { transform: translateY(-2px); }
        .ticket-card.selected { transform: scale(1.02); }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8 px-4" style={{ fontFamily: 'Inter,sans-serif' }}>
        <div className="max-w-xl mx-auto">

          {/* Back */}
          <button onClick={() => navigate(`/event/${id}`)} className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition">
            ← Back to Event
          </button>

          {/* Success overlay */}
          {message.type === 'success' && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center success-pop max-w-sm w-full mx-4">
                <div className="text-7xl mb-4">🎉</div>
                <h2 className="text-3xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>You're In!</h2>
                <p className="text-gray-500">{message.text}</p>
                <div className="mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '100%', animation: 'none', transition: 'width 2s linear' }} />
                </div>
              </div>
            </div>
          )}

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden fade-up">

            {/* Event hero */}
            {event.posterUrl ? (
              <div className="relative h-44 overflow-hidden">
                <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>{event.title}</h1>
                  <span className="text-xs text-white/80 font-semibold">{event.departmentOrClub}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-8">
                <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Outfit,sans-serif' }}>{event.title}</h1>
                <span className="text-purple-200 text-xs font-semibold">{event.departmentOrClub}</span>
              </div>
            )}

            <div className="p-7">
              {/* Event quick info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: '📍', label: event.venue },
                  { icon: '📅', label: new Date(event.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: '⏰', label: new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                  { icon: '👥', label: `${event.capacity} capacity` },
                ].map(({ icon, label }) => (
                  <div key={label} className="bg-purple-50 rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-gray-700">
                    <span>{icon}</span><span className="font-medium truncate">{label}</span>
                  </div>
                ))}
              </div>

              {/* Error */}
              {message.type === 'error' && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
                  ❌ {message.text}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Ticket type selection */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Select Ticket Type</label>
                    <div className="space-y-2">
                      {event.ticketTypes.map((ticket) => (
                        <label
                          key={ticket.name}
                          className={`ticket-card flex items-center justify-between px-4 py-4 rounded-2xl border-2 cursor-pointer ${
                            selectedTicketType === ticket.name
                              ? 'border-purple-500 bg-purple-50 selected'
                              : 'border-gray-200 hover:border-purple-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTicketType === ticket.name ? 'border-purple-500' : 'border-gray-300'}`}>
                              {selectedTicketType === ticket.name && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{ticket.name}</div>
                              {ticket.quota > 0 && <div className="text-xs text-gray-400">{ticket.quota} seats available</div>}
                            </div>
                          </div>
                          <div className={`text-xl font-black ${ticket.price === 0 ? 'text-green-600' : 'text-purple-600'}`}>
                            {ticket.price === 0 ? 'FREE' : `₹${ticket.price}`}
                          </div>
                          <input
                            type="radio"
                            className="hidden"
                            value={ticket.name}
                            checked={selectedTicketType === ticket.name}
                            onChange={() => setSelectedTicketType(ticket.name)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedTicket && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-purple-500 uppercase tracking-wide">Order Summary</div>
                        <div className="font-bold text-gray-800 mt-1">{event.title}</div>
                        <div className="text-sm text-gray-600">{selectedTicket.name} ticket</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className={`text-2xl font-black ${selectedTicket.price === 0 ? 'text-green-600' : 'text-purple-600'}`}>
                          {selectedTicket.price === 0 ? 'FREE' : `₹${selectedTicket.price}`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Confirming Registration...
                    </span>
                  ) : '🎫 Confirm Registration'}
                </button>

                <p className="text-center text-gray-400 text-xs">
                  🔒 Your registration is secured and linked to your account.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
