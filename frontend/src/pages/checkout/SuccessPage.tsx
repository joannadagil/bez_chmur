import React, { useState, useEffect } from 'react';
import { Check, CalendarDays, MapPin, Armchair, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import Navbar from '../../components/layout/Navbar';
import { useBooking } from '../../context/BookingContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();
  const { isDark } = useTheme();

  const [savedBooking, setSavedBooking] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

useEffect(() => {
  const data = localStorage.getItem('lastBooking');
  if (data) {
    setSavedBooking(JSON.parse(data));
  }

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  if (sessionId) {
    apiClient.get(`/verify-payment/?session_id=${sessionId}`)
      .then(() => console.log("Payment verified and DB updated"))
      .catch(err => console.error("Verification failed", err));
  }

  if (!sessionId && !booking.eventTitle && !data) {
    navigate('/');
  }
}, [booking, navigate]);

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

const displayData = savedBooking || booking;

const detailsList = [
  { icon: MapPin, label: 'Hall', value: 'Hall A' },
  { icon: CalendarDays, label: 'Date', value: displayData.date || 'Confirmed' },
  { icon: Armchair, label: 'Seats', value: displayData.seats ? displayData.seats.join(', ') : 'Processing...' },
  { icon: Clock, label: 'Time', value: displayData.time || 'N/A' },
];

  const handleGoHome = () => {
    localStorage.removeItem('lastBooking');
    resetBooking();
    navigate('/');
  };
  if (!displayData.eventTitle && !savedBooking) {
    return <div className="min-h-screen bg-[#f0f2f5]"><Navbar /></div>;
  }

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

        <h1 className={`text-3xl font-black mb-3 tracking-tighter ${isDark ? 'text-[#fdf1e4]' : 'text-[#1a0b1a]'}`}>
          Booking confirmed!
        </h1>
        
        <p className={`font-medium text-sm mb-12 tracking-tight ${isDark ? 'text-[#f3d8e3]' : 'text-gray-500'}`}>
          Success! Your tickets for <span className={`font-bold ${isDark ? 'text-[#ffd7e8]' : 'text-[#3a0e23]'}`}>
            {displayData.eventTitle}
          </span> are ready.
        </p>

        <div className={`w-full rounded-3xl p-8 border shadow-sm mb-12 ${isDark ? 'bg-[#2a081b] border-[#8c2e55]' : 'bg-[#f3f4f6] border-gray-100'}`}>
          <div className="mb-8">
            <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#fdf1e4]' : 'text-[#1a0b1a]'}`}>
              {displayData.eventTitle}
            </h2>
            <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-[#e2b8c9]' : 'text-gray-400'}`}>
              {displayData.selectedVenue || "Venue"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            {detailsList.map((detail, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={isDark ? 'text-[#e2b8c9]' : 'text-gray-400'}>
                  <detail.icon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#e2b8c9]' : 'text-gray-400'}`}>
                    {detail.label}
                  </span>
                  <span className={`text-sm font-extrabold ${isDark ? 'text-[#fdf1e4]' : 'text-[#1a0b1a]'}`}>
                    {detail.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={handleGoHome}
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