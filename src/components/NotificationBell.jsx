import React, { useState, useEffect, useRef } from 'react';
import { getUpcomingToday, formatTimeUntil } from '../utils/notifications';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [upcoming, setUpcoming] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load from localStorage (set by Dashboard when it fetches registrations)
    try {
      const raw = localStorage.getItem('cc_registrations');
      if (raw) {
        const regs = JSON.parse(raw);
        setUpcoming(getUpcomingToday(regs));
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Refresh countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem('cc_registrations');
        if (raw) setUpcoming(getUpcomingToday(JSON.parse(raw)));
      } catch (e) { /* ignore */ }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = upcoming.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
        title="Event Reminders"
        aria-label="Event Reminders"
      >
        <span className="text-xl">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-purple-100 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
            <h3 className="text-white font-bold text-sm">🔔 Event Reminders</h3>
            <p className="text-purple-200 text-xs">Events happening in the next 24 hours</p>
          </div>

          {count === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500 text-sm font-medium">No events in the next 24 hours</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {upcoming.map((reg) => {
                const ev = reg.eventId;
                return (
                  <div
                    key={reg._id}
                    className="p-4 hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => { navigate(`/event/${ev._id}`); setOpen(false); }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{ev.title}</p>
                        <p className="text-gray-500 text-xs truncate">📍 {ev.venue}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="bg-purple-100 text-purple-700 text-xs font-black px-2 py-1 rounded-full">
                          {formatTimeUntil(ev.startAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-100 p-3 text-center">
            <button
              onClick={() => { navigate('/dashboard'); setOpen(false); }}
              className="text-purple-600 hover:text-purple-700 text-xs font-semibold"
            >
              View all registrations →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
