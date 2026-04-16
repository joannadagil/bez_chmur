// src/pages/EventDetails.tsx
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import Navbar from '../components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { mockEvents } from '../data/mockEvents';

type DateOption = {
  iso: string;
  label: string;
};

const buildDateOptions = (): DateOption[] => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return Array.from({ length: 4 }).map((_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index + 1);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { iso, label: formatter.format(date) };
  });
};

interface EventInstance {
  id: number;
  title: string;
  venue_name: string;
  type: string;
  price: number | string;
  seatsLeft: number;
  image_url: string;
  time: string;
  description?: string;
}
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateBooking } = useBooking();
  const cinemaSectionRef = useRef<HTMLDivElement>(null);
<<<<<<< HEAD

  const [allInstances, setAllInstances] = useState<EventInstance[]>([]);
  const [loading, setLoading] = useState(true);


const [selectedDate, setSelectedDate] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/event-instances/');
        const data: EventInstance[] = response.data;
        
        const initialEvent = data.find(e => e.id.toString() === id);
        
        if (initialEvent) {
          const movieShows = data.filter(e => e.title === initialEvent.title);
          setAllInstances(movieShows);
          
          const dateStr = new Date(initialEvent.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' });
          const timeStr = new Date(initialEvent.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          setSelectedDate(dateStr);
          setSelectedVenue(initialEvent.venue_name);
          setSelectedTime(timeStr);
          setSelectedInstanceId(initialEvent.id);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const availableDates = Array.from(new Set(allInstances.map(e => 
    new Date(e.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' })
  )));

  const venuesForSelectedDate = Array.from(new Set(allInstances
    .filter(e => new Date(e.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' }) === selectedDate)
    .map(e => e.venue_name)
  ));
=======
  const dateOptions = buildDateOptions();
  const selectedEvent = mockEvents.find((event) => event.id === id);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.iso ?? '');
  const [selectedTime, setSelectedTime] = useState('14:30');
  const [selectedVenue, setSelectedVenue] = useState(selectedEvent?.venue ?? '');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!selectedEvent) {
      navigate('/', { replace: true });
    }
  }, [selectedEvent, navigate]);

  useEffect(() => {
    if (selectedEvent) {
      setSelectedVenue(selectedEvent.venue);
    }
  }, [selectedEvent]);

  if (!selectedEvent) {
    return null;
  }

  const eventTitle = selectedEvent.title;
  const selectedDateLabel = dateOptions.find((option) => option.iso === selectedDate)?.label ?? selectedDate;
  
>>>>>>> origin/feature/user-ui

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedVenue('');
    setSelectedTime('');
    cinemaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSeatSelection = () => {
    if (!selectedInstanceId) return;
    
    setIsRedirecting(true);
    updateBooking({
      eventId: selectedInstanceId.toString(), 
      eventTitle: allInstances[0]?.title || '',
      date: selectedDate,
      time: selectedTime,
      selectedVenue: selectedVenue 
    });
    
    setTimeout(() => {
      navigate(`/checkout/${selectedInstanceId}`);
    }, 1500);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest text-[#3a0e23]">Loading experience...</div>;
  if (allInstances.length === 0) return <div>Event not found</div>;

  const mainEvent = allInstances[0];

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a] animate-in fade-in duration-700 relative">
      <Navbar />

      {isRedirecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#3a0e23] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffafbd]" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest">Initializing Session</span>
              <span className="text-[9px] opacity-60 uppercase font-bold">Reserving temporary seat lock...</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-[260px] bg-gradient-to-r from-[#ffafbd] via-[#ffbcc7] to-[#fcfbff] border-b border-[#f0bcc7]">
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center gap-10 relative">
          <div className="relative w-[160px] h-[230px] flex-shrink-0 z-20 shadow-2xl transition-transform duration-500 hover:scale-105 group">
            <img 
<<<<<<< HEAD
              src={mainEvent.image_url} 
              className="w-full h-full object-cover rounded-xl border-[4px] border-white transition-all group-hover:border-[#ffafbd]"
              alt={mainEvent.title}
=======
              src={selectedEvent.imageUrl}
              className="w-full h-full object-cover rounded-xl border-[4px] border-white transition-all group-hover:border-[#ffafbd]"
              alt={selectedEvent.title}
>>>>>>> origin/feature/user-ui
            />
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight uppercase ">
              {mainEvent.title}
            </h1>
            <div className="flex gap-2.5">
<<<<<<< HEAD
              <span className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md">
                {mainEvent.type}
              </span>
=======
              {[selectedEvent.type, Number(selectedEvent.price) > 0 ? `$${selectedEvent.price}` : 'Free', selectedEvent.venue].map(tag => (
                <span key={tag} className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5">
                  {tag}
                </span>
              ))}
>>>>>>> origin/feature/user-ui
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-8 py-12 flex flex-col md:grid md:grid-cols-12 gap-12">
        <div className="md:col-span-8 space-y-12">
{mainEvent.description ? (
    <p className="text-[14px] text-gray-700 leading-relaxed font-medium opacity-80 max-w-3xl border-l-4 border-[#ff3366] pl-6 py-1 whitespace-pre-line">
      {mainEvent.description}
    </p>
  ) : (
    <p className="text-[14px] text-gray-400 italic border-l-4 border-gray-200 pl-6 py-1">
      No description available for this event.
    </p>
  )}

          <section>
            <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-800">Choose a date</h2>
            <div className="flex flex-wrap gap-3">
<<<<<<< HEAD
              {availableDates.map((date) => (
=======
              {dateOptions.map((dateOption) => (
>>>>>>> origin/feature/user-ui
                <button
                  key={dateOption.iso}
                  onClick={() => handleDateSelect(dateOption.iso)}
                  className={`px-5 py-3.5 rounded-xl font-bold text-[11px] transition-all duration-300 min-w-[110px] border active:scale-95 ${
                    selectedDate === dateOption.iso
                    ? 'bg-[#2d6a7a] border-[#2d6a7a] text-white shadow-xl -translate-y-1' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-[#2d6a7a]'
                  }`}
                >
                  {dateOption.label}
                </button>
              ))}
            </div>
          </section>

          <section ref={cinemaSectionRef} className="transition-all duration-700">
            <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-800">Choose a venue & showtime</h2>
            <div className="space-y-6">
<<<<<<< HEAD
              {venuesForSelectedDate.length > 0 ? venuesForSelectedDate.map((cinema) => (
                <div key={cinema} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-sm mb-5 text-gray-400 uppercase tracking-widest">{cinema}</h3>
                  <div className="flex gap-3">
                    {allInstances
                      .filter(e => 
                        new Date(e.time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' }) === selectedDate && 
                        e.venue_name === cinema
                      )
                      .map(instance => {
                        const timeStr = new Date(instance.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isSelected = selectedTime === timeStr && selectedVenue === cinema;
                        
                        return (
                          <button 
                            key={instance.id}
                            onClick={() => { 
                              setSelectedTime(timeStr); 
                              setSelectedVenue(cinema); 
                              setSelectedInstanceId(instance.id);
                            }}
                            className={`px-6 py-3 rounded-xl font-black text-xs transition-all duration-200 ${
                              isSelected
                              ? 'bg-[#d64060] text-white shadow-md scale-105'
                              : 'bg-[#fcfbff] text-gray-500 border border-gray-100 hover:bg-gray-100'
                            }`}
                          >
                            {timeStr}
                          </button>
                        );
                      })}
=======
              {[selectedEvent.venue].map((venue) => (
                <div key={venue} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
                  <h3 className="font-bold text-sm mb-5 text-gray-400 uppercase tracking-widest">{venue}</h3>
                  <div className="flex gap-3">
                    {['14:30', '17:00', '20:15'].map(time => (
                      <button 
                        key={time}
                        onClick={() => { setSelectedTime(time); setSelectedVenue(venue); }}
                        className={`px-6 py-3 rounded-xl font-black text-xs transition-all duration-200 active:scale-90 ${
                          selectedTime === time && selectedVenue === venue
                          ? 'bg-[#d64060] text-white shadow-md scale-105'
                          : 'bg-[#fcfbff] text-gray-500 border border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
>>>>>>> origin/feature/user-ui
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 italic text-sm">Select a date to see available venues.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="md:col-span-4 relative">
          <div className="bg-[#e7e6f0] p-7 rounded-[30px] border border-gray-200/50 shadow-sm sticky top-28 transition-all hover:shadow-xl hover:rotate-[0.5deg]">
            <h2 className="text-lg font-black mb-7 text-[#3a0e23] uppercase tracking-tighter italic text-center md:text-left">Your selection</h2>
            
            <div className="space-y-4 text-xs font-bold border-b border-gray-300/50 pb-7 mb-7">
              {[
<<<<<<< HEAD
                { label: 'Film', value: mainEvent.title },
                { label: 'Date', value: selectedDate || '---' },
                { label: 'Venue', value: selectedVenue || '---' },
                { label: 'Time', value: selectedTime || '---' }
=======
                { label: 'Film', value: eventTitle },
                { label: 'Date', value: selectedDateLabel },
                { label: 'Cinema', value: selectedVenue },
                { label: 'Time', value: selectedTime }
>>>>>>> origin/feature/user-ui
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-[#3a0e23] transition-all hover:translate-x-1">
                  <span className="text-gray-500 uppercase tracking-[0.15em] text-[10px]">{item.label}</span>
                  <span className="text-right text-[11px] font-black">{item.value}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSeatSelection}
              disabled={isRedirecting || !selectedInstanceId}
              className={`w-full py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 ${
                isRedirecting || !selectedInstanceId
                ? 'bg-gray-400 cursor-not-allowed text-white/50' 
                : 'bg-[#3a0e23] text-white hover:bg-black active:scale-95'
              }`}
            >
              {isRedirecting ? 'Processing...' : 'Choose your seat'}
            </button>
            
            <p className="text-center text-[9px] opacity-60 uppercase font-bold tracking-widest mt-4 text-gray-500 italic">
              Seats reserved for 10 min
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default EventDetails;