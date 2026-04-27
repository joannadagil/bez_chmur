import React, { useMemo, useState } from 'react';
import { User, LogOut, Settings, Ticket, ChevronLeft, Building2, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo_white_1 from '../../assets/logo_white_1.png';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  hideTicketsLink?: boolean;
  logoLink?: string;
  userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ hideTicketsLink = false, logoLink, userName }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const isHostUser =
    currentUser.accountType === 'host' ||
    currentUser.email === 'host@getaroom.com' ||
    hideTicketsLink;

  const defaultLogoLink = isLoggedIn ? (isHostUser ? '/host-dashboard' : '/home') : '/login';
  const finalLogoLink = logoLink || defaultLogoLink;
  const profileIcon = isHostUser ? Building2 : User;

  const displayName = useMemo(() => {
    if (userName?.trim()) return userName;

    const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ').trim();

    return (
      currentUser.companyName ||
      fullName ||
      currentUser.email?.split('@')[0] ||
      'User'
    );
  }, [userName, currentUser]);

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

        <Link to={finalLogoLink} className="flex items-center gap-2 no-underline group">
          <img
            src={logo_white_1}
            alt="getAroom Logo"
            className="w-22 h-12 object-contain group-hover:scale-110 transition-transform"
          />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle className="h-9 w-9 border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white" />

        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">
              {displayName}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#ffbcc7] flex items-center justify-center">
              {React.createElement(profileIcon, { size: 18, className: 'text-[#3a0e23]' })}
            </div>
          </div>

          {isProfileOpen && (
            <div className="profile-menu absolute right-0 top-12 w-56 bg-white text-[#3a0e23] rounded-2xl shadow-2xl p-2 z-[110] border border-gray-100 animate-in fade-in zoom-in duration-200">
              {isHostUser ? (
                <Link
                  to="/company-profile"
                  className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Building2 size={14} /> Company Profile
                </Link>
              ) : (
                <>
                  <Link
                    to="/my-tickets"
                    className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Ticket size={14} /> My Tickets
                  </Link>
                  <Link
                    to="/profile"
                    className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={14} /> Profile
                  </Link>
                </>
              )}

              <Link
                to="/notifications"
                className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                onClick={() => setIsProfileOpen(false)}
              >
                <Bell size={14} /> Notifications
              </Link>

              <Link
                to="/settings"
                className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#f5f5dc] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={14} /> Settings
              </Link>

              <div className="h-px bg-gray-100 my-1" />

              <button
                className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-wider"
                onClick={() => {
                  localStorage.removeItem('access');
                  localStorage.removeItem('refresh');
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('currentUser');
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