import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .nf-float { animation: float 4s ease-in-out infinite; }
        .nf-fade { animation: fade-up 0.6s ease-out both; }
        .nf-fade-2 { animation: fade-up 0.6s 0.15s ease-out both; }
        .nf-fade-3 { animation: fade-up 0.6s 0.3s ease-out both; }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center px-6" style={{fontFamily:'Inter,sans-serif'}}>
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl -top-20 -left-20" />
          <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-10 blur-3xl -bottom-20 -right-20" />
        </div>

        <div className="relative text-center max-w-lg">
          {/* 404 Number */}
          <div className="nf-float mb-4">
            <span style={{fontFamily:'Outfit,sans-serif',fontSize:'clamp(100px,20vw,180px)',fontWeight:900,background:'linear-gradient(135deg,#a855f7,#6366f1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>
              404
            </span>
          </div>

          <div className="nf-fade">
            <h1 style={{fontFamily:'Outfit,sans-serif'}} className="text-3xl font-black text-white mb-3">
              Page Not Found
            </h1>
          </div>

          <div className="nf-fade-2">
            <p className="text-purple-200 text-lg mb-10 leading-relaxed">
              Looks like this event got cancelled 🎭<br />
              The page you're looking for doesn't exist.
            </p>
          </div>

          <div className="nf-fade-3 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform"
            >
              🏠 Back to Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
