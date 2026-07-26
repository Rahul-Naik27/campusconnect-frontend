import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const StarRating = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          className="transition-transform duration-150 disabled:cursor-default"
          style={{ transform: (hovered || value) >= star ? 'scale(1.25)' : 'scale(1)' }}
        >
          <span
            className="text-4xl select-none"
            style={{
              filter: (hovered || value) >= star
                ? 'drop-shadow(0 0 6px rgba(250,204,21,0.7))'
                : 'none',
            }}
          >
            {(hovered || value) >= star ? '⭐' : '☆'}
          </span>
        </button>
      ))}
    </div>
  );
};

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

export default function Feedback() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${eventId}`)
      .then(({ data }) => setEvent(data))
      .catch(() => setError('Event not found.'))
      .finally(() => setFetching(false));
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/feedback', { eventId, rating, comment });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.5s ease-out both; }
        @keyframes pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .pop { animation: pop 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-12 px-4" style={{ fontFamily: 'Inter,sans-serif' }}>
        <div className="max-w-lg mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition"
          >
            ← Back to Dashboard
          </button>

          {submitted ? (
            /* ── Success State ── */
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center pop">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>
                Thank You!
              </h2>
              <p className="text-gray-500 mb-2 text-lg">Your feedback has been submitted.</p>
              {event && (
                <p className="text-purple-600 font-semibold mb-8">for <em>{event.title}</em></p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-0.5 transform"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white border-2 border-purple-200 text-purple-700 px-8 py-3 rounded-xl font-bold hover:border-purple-400 transition"
                >
                  Browse Events
                </button>
              </div>
            </div>
          ) : (
            /* ── Feedback Form ── */
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden fade-up">

              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-8 py-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,white 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
                <div className="relative z-10">
                  <div className="text-purple-200 text-xs font-bold uppercase tracking-[0.2em] mb-1">CampusConnect</div>
                  <h1 className="text-3xl font-black leading-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
                    Rate Your Experience
                  </h1>
                  {event && (
                    <p className="text-purple-200 mt-2 font-medium">{event.title}</p>
                  )}
                </div>
              </div>

              <div className="p-8">
                {event && (
                  <div className="bg-purple-50 rounded-2xl p-4 mb-6 flex gap-4 items-center">
                    {event.posterUrl ? (
                      <img src={event.posterUrl} alt={event.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">🎭</div>
                    )}
                    <div>
                      <div className="font-bold text-gray-800">{event.title}</div>
                      <div className="text-purple-600 text-sm font-semibold">{event.departmentOrClub}</div>
                      <div className="text-gray-500 text-xs mt-0.5">📍 {event.venue}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      How would you rate this event? *
                    </label>
                    <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6">
                      <StarRating value={rating} onChange={setRating} disabled={loading} />
                      <div className={`text-sm font-bold transition-all duration-200 ${rating > 0 ? 'text-purple-600 opacity-100' : 'text-gray-400 opacity-0'}`}>
                        {LABELS[rating]}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Share your thoughts <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder="What did you enjoy? What could be improved?"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none bg-gray-50 hover:bg-white text-gray-800"
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">{comment.length}/500</div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
                      ❌ {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span> Submitting...
                      </span>
                    ) : '⭐ Submit Feedback'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
