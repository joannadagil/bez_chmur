// src/pages/checkout/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvc(value);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      console.log("Payment successful!");
      navigate('/checkout/success'); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#1a0b1a] animate-in fade-in duration-700">
      <Navbar />
      
      <main className="max-w-5xl mx-auto pt-6 pb-12 px-8">
        
        <div className="mb-8 bg-white border border-white rounded-[22px] py-4 px-6 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <Clock size={16} className="text-orange-400" />
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
            Time remaining <span className="text-[#3a0e23] text-[13px] ml-1 font-black">{formatTime(timeLeft)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          <div className="bg-white rounded-[35px] p-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white">
            <h2 className="text-base font-black mb-8 text-[#3a0e23] uppercase tracking-widest italic">Your order</h2>
            
            <div className="space-y-7">
              <div>
                <h3 className="text-xl font-black text-[#1a0b1a] tracking-tight uppercase leading-tight">Dune: Part Two</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Multikino Złote Tarasy · Hall A
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {['D8', 'D9', 'D10'].map(seat => (
                  <span key={seat} className="bg-[#f0f2f5] border border-gray-100 text-[#3a0e23] text-[10px] font-black px-4 py-2 rounded-xl shadow-sm">
                    {seat}
                  </span>
                ))}
              </div>

              <div className="space-y-4 pt-5 border-t border-gray-50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>3 × Premium Ticket</span>
                  <span className="text-[#1a0b1a] font-bold">$36.00</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Booking Fee</span>
                  <span className="text-emerald-500 italic font-black">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Total Amount</span>
                <span className="text-2xl font-black text-[#3a0e23] italic tracking-tighter">$36.00</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[35px] p-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-base font-black text-[#3a0e23] uppercase tracking-widest italic">Payment</h2>
              <Lock size={16} className="text-gray-300" />
            </div>

            <form onSubmit={handlePayment} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Email</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@email.com"
                  className="w-full bg-[#fcfbff] border-2 border-gray-50 rounded-2xl p-4.5 text-sm font-bold shadow-sm focus:border-[#3a0e23] transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Card details</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-[#fcfbff] border-2 border-gray-50 rounded-2xl p-4.5 pl-13 text-sm font-bold shadow-sm focus:border-[#3a0e23] transition-all outline-none"
                  />
                  <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Expiry Date</label>
                  <input 
                    required
                    type="text" 
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full bg-[#fcfbff] border-2 border-gray-50 rounded-2xl p-4.5 text-sm font-bold shadow-sm text-center focus:border-[#3a0e23] transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CVC Code</label>
                  <input 
                    required
                    type="text" 
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="123"
                    className="w-full bg-[#fcfbff] border-2 border-gray-50 rounded-2xl p-4.5 text-sm font-bold shadow-sm text-center focus:border-[#3a0e23] transition-all outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#3a0e23] hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 mt-4 uppercase text-[12px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Purchase'
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-5 opacity-40">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                  Secured by Stripe
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};