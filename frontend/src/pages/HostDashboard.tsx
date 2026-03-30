import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const HostDashboard = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f05258] to-[#ff66c4] flex items-center justify-center p-4" style={{ fontFamily: 'TT Firs Neue, sans-serif' }}>
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={logo}
            alt="getAroom Logo"
            className="w-24 h-24 object-contain cursor-pointer"
            onClick={() => navigate(isLoggedIn ? '/home' : '/login')}
          />
          <h1 className="text-3xl font-black text-[#3a0e23] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Host Dashboard
          </h1>
        </div>
        <p className="text-gray-700 font-medium mb-6">do zrobienia</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#fff1f6] rounded-2xl p-4 border border-[#ffc1d2]">
            <h2 className="font-black text-[#3a0e23] uppercase mb-2">Create Event</h2>
            <p className="text-sm text-gray-600">Add new events and manage details with ease.</p>
          </div>
          <div className="bg-[#fff1f6] rounded-2xl p-4 border border-[#ffc1d2]">
            <h2 className="font-black text-[#3a0e23] uppercase mb-2">Track Sales</h2>
            <p className="text-sm text-gray-600">Monitor ticket sales and attendee analytics.</p>
          </div>
        </div>

        <div className="mt-8 text-right">
          <Link to="/home" className="inline-flex items-center gap-2 text-[#e71555] font-bold hover:text-[#f05258] transition-colors uppercase tracking-wider">
            Back to Customer View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
