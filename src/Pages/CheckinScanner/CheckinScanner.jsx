import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api';

/* ─────────────────────────────────────────────
   Sound helper (Web Audio API — no library)
───────────────────────────────────────────── */
function useSound() {
  const ctx = useRef(null);
  const play = useCallback((type) => {
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ac = ctx.current;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ac.currentTime);
        osc.frequency.setValueAtTime(1100, ac.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
        osc.start(); osc.stop(ac.currentTime + 0.4);
      } else if (type === 'duplicate') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ac.currentTime);
        gain.gain.setValueAtTime(0.2, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
        osc.start(); osc.stop(ac.currentTime + 0.3);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ac.currentTime);
        gain.gain.setValueAtTime(0.2, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
        osc.start(); osc.stop(ac.currentTime + 0.5);
      }
    } catch (_) {}
  }, []);
  return play;
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const CheckinScanner = () => {
  const [ticketId, setTicketId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [flashColor, setFlashColor] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [checkInCount, setCheckInCount] = useState({ totalCheckIns: 0, todayCheckIns: 0 });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraLoading, setCameraLoading] = useState(false);

  const inputRef = useRef(null);
  const html5QrRef = useRef(null);
  const isScanningRef = useRef(false); // debounce camera scans
  const play = useSound();

  useEffect(() => {
    fetchEvents();
    inputRef.current?.focus();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/admin/events/all');
      setEvents(data || []);
    } catch (_) {}
  };

  const fetchCount = async () => {
    try {
      const { data } = await api.get(`/checkin/count/${selectedEventId}`);
      setCheckInCount(data);
    } catch (_) {}
  };

  /* ── Flash overlay ── */
  const triggerFlash = (color) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 700);
  };

  /* ── Process a scanned/typed ticket ID ── */
  const processTicket = async (id) => {
    if (!id?.trim() || isScanningRef.current) return;
    isScanningRef.current = true;
    setScanning(true);
    setResult(null);

    try {
      const { data } = await api.post('/checkin/scan', { ticketId: id.trim() });
      setResult({ ...data, type: 'success' });
      play('success');
      triggerFlash('green');
      if (selectedEventId) fetchCount();
      addHistory(id.trim(), data.attendee?.name, 'SUCCESS');
    } catch (err) {
      const errData = err.response?.data || {};
      const isDup = errData.result === 'DUPLICATE';
      setResult({ ...errData, type: isDup ? 'duplicate' : 'error' });
      play(isDup ? 'duplicate' : 'error');
      triggerFlash(isDup ? 'orange' : 'red');
      addHistory(id.trim(), errData.attendee?.name, isDup ? 'DUPLICATE' : 'INVALID');
    } finally {
      setScanning(false);
      setTicketId('');
      setTimeout(() => {
        isScanningRef.current = false;
        inputRef.current?.focus();
      }, 1500);
    }
  };

  const addHistory = (tId, name, res) => {
    setScanHistory(prev => [{
      ticketId: tId,
      name: name || '—',
      result: res,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 10));
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    processTicket(ticketId);
  };

  /* ─── Camera scanner ─── */
  const startCamera = async () => {
    setCameraError('');
    setCameraLoading(true);
    try {
      const scanner = new Html5Qrcode('qr-reader-div');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Extract ticket ID — our QR codes contain the full ticketId string
          const extracted = decodedText.trim();
          if (!isScanningRef.current) {
            processTicket(extracted);
          }
        },
        (_err) => { /* scan frame errors — ignore */ }
      );
      setCameraOpen(true);
    } catch (err) {
      setCameraError(
        err?.message?.includes('Permission')
          ? '📷 Camera permission denied. Please allow camera access in your browser settings.'
          : err?.message?.includes('NotFound')
          ? '📷 No camera found on this device.'
          : `Camera error: ${err?.message || 'Unknown error'}`
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrRef.current && html5QrRef.current.isScanning) {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      }
    } catch (_) {}
    html5QrRef.current = null;
    setCameraOpen(false);
    setCameraError('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleCamera = () => {
    if (cameraOpen) stopCamera();
    else startCamera();
  };

  /* ── Flash colors ── */
  const flashStyles = {
    green: 'rgba(34,197,94,0.2)',
    orange: 'rgba(251,146,60,0.2)',
    red: 'rgba(239,68,68,0.2)',
  };

  const resultStyles = {
    success: { border: 'border-green-300', bg: 'bg-green-50', text: 'text-green-800', icon: '✅', label: 'Check-in Successful!' },
    duplicate: { border: 'border-orange-300', bg: 'bg-orange-50', text: 'text-orange-800', icon: '⚠️', label: 'Already Checked In!' },
    error: { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-800', icon: '❌', label: 'Invalid Ticket' },
  };

  const historyColors = { SUCCESS: 'text-green-600', DUPLICATE: 'text-orange-500', INVALID: 'text-red-500' };
  const historyIcons = { SUCCESS: '✅', DUPLICATE: '⚠️', INVALID: '❌' };

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        * { font-family: 'Inter', sans-serif; }
        .heading { font-family: 'Outfit', sans-serif; }

        @keyframes flash-anim { 0%{opacity:1} 100%{opacity:0} }
        .flash-overlay { animation: flash-anim 0.7s ease-out forwards; pointer-events:none; }

        @keyframes slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .slide-up { animation: slide-up 0.3s ease-out; }

        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.5s ease-out both; }

        @keyframes scan-line {
          0%   { top: 8%; }
          50%  { top: 88%; }
          100% { top: 8%; }
        }
        .scan-line { animation: scan-line 2s ease-in-out infinite; }

        #qr-reader-div video { border-radius: 16px !important; }
        #qr-reader-div { border: none !important; }
        #qr-reader-div img { display: none !important; }
        #qr-reader-div__header_message { display: none !important; }
        #qr-reader-div__status_span { display: none !important; }
        #qr-reader-div__dashboard { display: none !important; }
      `}</style>

      {/* Full-screen flash */}
      {flashColor && (
        <div className="fixed inset-0 z-50 flash-overlay" style={{ backgroundColor: flashStyles[flashColor] }} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        {/* ── Top bar ── */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-6 py-5 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="heading text-2xl font-black">📷 Check-in Scanner</h1>
              <p className="text-purple-200 text-sm mt-0.5">Admin QR scan station · CampusConnect</p>
            </div>
            {/* Count pills */}
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-black">{checkInCount.todayCheckIns}</div>
                <div className="text-purple-200 text-xs font-semibold">Today</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-black">{checkInCount.totalCheckIns}</div>
                <div className="text-purple-200 text-xs font-semibold">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* ── Event Selector ── */}
          <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 fade-up">
            <label className="text-purple-600 text-xs font-bold uppercase tracking-widest block mb-2">🎭 Filter by Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full border-2 border-purple-100 focus:border-purple-400 rounded-xl px-4 py-3 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
            >
              <option value="">— All Events —</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>

          {/* ── Camera + Manual Input ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Camera Panel */}
            <div className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="heading text-white font-black text-lg">📷 Camera Scanner</h2>
                  <p className="text-purple-200 text-xs">Point at student's QR code</p>
                </div>
                <button
                  onClick={toggleCamera}
                  disabled={cameraLoading}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md ${
                    cameraOpen
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white text-purple-700 hover:bg-purple-50'
                  } disabled:opacity-50`}
                >
                  {cameraLoading ? '⏳ Starting...' : cameraOpen ? '⏹ Stop Camera' : '▶ Start Camera'}
                </button>
              </div>

              <div className="p-4">
                {/* Camera viewport */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>
                  {/* The html5-qrcode target div */}
                  <div id="qr-reader-div" className="w-full" />

                  {/* Idle state */}
                  {!cameraOpen && !cameraLoading && !cameraError && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                      onClick={startCamera}
                      style={{ minHeight: '280px' }}
                    >
                      <div className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-400 flex items-center justify-center text-4xl mb-4 group-hover:bg-purple-600/30 transition">
                        📷
                      </div>
                      <p className="text-white/70 font-semibold">Click to start camera</p>
                      <p className="text-white/40 text-xs mt-1">Camera permission required</p>
                    </div>
                  )}

                  {/* Loading */}
                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ minHeight: '280px' }}>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent mb-4" />
                      <p className="text-white/70 font-semibold">Starting camera...</p>
                    </div>
                  )}

                  {/* Scanning animation overlay */}
                  {cameraOpen && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner brackets */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-52 h-52">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-lg" />
                          {/* Scan line */}
                          <div className="scan-line absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="bg-black/50 text-white/80 text-xs px-3 py-1 rounded-full">
                          📷 Scanning for QR codes...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera error */}
                {cameraError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm slide-up">
                    {cameraError}
                  </div>
                )}
              </div>
            </div>

            {/* Manual Input Panel */}
            <div className="space-y-4">
              {/* Manual Input */}
              <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 fade-up" style={{ animationDelay: '0.15s' }}>
                <h2 className="heading text-gray-800 font-black text-lg mb-1">⌨️ Manual Entry</h2>
                <p className="text-gray-400 text-xs mb-4">Type or paste the ticket ID</p>
                <form onSubmit={handleManualScan} className="space-y-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="TKT-xxxxxxxx-xxxx-..."
                    className="w-full border-2 border-purple-100 focus:border-purple-400 rounded-xl px-4 py-3 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition placeholder-gray-300"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={scanning || !ticketId.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {scanning ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Processing...
                      </span>
                    ) : '✓ Check In'}
                  </button>
                </form>
              </div>

              {/* Scan Result */}
              {result && (() => {
                const s = resultStyles[result.type] || resultStyles.error;
                return (
                  <div className={`rounded-2xl border-2 p-5 ${s.bg} ${s.border} slide-up shadow-md`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{s.icon}</span>
                      <div>
                        <div className={`font-black text-lg heading ${s.text}`}>{s.label}</div>
                        <div className="text-gray-500 text-xs">{result.message}</div>
                      </div>
                    </div>

                    {result.attendee && (
                      <div className="bg-white/70 rounded-xl p-4 flex items-center gap-3">
                        <img src={result.attendee.avatar || '/boy.png'} alt="avatar" className="w-12 h-12 rounded-full border-2 border-purple-200 object-cover" />
                        <div>
                          <div className="font-bold text-gray-800">{result.attendee.name}</div>
                          <div className="text-gray-400 text-xs">{result.attendee.email}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.attendee.rollNumber !== '—' && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{result.attendee.rollNumber}</span>
                            )}
                            {result.attendee.branch !== '—' && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{result.attendee.branch}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {result.ticket?.checkedInAt && (
                      <div className="mt-2 text-xs text-gray-400">
                        {result.type === 'duplicate' ? 'Originally checked in: ' : 'Checked in at: '}
                        {new Date(result.ticket.checkedInAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Scan History ── */}
          {scanHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading text-gray-800 font-black text-lg">🕐 Recent Scans</h2>
                <button onClick={() => setScanHistory([])} className="text-gray-400 hover:text-red-400 text-xs font-semibold transition">
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {scanHistory.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 hover:bg-purple-50 rounded-xl px-4 py-3 transition">
                    <span className="text-xl">{historyIcons[s.result] || '❓'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 text-sm font-semibold truncate">{s.name}</div>
                      <div className="text-gray-400 text-xs font-mono truncate">{s.ticketId}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-bold ${historyColors[s.result] || 'text-gray-400'}`}>{s.result}</div>
                      <div className="text-gray-300 text-xs">{s.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Instructions ── */}
          <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 fade-up" style={{ animationDelay: '0.25s' }}>
            <h3 className="heading text-gray-700 font-bold mb-3">How to use</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '📷', title: 'Camera Scan', desc: 'Click "Start Camera", point at student\'s ticket QR — auto-detects instantly' },
                { icon: '⌨️', title: 'Manual Entry', desc: 'Type or paste the ticket ID from a physical QR scanner device' },
                { icon: '✅', title: 'Green Flash + Sound', desc: 'Successful check-in — attendee info shown immediately' },
                { icon: '⚠️', title: 'Orange / Red Flash', desc: 'Duplicate scan or invalid ticket — shows reason and attendee details' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 bg-purple-50 rounded-xl p-3">
                  <span className="text-xl mt-0.5">{icon}</span>
                  <div>
                    <div className="text-purple-700 font-bold text-sm">{title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CheckinScanner;
