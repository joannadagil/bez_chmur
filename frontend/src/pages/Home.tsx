import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { EventCard } from '../components/events/EventCard';
import { apiClient } from '../api/client';

interface EventFromDB {
  id: number;
  event: number;
  title: string;
  venue_name: string;
  type: string;
  price: number | string;
  seatsLeft: number;
  image_url: string;
}
const Home = () => {
const [activeFilter, setActiveFilter] = useState('ALL EVENTS');
  const [searchQuery, setSearchQuery] = useState('');
const [events, setEvents] = useState<EventFromDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobieranie danych z Django
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/event-instances/');
        setEvents(response.data);
      } catch (error) {
        console.error("Błąd pobierania danych z API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
const uniqueEvents = events.reduce((acc: EventFromDB[], current) => {
  const x = acc.find(item => item.event === current.event);
  if (!x) {
    return acc.concat([current]);
  } else {
    return acc;
  }
}, []);
const filteredEvents = uniqueEvents.filter((event: any) => {
  const normalizedType = event.type.trim().toUpperCase();

  const categoryMatch =
    activeFilter === 'ALL EVENTS' ||
    (activeFilter === 'CINEMA' && normalizedType === 'CINEMA') ||
    (activeFilter === 'THEATRE' && normalizedType === 'THEATRE') ||
    (activeFilter === 'LECTURE HALL' && normalizedType === 'LECTURE');

  const searchMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase());

  return categoryMatch && searchMatch;
});
  if (loading) {
    return (
      <div className="bg-[#f5f5dc] min-h-screen flex items-center justify-center">
        <div className="text-[#d3265b] font-black animate-bounce">LOADING EVENTS...</div>
      </div>
    );
  }
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
    {filteredEvents.length}{' '}
    {activeFilter === 'ALL EVENTS' ? 'upcoming' : activeFilter.toLowerCase()}{' '}
    {filteredEvents.length === 1 ? 'event' : 'events'}
  </p>
</div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 pb-20">
            {filteredEvents.map(event => (
              <div 
                key={event.id} 
                className="transform transition-all duration-500 hover:-translate-y-3 hover:rotate-[0.5deg]"
              >
                <EventCard
                  event={{
                    id: String(event.event),
                    title: event.title,
                    venue: event.venue_name,
                    type: event.type,
                    price: event.price,
                    seatsLeft: event.seatsLeft,
                    imageUrl: event.image_url,
                  }}
                />
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