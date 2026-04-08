import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Moon, Search, Settings, LogOut, Ticket, ChevronDown } from 'lucide-react';
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
    <header className="flex flex-col md:flex-row h-auto md:h-[320px] overflow-hidden shadow-2xl w-full">
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
      <div className="w-full md:w-[420px] bg-gradient-to-b from-[#d3265b] to-[#a11d45] p-10 text-white flex flex-col relative shadow-inner overflow-hidden">
        

        <div className="absolute top-[20%] right-[-10%] w-[200px] h-[200px] bg-white/5 rounded-full blur-[50px] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>

        <div className="relative z-10 flex justify-between items-center mb-10">
          <img 
            src={logo} 
            alt="getAroom Logo" 
            className="w-28 h-auto object-contain cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => navigate('/home')}
          />
          
          <div className="flex items-center gap-4">
            <Moon size={18} className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer group bg-black/10 p-1.5 px-3 rounded-full border border-white/10 hover:bg-black/20 transition-all"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <User size={14} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">John</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 top-14 w-52 bg-white text-[#3a0e23] rounded-2xl shadow-2xl p-2 z-50 border border-gray-100 animate-in zoom-in-95 duration-200">
                  <Link 
                    to="/my-tickets" 
                    className="flex w-full items-center gap-3 p-3 hover:bg-[#fff0f3] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23] transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Ticket size={16} className="text-[#d3265b]" /> My Tickets
                  </Link>
                  <button className="flex w-full items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-[11px] font-black uppercase tracking-wider text-[#3a0e23]">
                    <Settings size={16} className="text-gray-400" /> Settings
                  </button>
                  <div className="h-px bg-gray-100 my-1.5 mx-2" />
                  <button
                    className="flex w-full items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-wider"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/login');
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex-grow flex flex-col justify-end">
          <div className="space-y-1 mb-6">
            <h2 className="text-3xl font-black leading-tight tracking-tighter italic uppercase">
              Search for <br/> <span className="text-white/40">an event</span>
            </h2>
          </div>
          
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Movie, theatre, city..." 
              onChange={(e) => onSearchChange(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 px-5 py-4 outline-none focus:bg-white/10 focus:border-white/30 transition-all font-bold text-base shadow-inner"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20 group-focus-within:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
