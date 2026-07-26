import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import api from '../../api';
import { getUser } from '../../auth';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [regCount, setRegCount] = useState(0);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareCardRef = useRef(null);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      const [{ data: ev }, { data: countData }] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/registration-count`).catch(() => ({ data: { count: 0, isSoldOut: false } }))
      ]);
      setEvent(ev);
      setIsSoldOut(countData.isSoldOut);
      setRegCount(countData.count);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!user) { navigate('/auth'); return; }
    navigate(`/register/${id}`);
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImage(dataUrl);
      setShowShareModal(true);
    } catch (err) {
      console.error('Share card generation failed:', err);
      alert('Failed to generate share card.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleDownloadCard = () => {
    if (!shareImage) return;
    const a = document.createElement('a');
    a.href = shareImage;
    a.download = `CampusConnect-${event.title.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const handleWhatsAppShare = () => {
    const text = `🎉 Check out this event!\n\n*${event.title}*\n📍 ${event.venue}\n📅 ${new Date(event.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\nRegister now on CampusConnect! 🎓`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-purple-600 font-semibold">Loading</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <button onClick={() => navigate('/')} className="text-purple-600 hover:text-purple-700">← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
      `}</style>

      {/* ── Hidden Share Card (captured by html2canvas) ── */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden>
        <div
          ref={shareCardRef}
          style={{
            width: 600, height: 315,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #1e1b4b 100%)',
            position: 'relative', overflow: 'hidden', borderRadius: 20,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Background pattern */}
          <div style={{ position:'absolute',inset:0, backgroundImage:'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.08) 1px,transparent 1px)', backgroundSize:'30px 30px' }} />
          {event.posterUrl && (
            <img src={event.posterUrl} alt="" style={{ position:'absolute',right:0,top:0,height:'100%',width:'45%',objectFit:'cover',opacity:0.35 }} crossOrigin="anonymous" />
          )}
          <div style={{ position:'absolute',inset:0, background:'linear-gradient(to right,rgba(79,70,229,0.95) 55%,transparent)' }} />
          <div style={{ position:'relative',padding:'28px 32px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'rgba(196,181,253,1)',fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:8 }}>CampusConnect</div>
              <div style={{ color:'#fff',fontSize:26,fontWeight:900,fontFamily:'Outfit,sans-serif',lineHeight:1.15,marginBottom:10,maxWidth:340 }}>{event.title}</div>
              <div style={{ color:'rgba(196,181,253,1)',fontSize:13,fontWeight:600,marginBottom:6 }}>🏢 {event.departmentOrClub}</div>
            </div>
            <div>
              <div style={{ display:'flex',gap:16,marginBottom:16 }}>
                <div style={{ background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'8px 14px' }}>
                  <div style={{ color:'rgba(196,181,253,1)',fontSize:10,fontWeight:700,textTransform:'uppercase' }}>📅 Date</div>
                  <div style={{ color:'#fff',fontSize:13,fontWeight:700 }}>{new Date(event.startAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'8px 14px' }}>
                  <div style={{ color:'rgba(196,181,253,1)',fontSize:10,fontWeight:700,textTransform:'uppercase' }}>📍 Venue</div>
                  <div style={{ color:'#fff',fontSize:13,fontWeight:700 }}>{event.venue}</div>
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.9)',borderRadius:8,padding:'6px 14px',display:'inline-block' }}>
                <span style={{ color:'#7c3aed',fontSize:12,fontWeight:800 }}>Register at CampusConnect 🎓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-800" style={{fontFamily:'Outfit,sans-serif'}}>Share This Event</h3>
              <button onClick={() => setShowShareModal(false)} aria-label="Close share modal" className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            {shareImage && (
              <img src={shareImage} alt="Share card" className="w-full rounded-2xl mb-5 shadow-lg" />
            )}
            <div className="grid grid-cols-1 gap-3">
              <button onClick={handleDownloadCard} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                ⬇️ Download Image
              </button>
              <button onClick={handleWhatsAppShare} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                💬 Share on WhatsApp
              </button>
              <button onClick={handleCopyLink} className={`w-full py-3 rounded-xl font-bold transition-all ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                {copySuccess ? '✅ Copied!' : '🔗 Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Page ── */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8" style={{fontFamily:'Inter,sans-serif'}}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate('/')} className="mb-5 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition">
            ← Back to Events
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {isSoldOut && (
              <div className="bg-red-600 text-white text-center py-2.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                🔴 This event is SOLD OUT — No seats available
              </div>
            )}

            {/* Hero image */}
            {event.posterUrl ? (
              <div className="relative h-64 overflow-hidden">
                <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <h1 className="text-3xl font-black mb-1" style={{fontFamily:'Outfit,sans-serif'}}>{event.title}</h1>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                    {event.departmentOrClub}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-10">
                <h1 className="text-3xl font-black text-white mb-2" style={{fontFamily:'Outfit,sans-serif'}}>{event.title}</h1>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{event.departmentOrClub}</span>
              </div>
            )}

            <div className="p-7">
              {/* Sold Out badge */}
              {isSoldOut && (
                <div className="mb-4 inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-200">
                  🔴 Sold Out — Registration Closed
                </div>
              )}

              {/* Full description — NO line-clamp here */}
              <p className="text-gray-700 mb-6 leading-relaxed text-base">{event.description}</p>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: '📍', label: 'Venue', value: event.venue },
                  { icon: '📅', label: 'Date', value: new Date(event.startAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { icon: '⏰', label: 'Time', value: new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                  { icon: '🏁', label: 'Ends', value: new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                  { icon: '👥', label: 'Capacity', value: `${regCount}/${event.capacity} filled` },
                  { icon: '🏢', label: 'Organiser', value: event.departmentOrClub },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-purple-50 rounded-2xl p-4">
                    <div className="text-purple-500 text-xs font-bold uppercase tracking-wide mb-1">{icon} {label}</div>
                    <div className="font-semibold text-gray-800 text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {/* Ticket Types */}
              {event.ticketTypes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-base">🎟 Ticket Types</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {event.ticketTypes.map((ticket, idx) => (
                      <div key={idx} className="border-2 border-purple-100 rounded-2xl p-4 hover:border-purple-300 transition-colors">
                        <div className="font-bold text-gray-800">{ticket.name}</div>
                        <div className="text-purple-600 font-black text-xl mt-1">
                          {ticket.price === 0 ? 'FREE' : `₹${ticket.price}`}
                        </div>
                        {ticket.quota > 0 && (
                          <div className="text-xs text-gray-500 mt-1">{ticket.quota} seats</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleRegister}
                  disabled={isSoldOut}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 ${
                    isSoldOut
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-xl hover:-translate-y-0.5 transform'
                  }`}
                >
                  {isSoldOut ? '🔴 Sold Out' : 'Register Now →'}
                </button>

                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="px-6 py-3.5 rounded-2xl font-bold border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-60"
                >
                  {shareLoading ? (
                    <><span className="animate-spin">⏳</span> Generating...</>
                  ) : (
                    <>📤 Share</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;