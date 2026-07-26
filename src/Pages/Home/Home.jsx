import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaBookmark, FaArrowRight, FaTh, FaCalendar } from 'react-icons/fa';
import api from '../../api';
import EventCalendar from '../../components/EventCalendar';
import { getUser } from '../../auth';

export default function Home() {
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [soldOutMap, setSoldOutMap] = useState({});
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'calendar'
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const countdownTimerRef = React.useRef(null);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    fetchFeaturedEvent();
    fetchEvents();
    if (user) fetchSavedEvents();
  }, []);

  useEffect(() => {
    if (!featuredEvent?.startAt) return;

    const tick = () => {
      const now = new Date().getTime();
      const eventTime = new Date(featuredEvent.startAt).getTime();
      const distance = eventTime - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(countdownTimerRef.current);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    tick(); // run immediately on mount
    countdownTimerRef.current = setInterval(tick, 1000);

    return () => clearInterval(countdownTimerRef.current);
  }, [featuredEvent]);

  const fetchFeaturedEvent = async () => {
    try {
      const { data } = await api.get('/events/featured/one');
      setFeaturedEvent(data);
    } catch (err) {
      console.error('Failed to fetch featured event:', err);
      setFeaturedEvent(null);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      const evList = data || [];
      setEvents(evList);
      // Fetch sold-out status for all events in parallel
      const counts = await Promise.allSettled(
        evList.map(ev => api.get(`/events/${ev._id}/registration-count`))
      );
      const map = {};
      counts.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          map[evList[i]._id] = res.value.data.isSoldOut;
        }
      });
      setSoldOutMap(map);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    }
  };

  const fetchSavedEvents = async () => {
    try {
      const { data } = await api.get('/users/saved');
      setSavedEvents(new Set((data.savedEvents || []).map(e => (e._id || e).toString())));
    } catch (_) {}
  };

  const handleBookmark = async (e, eventId) => {
    e.stopPropagation();
    if (!user) { navigate('/auth'); return; }
    setBookmarkLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      const { data } = await api.post(`/users/saved/${eventId}`);
      setSavedEvents(new Set(data.savedEvents.map(id => id.toString())));
    } catch (_) {}
    finally {
      setBookmarkLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        }
        
        h1, h2, h3, .heading-font {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-left { animation: slide-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { animation: slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-up { animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-glow { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .card-hover-lift {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .card-hover-lift:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.25);
        }
        
        .poster-shine {
          position: relative;
          overflow: hidden;
        }
        
        .poster-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.7s;
        }
        
        .poster-shine:hover::after {
          left: 100%;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-magnetic {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .btn-magnetic:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.4);
        }
        
        .btn-magnetic:active {
          transform: translateY(0);
        }
        
        .event-card-image {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .event-card:hover .event-card-image {
          transform: scale(1.1);
        }
        
        .floating-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
        }
        
        .shimmer-bg {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="floating-blob w-96 h-96 bg-purple-400 -top-20 -left-20" style={{ animationDelay: '0s' }} />
        <div className="floating-blob w-80 h-80 bg-indigo-400 top-1/3 -right-20" style={{ animationDelay: '2s' }} />
        <div className="floating-blob w-72 h-72 bg-pink-400 bottom-20 left-1/4" style={{ animationDelay: '4s' }} />

        {/* HERO SECTION */}
        {featuredEvent && (
          <section className="relative z-10 animate-gradient bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white py-24 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]" />
              <video src="/utsavvid.mp4" className="absolute inset-0 w-full h-full object-cover -z-10" muted autoPlay loop playsInline aria-hidden="true">
                <track kind="captions" src="data:text/vtt,WEBVTT" label="English" default />
              </video>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* LEFT CONTENT */}
                <div className="animate-slide-left space-y-8">
                  <div className="inline-block">
                    <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                      ✨ FEATURED EVENT
                    </span>
                  </div>
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] gradient-text">
                    {featuredEvent.title}
                  </h1>
                  
                  <p className="text-xl sm:text-2xl text-purple-100 font-light leading-relaxed max-w-xl">
                    {featuredEvent.description}
                  </p>

                  {/* Countdown */}
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(countdown).map(([unit, value], idx) => (
                      <div
                        key={unit}
                        className="glass-card rounded-2xl px-6 py-5 min-w-[100px] text-center animate-scale-in hover:scale-110 transition-transform duration-300"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="text-4xl sm:text-5xl font-black text-slate-400 leading-none mb-2">
                          {String(value).padStart(2, '0')}
                        </div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                          {unit}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate(`/event/${featuredEvent._id}`)}
                      className="group bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl btn-magnetic flex items-center gap-3"
                    >
                      View Details
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                      className="glass-card px-8 py-4 rounded-2xl font-semibold text-lg btn-magnetic"
                    >
                      Browse All Events
                    </button>
                  </div>
                </div>

                {/* RIGHT POSTER */}
                <div className="flex justify-center lg:justify-end animate-slide-right">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 animate-glow transition-opacity duration-500" />
                    
                    <div className="relative w-[340px] sm:w-[400px] lg:w-[460px] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 poster-shine">
                      {featuredEvent.posterUrl ? (
                        <img 
                          src={featuredEvent.posterUrl} 
                          alt={featuredEvent.title} 
                          className="w-full h-[480px] object-cover"
                        />
                      ) : (
                        <div className="w-full h-[480px] flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-900">
                          <div className="text-center p-8">
                            <div className="text-4xl font-black mb-2">No Poster</div>
                            <div className="text-lg opacity-80">{featuredEvent.title}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* EVENTS GRID */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
          {/* Header + View Toggle */}
          <div className="flex items-center justify-between mb-12 animate-fade-up">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 heading-font">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600">Discover amazing experiences near you</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block glass-card px-6 py-3 rounded-full">
                <span className="text-sm font-semibold text-gray-700">
                  <span className="text-purple-600 text-2xl font-black">{events.length}</span> Events
                </span>
              </div>
              {/* View Toggle */}
              <div className="flex bg-white rounded-2xl shadow-md p-1 gap-1 border border-purple-100">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  <FaTh className="text-xs" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  <FaCalendar className="text-xs" /> Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="mb-8">
              <EventCalendar events={events} />
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <article
                key={event._id}
                className="event-card bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer card-hover-lift animate-scale-in"
                style={{ animationDelay: `${i * 80}ms` }}
                onClick={() => navigate(`/event/${event._id}`)}
                onMouseEnter={() => setHoveredCard(event._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {event.posterUrl ? (
                    <img 
                      src={event.posterUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover event-card-image"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image available
                    </div>
                  )}
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 glass-card px-4 py-2 rounded-xl">
                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                      {new Date(event.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Sold Out Badge */}
                  {soldOutMap[event._id] && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      🔴 Sold Out
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 heading-font line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-5 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-purple-500 flex-shrink-0" />
                      <span className="font-medium truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-purple-500 flex-shrink-0" />
                      <span className="font-medium">
                        {new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                        soldOutMap[event._id]
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                      }`}
                      disabled={soldOutMap[event._id]}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!soldOutMap[event._id]) navigate(`/event/${event._id}`);
                      }}
                    >
                      {soldOutMap[event._id] ? 'Sold Out' : 'Details'}
                    </button>
                    <button 
                      className={`px-5 py-3 border-2 rounded-xl transition-all duration-300 group ${
                        savedEvents.has(event._id)
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 hover:border-purple-600 hover:bg-purple-50'
                      }`}
                      onClick={(e) => handleBookmark(e, event._id)}
                      title={savedEvents.has(event._id) ? 'Remove bookmark' : 'Save event'}
                      aria-label={savedEvents.has(event._id) ? 'Remove bookmark' : 'Save event'}
                      disabled={bookmarkLoading[event._id]}
                    >
                      {bookmarkLoading[event._id] ? (
                        <span className="text-gray-400 text-xs animate-spin inline-block">⏳</span>
                      ) : (
                        <FaBookmark className={savedEvents.has(event._id) ? 'text-yellow-500' : 'text-gray-400 group-hover:text-purple-600 transition-colors'} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {events.length === 0 && (
              <div className="col-span-full text-center py-20 animate-fade-up">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Found</h3>
                <p className="text-gray-600">Check back soon for upcoming events!</p>
              </div>
            )}
          </div>
          )} {/* end grid view */}
        </main>
        
        <div className="h-24" />
      </div>
    </>
  );
}