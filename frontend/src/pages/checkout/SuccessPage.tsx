import React, { useState, useEffect } from 'react';
import { Check, CalendarDays, MapPin, Armchair, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import Navbar from '../../components/layout/Navbar';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const bookingData = {
    movieTitle: 'Dune: Part Three',
    cinema: 'Multikino Złote Tarasy',
    email: 'john.doe@mail.com',
    details: [
      { icon: MapPin, label: 'Hall', value: 'Hall A' },
      { icon: CalendarDays, label: 'Date', value: 'Sun 23 Mar' },
      { icon: Armchair, label: 'Seats', value: 'D8, D9, D10' },
      { icon: Clock, label: 'Time', value: '14:30' },
    ]
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#1a0b1a] relative overflow-hidden">
      <Navbar />

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15} 
          colors={['#3a0e23', '#a78bfa', '#facc15', '#4ade80']} 
          className="absolute inset-0 z-50 pointer-events-none"
        />
      )}
      
      <main className="max-w-2xl mx-auto pt-9 pb-12 px-6 flex flex-col items-center animate-in fade-in duration-700">
        
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <Check size={48} className="text-white stroke-[4]" />
        </div>

        <h1 className="text-3xl font-black text-[#1a0b1a] mb-3 tracking-tighter">
          Booking confirmed!
        </h1>
        <p className="text-gray-500 font-medium text-sm mb-12 tracking-tight">
          Your tickets have been sent to <span className="text-[#3a0e23] font-bold">{bookingData.email}</span>
        </p>

        <div className="w-full bg-[#f3f4f6] rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
          
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#1a0b1a] tracking-tight">
              {bookingData.movieTitle}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
              {bookingData.cinema}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            {bookingData.details.map((detail, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-gray-400">
                  <detail.icon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {detail.label}
                  </span>
                  <span className="text-sm font-extrabold text-[#1a0b1a]">
                    {detail.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => navigate('/')}
            className="flex-1 max-w-xs text-center text-[#3a0e23] bg-[#e5e7eb] hover:bg-gray-300 font-black py-4 rounded-xl transition-all shadow active:scale-95 text-[11px] uppercase tracking-[0.2em]"
          >
            Back to events
          </button>
          <button 
            onClick={() => navigate('/my-tickets')}
            className="flex-1 max-w-xs bg-[#3a0e23] hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-xl active:scale-95 text-[11px] uppercase tracking-[0.2em]"
          >
            View my tickets
          </button>
        </div>

      </main>
    </div>
  );
};

export default SuccessPage;