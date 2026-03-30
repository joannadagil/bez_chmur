// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Moon, Search, Settings, LogOut, Ticket } from 'lucide-react';
import logo from '../../assets/logo_white.png';

interface HeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeFilter, onFilterChange, onSearchChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const filters = ['ALL EVENTS', 'CINEMA', 'THEATRE', 'LECTURE HALL'];

  return (
    <header className="flex flex-col md:flex-row h-auto md:h-[320px] overflow-hidden shadow-xl w-full">
      {/* LEWA STRONA: Banner i Filtry */}
      <div className="flex-grow bg-gradient-to-br from-[#f27690] to-[#ffbb9c] p-10 flex flex-col justify-between relative">
        <div className="space-y-4">
          <h1 className="text-5xl lg:text-6xl font-black text-[#d3265b] tracking-tighter italic drop-shadow-sm leading-none uppercase">
            FIND YOUR NEXT EVENT
          </h1>
          <p className="text-[#d3265b] text-xl font-bold opacity-90 uppercase tracking-[0.2em]">
            Cinemas, theatres & lecture halls
          </p>
        </div>

        <div className="flex flex-wrap gap-4 z-10 mt-8 md:mt-0">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-8 py-3 rounded-full font-black text-[12px] transition-all uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 ${
                activeFilter === filter
                  ? 'bg-[#d3265b] text-white' 
                  : 'bg-[#f27690] text-white/90 hover:bg-[#d3265b]/80' 
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-[400px] bg-[#d3265b] p-10 text-white flex flex-col justify-between relative shadow-inner">
        <div className="flex justify-end gap-6 items-center">
          
          <div className="relative flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80">John</span>
             <div className="relative">
                <User 
                  className="w-8 h-8 cursor-pointer hover:opacity-70 transition bg-white/10 rounded-full p-1.5" 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                />
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white text-[#3a0e23] rounded-xl shadow-2xl p-2 z-50 border border-gray-100">
                    <Link 
                      to="/my-tickets" 
                      className="flex w-full items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-xs font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Ticket size={14} /> My Tickets
                    </Link>
                    <button className="flex w-full items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-xs font-black uppercase tracking-wider text-[#3a0e23]">
                      <Settings size={14} /> Settings
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      className="flex w-full items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-wider"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/login');
                      }}
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
             </div>
          </div>
          <Moon className="w-6 h-6 cursor-pointer hover:opacity-70 transition" />
        </div>
        
        <div className="space-y-6 -mt-10">
          <div className="flex items-center gap-3 -ml-6">
             <img 
               src={logo} 
               alt="getAroom Logo" 
               className="w-30 h-15 object-contain cursor-pointer ml-6" 
               onClick={() => navigate('/home')}
             />
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tighter italic uppercase">Search for <br/> an event:</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Start typing..." 
              onChange={(e) => onSearchChange(e.target.value)} 
              className="w-full bg-white/20 border-b-2 border-white/40 text-white placeholder-white/50 px-2 py-3 outline-none focus:border-white transition-all font-bold"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;