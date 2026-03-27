import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronLeft, Moon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  return (
    <nav className="bg-[#3a0e23] text-white px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-[100]">
      <div className="flex items-center gap-6">
        {!isHome && (
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-[#ffbcc7] font-black text-[10px] hover:text-white transition uppercase tracking-widest"
          >
            <ChevronLeft size={16} strokeWidth={3} /> Back
          </button>
        )}
        
        <Link to="/" className="flex items-center gap-2 no-underline group">
          <div className="w-8 h-8 rounded-full bg-[#d3265b] text-white flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
            G
          </div>
          <span className="text-[11px] font-black tracking-[0.3em] text-white uppercase">
            GETAROOM
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Moon className="w-5 h-5 text-white/40 cursor-pointer hover:text-[#ffbcc7] transition" />

        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">John</span>
            <div className="w-8 h-8 rounded-full bg-[#ffbcc7] flex items-center justify-center">
              <User size={18} className="text-[#3a0e23]" />
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white text-[#3a0e23] rounded-2xl shadow-2xl p-2 z-[110] border border-gray-100 animate-in fade-in zoom-in duration-200">
              <Link 
                to="/my-tickets" 
                className="flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={14} /> My Profile
              </Link>
              <div className="h-px bg-gray-100 my-1" />
              <button className="flex w-full items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-wider">
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;