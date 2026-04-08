// src/pages/SeatSelection.tsx
import React, { useState , useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import axios from 'axios';

interface Seat {
  id: number;
  row: string;
  number: number;
  is_reserved: boolean;
  seat_category: {
    name: string;
    price: string | number;
    color_code?: string; 
  };
}

const SeatSelection = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/event-instances/${id}/seats/`);
        setSeats(response.data);
      } catch (error) {
        console.error("Error fetching seats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [id]);

  const rows = Array.from(new Set(seats.map(s => s.row))).sort();

  const currentTotalPrice = seats
    .filter(s => selectedSeatIds.includes(s.id))
    .reduce((sum, s) => sum + Number(s.seat_category.price), 0);

  const toggleSeat = (seatId: number) => {
    setSelectedSeatIds(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) 
        : [...prev, seatId]
    );
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'vip': return 'bg-indigo-400';
      case 'premium': return 'bg-emerald-400';
      case 'standard': return 'bg-blue-400';
      default: return 'bg-orange-400';
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeatIds.length === 0) return;
    
    const selectedSeatLabels = seats
      .filter(s => selectedSeatIds.includes(s.id))
      .map(s => `${s.row}${s.number}`);

    setIsRedirecting(true);
    updateBooking({ 
      seats: selectedSeatLabels, 
      totalPrice: currentTotalPrice
    });

    setTimeout(() => {
      navigate('/checkout/payment');
    }, 1200);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f0f2f5]">
      <Loader2 className="w-12 h-12 animate-spin text-[#3a0e23]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#1a0b1a] animate-in fade-in duration-700">
      <Navbar />

      {isRedirecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#3a0e23] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffafbd]" />
            <span className="text-[11px] font-black uppercase tracking-widest">Securing your seats...</span>
          </div>
        </div>
      )}

      <main className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1a0b1a] tracking-tighter uppercase">
            {booking.eventTitle} — <span className="text-gray-500 not-italic text-2xl">{booking.selectedVenue}</span>
          </h1>
          <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse"></span>
            {booking.date}, {booking.time}
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-16 items-start">

          <div className="md:col-span-8 flex flex-col items-center bg-white p-12 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white">
            <div className="w-3/4 h-1.5 bg-gray-200 rounded-full mb-20 relative shadow-sm">
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">Screen Area</span>
            </div>

            <div className="space-y-4 w-full max-w-2xl px-4">
              {rows.map(rowLabel => (
                <div key={rowLabel} className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-gray-300 w-4">{rowLabel}</span>
                  <div className="flex gap-2.5 flex-grow justify-center">
                    {seats
                      .filter(s => s.row === rowLabel)
                      .sort((a, b) => a.number - b.number)
                      .map(seat => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isTaken = seat.is_reserved;

                        return (
                          <button
                            key={seat.id}
                            disabled={isTaken || isRedirecting}
                            onClick={() => toggleSeat(seat.id)}
                            className={`
                              w-7 h-7 rounded-[8px] transition-all duration-300 relative group
                              ${isTaken ? 'bg-gray-100 cursor-not-allowed opacity-50' : 
                                isSelected ? 'bg-[#3a0e23] ring-4 ring-[#3a0e23]/10 scale-110 z-10' : 
                                `${getCategoryColor(seat.seat_category.name)} hover:scale-125 hover:rotate-3 shadow-sm`}
                            `}
                          >
                            {!isTaken && (
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3a0e23] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-20">
                                {seat.row}{seat.number} - ${seat.seat_category.price}
                              </span>
                            )}
                          </button>
                        );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-orange-400 shadow-sm"/> Economy</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-blue-400 shadow-sm"/> Standard</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-emerald-400 shadow-sm"/> Premium</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-indigo-400 shadow-sm"/> VIP</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-[#3a0e23] shadow-sm"/> Selected</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-gray-100"/> Taken</div>
            </div>
          </div>

          <aside className="md:col-span-4 relative">
            <div className="bg-white p-8 rounded-[35px] border border-white shadow-[0_25px_60px_rgba(0,0,0,0.12)] sticky top-28">
              <h2 className="text-xl font-black mb-8 text-[#3a0e23] uppercase tracking-tighter italic">Your selection</h2>
              
              <div className="min-h-[120px] border-b border-gray-100 pb-8 mb-8">
                <span className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-black">Selected seats:</span>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {selectedSeatIds.length > 0 ? (
                    seats
                      .filter(s => selectedSeatIds.includes(s.id))
                      .map(seat => (
                        <span key={seat.id} className="bg-[#f0f2f5] border border-gray-200 px-4 py-2 rounded-xl text-[11px] font-black text-[#3a0e23] shadow-sm">
                          {seat.row}{seat.number}
                        </span>
                      ))
                  ) : (
                    <p className="text-[11px] italic text-gray-400 font-medium py-2 uppercase tracking-widest">Pick your spot...</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-black">Total Price:</span>
                <span className="text-2xl font-black text-[#3a0e23] tracking-tighter italic">
                  ${currentTotalPrice.toFixed(2)} 
                </span>
              </div>

              <button 
                onClick={handleProceedToPayment}
                disabled={selectedSeatIds.length === 0 || isRedirecting}
                className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2
                  ${selectedSeatIds.length > 0 && !isRedirecting
                    ? 'bg-[#3a0e23] text-white hover:bg-black' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
                `}
              >
                {isRedirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proceed to payment'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SeatSelection;