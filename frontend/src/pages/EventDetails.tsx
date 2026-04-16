// src/pages/EventDetails.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { apiClient } from '../api/client';

type EventInstanceDto = {
  id: number;
  title: string;
  venue_name: string;
  type: string;
  price: number | string;
  seatsLeft: number;
  image_url: string;
  description: string;
  time: string;
};

type DateOption = {
  iso: string;
  label: string;
};

const formatDateLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
};

const formatTimeLabel = (isoDatetime: string) => {
  const date = new Date(isoDatetime);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateBooking } = useBooking();
  const cinemaSectionRef = useRef<HTMLDivElement>(null);

  const [instances, setInstances] = useState<EventInstanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchInstances = async () => {
      try {
        const response = await apiClient.get<EventInstanceDto[]>('/event-instances/');
        const allInstances = response.data;

        const matchingInstances = allInstances.filter(
          (event) => String(event.id) === String(id)
        );

        if (!ignore) {
          if (matchingInstances.length === 0) {
            setLoadingError('Event not found.');
            setInstances([]);
          } else {
            setInstances(matchingInstances);
            setLoadingError('');
          }
        }
      } catch {
        if (!ignore) {
          setLoadingError('Could not load event details from backend.');
          setInstances([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchInstances();

    return () => {
      ignore = true;
    };
  }, [id]);

  const selectedEvent = instances[0] ?? null;

  const dateOptions = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(instances.map((instance) => instance.time.slice(0, 10)))
    );

    return uniqueDates.map((iso) => ({
      iso,
      label: formatDateLabel(iso),
    }));
  }, [instances]);

  const instancesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return instances.filter((instance) => instance.time.slice(0, 10) === selectedDate);
  }, [instances, selectedDate]);

  const availableVenues = useMemo(() => {
    return Array.from(new Set(instancesForSelectedDate.map((instance) => instance.venue_name)));
  }, [instancesForSelectedDate]);

  const availableTimesForVenue = (venue: string) => {
    return instancesForSelectedDate
      .filter((instance) => instance.venue_name === venue)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const selectedInstance = useMemo(() => {
    return instancesForSelectedDate.find(
      (instance) =>
        instance.venue_name === selectedVenue &&
        formatTimeLabel(instance.time) === selectedTime
    ) ?? null;
  }, [instancesForSelectedDate, selectedVenue, selectedTime]);

  useEffect(() => {
    if (!loading && !selectedEvent && !loadingError) {
      navigate('/', { replace: true });
    }
  }, [loading, selectedEvent, loadingError, navigate]);

  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].iso);
    }
  }, [dateOptions, selectedDate]);

  useEffect(() => {
    if (instancesForSelectedDate.length === 0) return;

    const firstInstance = instancesForSelectedDate[0];
    const firstTime = formatTimeLabel(firstInstance.time);

    if (!selectedVenue || !availableVenues.includes(selectedVenue)) {
      setSelectedVenue(firstInstance.venue_name);
      setSelectedTime(firstTime);
      return;
    }

    const validTimes = availableTimesForVenue(selectedVenue).map((instance) =>
      formatTimeLabel(instance.time)
    );

    if (!selectedTime || !validTimes.includes(selectedTime)) {
      setSelectedTime(validTimes[0] ?? '');
    }
  }, [instancesForSelectedDate, availableVenues, selectedVenue, selectedTime]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    cinemaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSeatSelection = () => {
    if (!selectedEvent || !selectedInstance) return;

    setIsRedirecting(true);

    updateBooking({
      eventId: String(selectedEvent.id),
      eventInstanceId: selectedInstance.id,
      eventTitle: selectedEvent.title,
      eventCategory: selectedEvent.type,
      eventImageUrl: selectedEvent.image_url,
      date: selectedDate,
      time: selectedTime,
      selectedVenue,
      seatIds: [],
      seats: [],
      totalPrice: 0,
    });

    setTimeout(() => {
      navigate(`/checkout/${selectedInstance.id}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbff] flex items-center justify-center">
        <div className="text-[#3a0e23] font-black uppercase tracking-widest">
          Loading event...
        </div>
      </div>
    );
  }

  if (loadingError || !selectedEvent) {
    return (
      <div className="min-h-screen bg-[#fcfbff]">
        <Navbar />
        <div className="max-w-[1100px] mx-auto px-8 py-16 text-red-500 font-bold">
          {loadingError || 'Event not found.'}
        </div>
      </div>
    );
  }

  const eventTitle = selectedEvent.title;
  const selectedDateLabel =
    dateOptions.find((option) => option.iso === selectedDate)?.label ?? selectedDate;

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a] animate-in fade-in duration-700 relative">
      <Navbar />

      {isRedirecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#3a0e23] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffafbd]" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest">
                Initializing Session
              </span>
              <span className="text-[9px] opacity-60 uppercase font-bold">
                Reserving temporary seat lock...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-[260px] bg-gradient-to-r from-[#ffafbd] via-[#ffbcc7] to-[#fcfbff] border-b border-[#f0bcc7]">
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center gap-10 relative">
          <div className="relative w-[160px] h-[230px] flex-shrink-0 z-20 shadow-2xl transition-transform duration-500 hover:scale-105 cursor-pointer group">
            <img
              src={selectedEvent.image_url}
              className="w-full h-full object-cover rounded-xl border-[4px] border-white transition-all group-hover:border-[#ffafbd]"
              alt={selectedEvent.title}
            />
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight uppercase">
              {eventTitle}
            </h1>
            <div className="flex gap-2.5">
              {[
                selectedEvent.type,
                Number(selectedEvent.price) > 0 ? `$${selectedEvent.price}` : 'Free',
                selectedVenue || selectedEvent.venue_name,
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-8 py-12 flex flex-col md:grid md:grid-cols-12 gap-12">
        <div className="md:col-span-8 space-y-12">
          <p className="text-[14px] text-gray-700 leading-relaxed font-medium opacity-80 max-w-3xl border-l-4 border-[#ff3366] pl-6 py-1 whitespace-pre-line">
            {selectedEvent.description || 'No description available.'}
          </p>

          <section>
            <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-800">
              Choose a date
            </h2>
            <div className="flex flex-wrap gap-3">
              {dateOptions.map((dateOption) => (
                <button
                  key={dateOption.iso}
                  onClick={() => handleDateSelect(dateOption.iso)}
                  className={`px-5 py-3.5 rounded-xl font-bold text-[11px] transition-all duration-300 min-w-[110px] border active:scale-95 ${
                    selectedDate === dateOption.iso
                      ? 'bg-[#2d6a7a] border-[#2d6a7a] text-white shadow-xl -translate-y-1'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-[#2d6a7a] hover:bg-gray-50'
                  }`}
                >
                  {dateOption.label}
                </button>
              ))}
            </div>
          </section>

          <section ref={cinemaSectionRef} className="transition-all duration-700">
            <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-800">
              Choose a cinema & showtime
            </h2>
            <div className="space-y-6">
              {availableVenues.map((venue) => (
                <div
                  key={venue}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200"
                >
                  <h3 className="font-bold text-sm mb-5 text-gray-400 uppercase tracking-widest">
                    {venue}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {availableTimesForVenue(venue).map((instance) => {
                      const time = formatTimeLabel(instance.time);
                      return (
                        <button
                          key={instance.id}
                          onClick={() => {
                            setSelectedTime(time);
                            setSelectedVenue(venue);
                          }}
                          className={`px-6 py-3 rounded-xl font-black text-xs transition-all duration-200 active:scale-90 ${
                            selectedTime === time && selectedVenue === venue
                              ? 'bg-[#d64060] text-white shadow-md scale-105'
                              : 'bg-[#fcfbff] text-gray-500 border border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="md:col-span-4 relative">
          <div className="bg-[#e7e6f0] p-7 rounded-[30px] border border-gray-200/50 shadow-sm sticky top-28 transition-all hover:shadow-xl hover:rotate-[0.5deg]">
            <h2 className="text-lg font-black mb-7 text-[#3a0e23] uppercase tracking-tighter italic text-center md:text-left">
              Your selection
            </h2>

            <div className="space-y-4 text-xs font-bold border-b border-gray-300/50 pb-7 mb-7">
              {[
                { label: 'Film', value: eventTitle },
                { label: 'Date', value: selectedDateLabel },
                { label: 'Cinema', value: selectedVenue || selectedEvent.venue_name },
                { label: 'Time', value: selectedTime },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center text-[#3a0e23] transition-all hover:translate-x-1"
                >
                  <span className="text-gray-500 uppercase tracking-[0.15em] text-[10px]">
                    {item.label}
                  </span>
                  <span className="text-right text-[11px] font-black">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSeatSelection}
              disabled={isRedirecting || !selectedInstance}
              className={`w-full py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 ${
                isRedirecting
                  ? 'bg-gray-400 cursor-wait text-white/50'
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