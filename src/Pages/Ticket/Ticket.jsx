import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import api from '../../api';

const Ticket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/tickets/${ticketId}`);
      setTicket(data.ticket);
      setEvent(data.event);

      // Load user info from localStorage for name display
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));

      const qr = await QRCode.toDataURL(data.ticket.ticketId, {
        width: 280,
        margin: 2,
        color: { dark: '#4f46e5', light: '#ffffff' },
      });
      setQrCode(qr);
    } catch (err) {
      console.error('Failed to fetch ticket:', err);
      setTicket(null);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `CampusConnect-Ticket-${ticketId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-600 font-semibold text-lg">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket Not Found</h2>
          <p className="text-gray-500 mb-6">This ticket may be invalid or expired.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCheckedIn = !!ticket.checkedInAt;

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        .ticket-font { font-family: 'Outfit', sans-serif; }
        .body-font { font-family: 'Inter', sans-serif; }
        @keyframes checkin-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
        }
        .checkin-glow { animation: checkin-pulse 2s ease-in-out infinite; }
        .ticket-tearline {
          background-image: repeating-linear-gradient(
            90deg, transparent, transparent 8px,
            rgba(0,0,0,0.08) 8px, rgba(0,0,0,0.08) 10px
          );
          height: 2px;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          @page { margin: 0.4cm; size: A4 portrait; }

          /* Shrink outer wrapper */
          .print-page-wrap { padding: 4px 4px !important; min-height: unset !important; }
          .print-card-wrap { max-width: 360px !important; }

          /* Header: tighter padding & smaller text */
          .print-header { padding: 10px 16px !important; }
          .print-header h1 { font-size: 15px !important; line-height: 1.2 !important; }
          .print-header .print-sub { font-size: 10px !important; }
          .print-header .print-badge { padding: 2px 10px !important; font-size: 10px !important; margin-top: 6px !important; }
          .print-emoji { font-size: 28px !important; }

          /* QR section */
          .print-qr-section { padding: 8px 16px !important; }
          .print-qr-img { width: 130px !important; height: 130px !important; }
          .print-qr-wrap { padding: 8px !important; }
          .print-ticket-id { font-size: 9px !important; padding: 4px 10px !important; margin-top: 6px !important; }
          .print-scanned-at { font-size: 10px !important; margin-top: 4px !important; }

          /* Details section */
          .print-details { padding: 8px 16px 8px !important; }
          .print-avatar { width: 32px !important; height: 32px !important; }
          .print-attendee-wrap { gap: 8px !important; margin-bottom: 8px !important; }
          .print-attendee-name { font-size: 12px !important; }
          .print-attendee-email { font-size: 10px !important; }
          .print-info-grid { gap: 6px !important; }
          .print-info-cell { padding: 6px 8px !important; border-radius: 8px !important; }
          .print-info-label { font-size: 8px !important; margin-bottom: 2px !important; }
          .print-info-value { font-size: 11px !important; }
          .print-checkin-box { margin-top: 6px !important; padding: 6px 10px !important; }
          .print-checkin-box div { font-size: 10px !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 py-10 px-4 body-font print-page-wrap">
        <div className="max-w-md mx-auto print-card-wrap">

          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="no-print mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition"
          >
            ← Back to Dashboard
          </button>

          {/* Ticket Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-8 py-7 text-white relative overflow-hidden print-header">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-purple-200 text-xs font-semibold uppercase tracking-[0.2em] mb-1">CampusConnect</div>
                  <h1 className="text-2xl font-black ticket-font leading-tight">{event.title}</h1>
                  <div className="text-purple-200 text-sm mt-1 print-sub">{event.departmentOrClub}</div>
                </div>
                <div className="text-5xl print-emoji">🎫</div>
              </div>

              {/* Check-in status */}
              <div className="relative z-10 mt-4">
                {isCheckedIn ? (
                  <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold print-badge">
                    ✅ Checked In
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold print-badge">
                    🔵 Valid — Not Yet Scanned
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Section */}
            <div className="px-8 py-6 bg-gradient-to-b from-indigo-50 to-white text-center print-qr-section">
              {qrCode ? (
                <div className={`inline-block p-4 bg-white rounded-2xl shadow-lg border-2 print-qr-wrap ${isCheckedIn ? 'border-green-400' : 'border-purple-400'} ${isCheckedIn ? '' : 'checkin-glow'}`}>
                  <img src={qrCode} alt="Ticket QR Code" className="w-52 h-52 print-qr-img" />
                </div>
              ) : (
                <div className="w-52 h-52 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                  Generating QR...
                </div>
              )}

              <div className="mt-4 font-mono text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-lg inline-block print-ticket-id">
                {ticket.ticketId}
              </div>

              {isCheckedIn && (
                <div className="mt-3 text-sm text-green-600 font-semibold print-scanned-at">
                  ✅ Scanned at {new Date(ticket.checkedInAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Tear line */}
            <div className="ticket-tearline mx-0" />

            {/* Ticket Details */}
            <div className="px-8 py-6 space-y-0 print-details">

              {/* Attendee */}
              <div className="flex items-center gap-3 mb-5 print-attendee-wrap">
                <img
                  src={user?.avatar || '/boy.png'}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border-2 border-purple-200 object-cover print-avatar"
                />
                <div>
                  <div className="font-bold text-gray-800 print-attendee-name">{user?.name || 'Attendee'}</div>
                  <div className="text-sm text-gray-500 print-attendee-email">{user?.email || ''}</div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm print-info-grid">
                <div className="bg-purple-50 rounded-xl p-3 print-info-cell">
                  <div className="text-purple-500 text-xs font-bold uppercase tracking-wide mb-1 print-info-label">📍 Venue</div>
                  <div className="font-semibold text-gray-800 print-info-value">{event.venue}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 print-info-cell">
                  <div className="text-purple-500 text-xs font-bold uppercase tracking-wide mb-1 print-info-label">📅 Date</div>
                  <div className="font-semibold text-gray-800 print-info-value">{new Date(event.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 print-info-cell">
                  <div className="text-purple-500 text-xs font-bold uppercase tracking-wide mb-1 print-info-label">⏰ Time</div>
                  <div className="font-semibold text-gray-800 print-info-value">{new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 print-info-cell">
                  <div className="text-purple-500 text-xs font-bold uppercase tracking-wide mb-1 print-info-label">🎟 Status</div>
                  <div className={`font-bold print-info-value ${isCheckedIn ? 'text-green-600' : 'text-blue-600'}`}>
                    {isCheckedIn ? '✅ Checked In' : '🔵 Valid'}
                  </div>
                </div>
              </div>

              {/* Checkin Box */}
              {isCheckedIn && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 print-checkin-box">
                  <div className="text-green-700 font-bold text-sm">✅ Entry Confirmed</div>
                  <div className="text-green-600 text-sm mt-1">
                    Checked in on {new Date(ticket.checkedInAt).toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="px-8 pb-8 pt-2 space-y-3 no-print">
              <button
                onClick={downloadQR}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                ⬇️ Download QR Code
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                🖨️ Print Ticket
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6 no-print">
            🔒 This ticket is linked to your account and cannot be transferred.
          </p>
        </div>
      </div>
    </>
  );
};

export default Ticket;
