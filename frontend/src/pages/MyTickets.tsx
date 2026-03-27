// src/pages/MyTickets.tsx
import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { Ticket, Settings, Bell, LogOut, Clapperboard, Theater, MapPin, QrCode, Calendar } from 'lucide-react';

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const allTickets = [
    { id: '1', isPast: false, title: 'Dune: Part Two', type: 'Cinema', venue: 'Multikino Złote Tarasy', date: 'Sun 23 Mar 2026, 14:30', hall: 'Hall A', seats: ['D8', 'D9'], status: 'Confirmed' },
    { id: '2', isPast: false, title: 'Hamlet — National Theatre', type: 'Theatre', venue: 'Teatr Narodowy', date: 'Sun 30 Mar 2026, 18:30', hall: 'Main Stage', seats: ['F12'], status: 'Confirmed' },
    { id: '3', isPast: true, title: 'Oppenheimer', type: 'Cinema', venue: 'Cinema City', date: 'Jan 15 2024, 20:00', hall: 'IMAX', seats: ['A10'], status: 'Used' },
    { id: '4', isPast: true, title: 'The Glass Menagerie', type: 'Theatre', venue: 'Teatr Współczesny', date: 'Feb 02 2024, 19:00', hall: 'Small Stage', seats: ['B4'], status: 'Expired' }
  ];

  const filteredTickets = allTickets.filter(t => activeTab === 'upcoming' ? !t.isPast : t.isPast);
  const upcomingCount = allTickets.filter(t => !t.isPast).length;

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-sans text-[#1a0b1a] animate-in fade-in duration-700">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-8 py-10">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-10">
          
          <aside className="md:col-span-3 space-y-6">
            <div className="bg-[#3a0e23] p-8 rounded-[35px] text-white text-center shadow-2xl border border-white/5">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-[#ffafbd] to-[#ffbcc7] flex items-center justify-center font-black text-xl text-[#3a0e23] border-4 border-white/10 shadow-inner">
                  JD
                </div>
              </div>
              <h2 className="text-base font-black tracking-tighter uppercase">John Doe</h2>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">John.doe@mail.com</p>
            </div>

            <nav className="bg-[#3a0e23] overflow-hidden rounded-[35px] shadow-2xl flex flex-col border border-white/5">
              {[
                { label: 'My tickets', icon: Ticket, active: true },
                { label: 'Account settings', icon: Settings },
                { label: 'Notifications', icon: Bell },
                { label: 'Log out', icon: LogOut, danger: true }
              ].map((item) => (
                <button 
                  key={item.label}
                  className={`flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b border-white/5 last:border-0 text-left group
                    ${item.active ? 'bg-[#ffbcc7]/10 text-[#ffbcc7]' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    ${item.danger ? 'text-red-400/60 hover:text-red-400' : ''}`}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="md:col-span-9 space-y-6">
            <div className="flex justify-between items-end px-2">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-[#3a0e23]">Tickets</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manage your bookings</p>
              </div>
              
              <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
                {['upcoming', 'past'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                      ${activeTab === tab ? 'bg-[#3a0e23] text-white shadow-lg scale-105' : 'text-black/30 hover:text-[#3a0e23]'}`}
                  >
                    {tab} {tab === 'upcoming' ? `(${upcomingCount})` : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`group relative bg-white p-6 rounded-[35px] shadow-xl border-2 border-transparent flex flex-col md:flex-row items-center gap-8 transition-all hover:border-white/50 hover:shadow-2xl
                    ${ticket.isPast ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="w-16 h-16 rounded-[24px] bg-[#f8f9fa] flex items-center justify-center text-[#3a0e23] shrink-0 group-hover:bg-[#3a0e23] group-hover:text-[#ffbcc7] transition-all duration-300 shadow-inner">
                    {ticket.type === 'Cinema' ? <Clapperboard size={26} /> : <Theater size={26} />}
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h3 className="text-xl font-black text-[#3a0e23] uppercase italic tracking-tighter">
                        {ticket.title}
                      </h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest
                        ${ticket.isPast ? 'bg-gray-100 text-gray-400' : 'bg-emerald-500 text-white shadow-sm'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-y-2 gap-x-5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#ff3366]" /> {ticket.venue}</div>
                      <div className="flex items-center gap-1.5"><Calendar size={12} /> {ticket.date}</div>
                    </div>
                    
                    <div className="flex justify-center md:justify-start gap-2 mt-4">
                      {ticket.seats.map(s => (
                        <span key={s} className="bg-[#3a0e23] text-white text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-tighter">
                          Seat {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {!ticket.isPast ? (
                      <button className="w-full md:w-auto bg-[#3a0e23] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff3366] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                        <QrCode size={16} />
                        View Ticket
                      </button>
                    ) : (
                      <div className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic md:pr-4 text-center">Archived</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MyTickets;