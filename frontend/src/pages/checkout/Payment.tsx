import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Clock, Loader2,AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useBooking } from '../../context/BookingContext';
import { apiClient } from '../../api/client';

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);


  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
  useEffect(() => {
    if (booking.seats.length === 0) {
      navigate('/');
    }
  }, [booking, navigate]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


const handlePayment = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!booking.eventInstanceId || booking.seatIds.length === 0 || !booking.totalPrice) {
    setSubmissionError('Missing booking details or price.');
    return;
  }

  setIsProcessing(true);
  setSubmissionError('');

  try {
    const response = await apiClient.post('/create-checkout-session/', {
      event_instance_id: booking.eventInstanceId,
      seat_ids: booking.seatIds,
      total_price: booking.totalPrice, 
    });

    const { url } = response.data;

    if (url) {
      localStorage.setItem('lastBooking', JSON.stringify(booking));
      window.location.href = url;
    } else {
      throw new Error('No checkout URL received from server');
    }
  } catch (err: any) {
    console.error('Payment Error:', err.response?.data || err.message);
    
    const errorMsg = err.response?.data?.error || 'Payment system is temporarily unavailable.';
    setSubmissionError(errorMsg);
    setIsProcessing(false);
  }
};

 return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#1a0b1a] animate-in fade-in duration-700">
      <Navbar />
      
      <main className="max-w-5xl mx-auto pt-6 pb-12 px-8">
        <div className="mb-8 bg-white border border-white rounded-[22px] py-4 px-6 flex items-center justify-center gap-3 shadow-sm">
          <Clock size={16} className="text-orange-400" />
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
            Time remaining <span className="text-[#3a0e23] text-[13px] ml-1 font-black">{formatTime(timeLeft)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white rounded-[35px] p-9 shadow-lg border border-white">
            <h2 className="text-base font-black mb-8 text-[#3a0e23] uppercase tracking-widest italic">Your order</h2>
            <div className="space-y-7">
              <div>
                <h3 className="text-xl font-black text-[#1a0b1a] tracking-tight uppercase leading-tight">{booking.eventTitle}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {booking.selectedVenue} · Hall A
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {booking.seats.sort().map(seat => (
                  <span key={seat} className="bg-[#f0f2f5] border border-gray-100 text-[#3a0e23] text-[10px] font-black px-4 py-2 rounded-xl">
                    Seat {seat}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Total to Pay</span>
                <span className="text-2xl font-black text-[#3a0e23] italic tracking-tighter">${booking.totalPrice}.00</span>
              </div>
            </div>
          </div>
<div className="bg-white rounded-[35px] p-9 shadow-lg border border-white">
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-base font-black text-[#3a0e23] uppercase tracking-widest italic">Secure Checkout</h2>
    <Lock size={16} className="text-gray-300" />
  </div>

  <div className="space-y-6">
    <div className="bg-[#fcfbff] border-2 border-dashed border-gray-100 rounded-3xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-emerald-100 p-2 rounded-xl">
          <ShieldCheck size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-black text-[#3a0e23] uppercase tracking-tight">Stripe Secure Payment</p>
          <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-1">
            You will be redirected to Stripe to complete your purchase securely. We do not store your card details.
          </p>
        </div>
      </div>
    </div>


    <ul className="space-y-3 px-2">
      <li className="flex items-center gap-3 text-[11px] font-black uppercase tracking-wider text-gray-500">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Instant ticket delivery
      </li>
      <li className="flex items-center gap-3 text-[11px] font-black uppercase tracking-wider text-gray-500">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Official secure encryption
      </li>
    </ul>

    <button 
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full bg-[#3a0e23] hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 mt-4 uppercase text-[12px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> 
          Connecting to Stripe...
        </>
      ) : (
        <>
          Pay ${booking.totalPrice}.00 Now
        </>
      )}
    </button>

    {submissionError && (
      <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl">
        <AlertCircle size={14} />
        <p className="text-[10px] font-black uppercase tracking-wider">{submissionError}</p>
      </div>
    )}

    <div className="flex items-center justify-center gap-3 pt-4 opacity-50">
      <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
    </div>
  </div>
</div>
        </div>
      </main>
    </div>
  );
};