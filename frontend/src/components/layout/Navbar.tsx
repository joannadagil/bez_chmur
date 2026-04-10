import React, { useState } from 'react';
import { User, LogOut, Settings, Ticket, ChevronLeft, Moon, Building2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo_white from '../../assets/logo_white.png';

interface NavbarProps {
  hideTicketsLink?: boolean;
  logoLink?: string;
  userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ hideTicketsLink = false, logoLink, userName = 'John' }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  const defaultLogoLink = isLoggedIn ? '/home' : '/login';
  const finalLogoLink = logoLink || defaultLogoLink;
  const profileIcon = hideTicketsLink ? Building2 : User;
  const ProfileIcon = profileIcon;

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
        
        <Link
          to={finalLogoLink}
          className="flex items-center gap-2 no-underline group"
        >
          <img src={logo_white} alt="getAroom Logo" className="w-22 h-12 object-contain group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Moon className="w-5 h-5 text-white/40 cursor-pointer hover:text-[#ffbcc7] transition" />

        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">{userName}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hideTicketsLink ? 'bg-[#d3265b]' : 'bg-[#ffbcc7]'}`}>
              <ProfileIcon size={18} className={hideTicketsLink ? 'text-white' : 'text-[#3a0e23]'} />
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white text-[#3a0e23] rounded-2xl shadow-2xl p-2 z-[110] border border-gray-100 animate-in fade-in zoom-in duration-200">
              {!hideTicketsLink && (
                <>
                  <Link 
                    to="/my-tickets" 
                    className="flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Ticket size={14} /> My Tickets
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                </>
              )}
              <button
                className="flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={14} /> Settings
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                className="flex w-full items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-wider"
                onClick={() => {
                  localStorage.removeItem('isLoggedIn');
                  setIsProfileOpen(false);
                  navigate('/login');
                }}
              >
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