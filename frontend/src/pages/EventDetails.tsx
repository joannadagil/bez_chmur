// src/pages/EventDetails.tsx
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import Navbar from '../components/layout/Navbar';
import { Loader2, CheckCircle2 } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const cinemaSectionRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState('Sun 23 Mar');
  const [selectedTime, setSelectedTime] = useState('14:30');
  const [selectedCinema, setSelectedCinema] = useState('Multikino Złote Tarasy');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    cinemaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSeatSelection = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      navigate(`/checkout/${id}`);
    }, 1500);
  };

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
          <div className="relative w-[160px] h-[230px] flex-shrink-0 z-20 shadow-2xl transition-transform duration-500 hover:scale-105 cursor-pointer group">
            <img 
              src="https://s3.amazonaws.com/nightjarprod/content/uploads/sites/189/2024/05/29150236/czembW0Rk1Ke7lCJGahbOhdCuhV-scaled.jpg" 
              className="w-full h-full object-cover rounded-xl border-[4px] border-white transition-all group-hover:border-[#ffafbd]"
              alt="Dune Movie Poster"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight uppercase ">
              Dune: Part Two
            </h1>
            <div className="flex gap-2.5">
              {['Cinema', '2h 38min', 'Sci-Fi'].map(tag => (
                <span key={tag} className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-8 py-12 flex flex-col md:grid md:grid-cols-12 gap-12">
        <div className="md:col-span-8 space-y-12">
          <p className="text-[14px] text-gray-700 leading-relaxed font-medium opacity-80 max-w-3xl border-l-4 border-[#ff3366] pl-6 py-1">
            “Dune: Part Two” continues the epic story of Paul Atreides as he rises from exile to become a powerful leader on the desert planet Arrakis.

After the fall of House Atreides, Paul joins the Fremen — the native people of Arrakis — and begins to embrace their way of life. As he grows closer to Chani and gains the trust of the Fremen, Paul trains, fights, and learns to survive in the harsh desert. At the same time, he starts to fulfill a prophecy that may turn him into a messianic figure.

The film explores Paul’s internal struggle between love, destiny, and the danger of becoming a symbol of fanaticism. Meanwhile, powerful enemies like the Harkonnens and the Emperor prepare for war, leading to an intense and dramatic conflict over control of the most valuable resource in the universe: spice.

With breathtaking visuals, massive battles, and deep philosophical themes, Dune: Part Two is a story about power, fate, and the cost of leadership.
          </p>

          <section>
            <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-800">Choose a date</h2>
            <div className="flex flex-wrap gap-3">
              {['Sat 22 Mar', 'Sun 23 Mar', 'Mon 24 Mar', 'Tue 25 Mar'].map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`px-5 py-3.5 rounded-xl font-bold text-[11px] transition-all duration-300 min-w-[110px] border active:scale-95 ${
                    selectedDate === date 
                    ? 'bg-[#2d6a7a] border-[#2d6a7a] text-white shadow-xl -translate-y-1' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-[#2d6a7a] hover:bg-gray-50'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </section>

          <section ref={cinemaSectionRef} className="transition-all duration-700">
            <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-800">Choose a cinema & showtime</h2>
            <div className="space-y-6">
              {['Multikino Złote Tarasy', 'Cinema City Arkadia'].map((cinema) => (
                <div key={cinema} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200">
                  <h3 className="font-bold text-sm mb-5 text-gray-400 uppercase tracking-widest">{cinema}</h3>
                  <div className="flex gap-3">
                    {['14:30', '17:00', '20:15'].map(time => (
                      <button 
                        key={time}
                        onClick={() => { setSelectedTime(time); setSelectedCinema(cinema); }}
                        className={`px-6 py-3 rounded-xl font-black text-xs transition-all duration-200 active:scale-90 ${
                          selectedTime === time && selectedCinema === cinema
                          ? 'bg-[#d64060] text-white shadow-md scale-105'
                          : 'bg-[#fcfbff] text-gray-500 border border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="md:col-span-4 relative">
          <div className="bg-[#e7e6f0] p-7 rounded-[30px] border border-gray-200/50 shadow-sm sticky top-28 transition-all hover:shadow-xl hover:rotate-[0.5deg]">
            <h2 className="text-lg font-black mb-7 text-[#3a0e23] uppercase tracking-tighter italic text-center md:text-left">Your selection</h2>
            
            <div className="space-y-4 text-xs font-bold border-b border-gray-300/50 pb-7 mb-7">
              {[
                { label: 'Film', value: 'Dune: Part Two' },
                { label: 'Date', value: selectedDate },
                { label: 'Cinema', value: selectedCinema },
                { label: 'Time', value: selectedTime }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-[#3a0e23] transition-all hover:translate-x-1">
                  <span className="text-gray-500 uppercase tracking-[0.15em] text-[10px]">{item.label}</span>
                  <span className="text-right text-[11px] font-black">{item.value}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSeatSelection}
              disabled={isRedirecting}
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