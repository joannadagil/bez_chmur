// src/pages/Home.tsx
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { EventCard } from '../components/events/EventCard';
import { mockEvents } from '../data/mockEvents';


const Home = () => {
  const [activeFilter, setActiveFilter] = useState('ALL EVENTS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = mockEvents.filter(event => {
    const categoryMatch = activeFilter === 'ALL EVENTS' || 
      (activeFilter === 'CINEMA' && event.type === 'Cinema') ||
      (activeFilter === 'THEATRE' && event.type === 'Theatre') ||
      (activeFilter === 'LECTURE HALL' && event.type === 'Lecture');

    const searchMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <div className="bg-[#f5f5dc] min-h-screen font-sans selection:bg-[#ffbcc7] selection:text-[#3a0e23]">
      <Header 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-[1600px] mx-auto p-10 space-y-12">
        
        <div className="flex items-center gap-4 px-4 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="w-4 h-4 rounded-full bg-[#d3265b] shadow-[0_0_15px_rgba(211,38,91,0.4)] animate-pulse"></div>
          <p className="text-3xl font-black text-[#3a0e23] uppercase tracking-tighter italic leading-none">
            {filteredEvents.length} {activeFilter === 'ALL EVENTS' ? 'upcoming' : activeFilter.toLowerCase()} events
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pb-20">
            {filteredEvents.map(event => (
              <div 
                key={event.id} 
                className="transform transition-all duration-500 hover:-translate-y-3 hover:rotate-[0.5deg]"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center animate-in zoom-in duration-500">
            <div className="inline-block p-10 rounded-[40px] border-4 border-dashed border-[#3a0e23]/10">
              <p className="text-[#3a0e23] font-black uppercase tracking-[0.3em] text-sm opacity-30">
                No events found for <br/> 
                <span className="text-[#d3265b] opacity-100">"{searchQuery || activeFilter}"</span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;