import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Building2, ChevronDown, Settings, LogOut, Bell } from 'lucide-react';
import { EventCard } from '../components/events/EventCard';
import { fetchHostEvents, type HostEventDto } from '../api/hostEvents';
import logo from '../assets/logo_white.png';
import ThemeToggle from '../components/layout/ThemeToggle';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('ALL EVENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hostEvents, setHostEvents] = useState<HostEventDto[]>([]);
  const [loadingError, setLoadingError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    let ignore = false;

    const loadHostEvents = async () => {
      if (!currentUser?.email) {
        setLoadingError('Missing host email for loading events.');
        return;
      }

      try {
        const data = await fetchHostEvents(currentUser.email);
        if (!ignore) {
          setHostEvents(data);
          setLoadingError('');
        }
      } catch {
        if (!ignore) {
          setLoadingError('Could not load host events from backend.');
          setHostEvents([]);
        }
      }
    };

    loadHostEvents();
    return () => {
      ignore = true;
    };
  }, [currentUser?.email]);

  const filteredEvents = useMemo(() => hostEvents.filter(event => {
    const categoryMatch = activeFilter === 'ALL EVENTS' ||
      (activeFilter === 'CINEMA' && event.type === 'Cinema') ||
      (activeFilter === 'THEATRE' && event.type === 'Theatre') ||
      (activeFilter === 'LECTURE HALL' && event.type === 'Lecture');

    const searchMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  }), [hostEvents, activeFilter, searchQuery]);

  const filters = ['ALL EVENTS', 'CINEMA', 'THEATRE', 'LECTURE HALL'];

  return (
    <div className="bg-[#f5f5dc] min-h-screen font-sans selection:bg-[#ffbcc7] selection:text-[#3a0e23]">
      <header className="flex flex-col md:flex-row h-auto md:h-[320px] overflow-hidden shadow-2xl w-full">
        <div className="flex-grow bg-gradient-to-br from-[#f27690] to-[#ffbb9c] p-10 flex flex-col justify-between relative">
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-black text-[#d3265b] tracking-tighter italic drop-shadow-sm leading-none uppercase">
              Create your next event
            </h1>
            <p className="text-[#d3265b] text-xl font-bold opacity-90 uppercase tracking-[0.2em]">
              Manage and launch shows.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 z-10 mt-8 md:mt-0">
            {filters.map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-full font-black text-[12px] uppercase tracking-widest transition-all ${
                  activeFilter === filter
                    ? 'bg-[#d3265b] text-white shadow-lg'
                    : 'bg-[#d3265b]/40 text-white hover:bg-[#d3265b]/60'
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

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-8">
              <img
                src={logo}
                alt="getAroom Logo"
                className="w-24 h-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/host-dashboard')}
              />
              <div className="flex items-center gap-4">
                <ThemeToggle className="h-9 w-9 border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white" />
                <div className="relative">
                  <div
                    className="flex items-center gap-2 cursor-pointer group bg-white/10 p-1.5 px-3 rounded-full border border-white/10 hover:bg-white/20 transition-all"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                      <Building2 size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{currentUser.companyName || currentUser.firstName || 'Company'}</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isProfileOpen && (
                    <div className="profile-menu absolute right-0 top-14 w-56 bg-white text-[#3a0e23] rounded-2xl shadow-2xl p-2 z-50 border border-gray-100 animate-in zoom-in-95 duration-200">
                      <Link
                        to="/company-profile"
                        className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#fff0f3] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Building2 size={16} className="text-[#d3265b]" /> Company Profile
                      </Link>
                      <Link
                        to="/notifications"
                        className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-[#fff0f3] rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23] transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Bell size={16} className="text-[#d3265b]" /> Notifications
                      </Link>
                      <Link
                        to="/settings"
                        className="profile-menu-item flex w-full items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-[11px] font-black uppercase tracking-wider no-underline text-[#3a0e23]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} className="text-gray-400" /> Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1.5 mx-2" />
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
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-3xl font-black uppercase tracking-tighter leading-tight">
                Your events at a glance
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/host-dashboard/add-event')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/20"
              >
                <Plus size={16} />
                Add a new event
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-10 space-y-12">
        <div className="flex items-center gap-4 px-4 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="w-4 h-4 rounded-full bg-[#d3265b] shadow-[0_0_15px_rgba(211,38,91,0.4)] animate-pulse"></div>
          <p className="text-3xl font-black text-[#3a0e23] uppercase tracking-tighter italic leading-none">
            {filteredEvents.length} active events
          </p>
        </div>

        <div className="px-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your events..."
            className="w-full max-w-xl bg-white border border-[#e3d5c8] rounded-full px-6 py-4 text-[#3a0e23] font-bold placeholder:text-[#a56d7d] focus:outline-none focus:ring-2 focus:ring-[#d3265b]/40"
          />
        </div>

        {loadingError && (
          <div className="px-4 text-sm font-bold text-red-500 uppercase tracking-[0.12em]">{loadingError}</div>
        )}

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 pb-20">
            {filteredEvents.map(event => (
              <div key={event.id} className="transform transition-all duration-500 hover:-translate-y-3 hover:rotate-[0.5deg]">
                <EventCard
                  event={{
                    id: String(event.id),
                    title: event.title,
                    venue: event.venue,
                    type: event.type,
                    price: event.price > 0 ? event.price : 'Free',
                    seatsLeft: event.seatsLeft,
                    imageUrl: event.imageUrl,
                  }}
                  detailsPathBase="/host-dashboard/event"
                  ctaLabel="Manage"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center animate-in zoom-in duration-500">
            <div className="inline-block p-10 rounded-[40px] border-4 border-dashed border-[#3a0e23]/10 bg-white/90">
              <p className="text-[#3a0e23] font-black uppercase tracking-[0.3em] text-sm opacity-30">
                No host events found for <br />
                <span className="text-[#d3265b] opacity-100">"{searchQuery || activeFilter}"</span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HostDashboard;
