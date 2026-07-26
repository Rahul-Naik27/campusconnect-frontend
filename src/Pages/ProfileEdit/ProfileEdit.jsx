import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { API_BASE } from '../../api';
import axios from 'axios';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, type: 'success', msg: '' });
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    rollNumber: '',
    gender: 'male',
    class: '',
    branch: '',
    yearOfStudy: '1st',
    collegeUID: '',
    avatar: '/boy.png'
  });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        rollNumber: userData.rollNumber || '',
        gender: userData.gender || 'male',
        class: userData.class || '',
        branch: userData.branch || '',
        yearOfStudy: userData.yearOfStudy || '1st',
        collegeUID: userData.collegeUID || '',
        avatar: userData.avatar || (userData.gender === 'female' ? '/girl.png' : '/boy.png')
      }));
    }
  }, []);

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender,
      // Only reset avatar to default if no custom URL is set
      avatar: prev.avatar?.startsWith('http') ? prev.avatar : (gender === 'female' ? '/girl.png' : '/boy.png')
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Maximum size is 5MB.', 'error');
      return;
    }

    const data = new FormData();
    data.append('avatar', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/upload/avatar`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setFormData(prev => ({ ...prev, avatar: res.data.url }));
      showToast('Profile photo uploaded! ✅');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(err.response?.data?.message || 'Upload failed. Try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      const updatedUser = data.user || data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      showToast('Profile updated successfully! 🎉');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Google Fonts loaded globally in index.html */
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.4s ease-out both; }
        @keyframes toast-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .toast { animation: toast-in 0.3s ease-out; }
      `}</style>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 toast px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12" style={{fontFamily:'Inter,sans-serif'}}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden fade-up">

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%,white 1px,transparent 1px)',backgroundSize:'30px 30px'}} />
              <h1 className="text-4xl font-black relative" style={{fontFamily:'Outfit,sans-serif'}}>Edit Profile</h1>
              <p className="text-purple-100 relative mt-1">Personalise your CampusConnect identity</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Avatar Upload ── */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {uploading ? (
                      <div className="w-32 h-32 rounded-full border-4 border-purple-400 flex items-center justify-center bg-purple-50">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent" />
                      </div>
                    ) : (
                      <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-400 shadow-xl group-hover:opacity-80 transition-opacity"
                      />
                    )}
                    <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <span className="text-white text-3xl">📷</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:bg-purple-700 transition-colors">
                      <span className="text-white text-sm">✏️</span>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <p className="text-sm text-gray-500 mt-3 font-medium">Click photo to upload from device</p>
                  <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB • Auto cropped to square</p>
                  {formData.avatar?.startsWith('http') && (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      ✅ Custom photo saved
                    </span>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Gender</label>
                  <div className="flex gap-4">
                    {[['male', '👨 Male', 'blue'], ['female', '👩 Female', 'pink']].map(([val, label, color]) => (
                      <button
                        key={val} type="button" onClick={() => handleGenderChange(val)}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                          formData.gender === val
                            ? `bg-${color}-600 text-white shadow-lg`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fields */}
                {[
                  { id: 'rollNumber', label: 'Roll Number', placeholder: 'e.g., 2024001' },
                  { id: 'collegeUID', label: 'College UID (Student ID)', placeholder: 'e.g., UID123456' },
                  { id: 'class', label: 'Class', placeholder: 'e.g., B.Tech CSE' },
                ].map(({ id, label, placeholder }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                    <input
                      type="text" id={id} name={id} value={formData[id]}
                      onChange={handleInputChange} placeholder={placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                    />
                  </div>
                ))}

                {/* Branch */}
                <div>
                  <label htmlFor="branch" className="block text-sm font-bold text-gray-700 mb-2">Branch</label>
                  <select id="branch" name="branch" value={formData.branch} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select Branch</option>
                    {['CSE','ECE','ME','CE','EE','IT'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="yearOfStudy" className="block text-sm font-bold text-gray-700 mb-2">Year of Study</label>
                  <select id="yearOfStudy" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                  >
                    {['1st','2nd','3rd','4th'].map(y => <option key={y} value={y}>{y} Year</option>)}
                  </select>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => navigate('/dashboard')}
                    className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-600 py-3 rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || uploading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : '✅ Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileEdit;