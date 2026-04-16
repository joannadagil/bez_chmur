import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck, Clock,User, Loader2,AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useBooking } from '../../context/BookingContext';
import { createOrder } from '../../api/tickets';

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
  };

const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
    if (errors.expiry) setErrors(prev => ({ ...prev, expiry: '' }));
  };

const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvc(value);
    if (errors.cvc) setErrors(prev => ({ ...prev, cvc: '' }));
  };

const handleRandomizePayment = () => {
    const demoNames = ['John Doe', 'Anna Kowalska', 'Alex Rivera', 'Maya Smith'];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const randomCard = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
    const formattedCard = randomCard.replace(/(\d{4})(?=\d)/g, '$1 ');
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
    const year = String((new Date().getFullYear() + 2 + Math.floor(Math.random() * 3)) % 100).padStart(2, '0');
    const randomCvc = String(100 + Math.floor(Math.random() * 900));

    setCardHolder(randomName);
    setCardNumber(formattedCard);
    setExpiry(`${month}/${year}`);
    setCvc(randomCvc);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (cardHolder.trim().split(' ').length < 2) {
      newErrors.cardHolder = 'Enter full name (First and Last name)';
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (expiry.length < 5) {
      newErrors.expiry = 'Format MM/YY required';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) newErrors.expiry = 'Invalid month';
      else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    if (cvc.length < 3) {
      newErrors.cvc = 'CVC must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.email) {
      setSubmissionError('You need to be logged in before completing payment.');
      return;
    }

    setIsProcessing(true);
    setSubmissionError('');

    try {
      await createOrder({
        email: currentUser.email,
        first_name: currentUser.firstName || '',
        last_name: currentUser.lastName || '',
        event_title: booking.eventTitle,
        venue_name: booking.selectedVenue,
        event_date: booking.date,
        event_time: booking.time,
        seats: booking.seats,
        total_price: booking.totalPrice,
      });

      setIsProcessing(false);
      navigate('/checkout/success');
    } catch {
      setIsProcessing(false);
      setSubmissionError('Could not complete payment right now. Please try again.');
    }
  };
  const getInputClass = (fieldName: string) => `
    w-full bg-[#fcfbff] border-2 rounded-2xl p-4.5 text-sm font-bold shadow-sm transition-all outline-none
    ${errors[fieldName] ? 'border-red-400 focus:border-red-400' : 'border-gray-50 focus:border-[#3a0e23]'}
  `;

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
              <h2 className="text-base font-black text-[#3a0e23] uppercase tracking-widest italic">Payment</h2>
              <Lock size={16} className="text-gray-300" />
            </div>

            <form onSubmit={handlePayment} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cardholder Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                      if (errors.cardHolder) setErrors(prev => ({ ...prev, cardHolder: '' }));
                    }}
                    placeholder="John Doe"
                    className={`${getInputClass('cardHolder')} pl-13`}
                  />
                  <User className={`absolute left-5 top-1/2 -translate-y-1/2 ${errors.cardHolder ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                </div>
                {errors.cardHolder && <p className="text-[9px] text-red-500 font-black uppercase mt-1 flex items-center gap-1 ml-1"><AlertCircle size={10}/> {errors.cardHolder}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Card details</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    className={`${getInputClass('cardNumber')} pl-13`}
                  />
                  <CreditCard className={`absolute left-5 top-1/2 -translate-y-1/2 ${errors.cardNumber ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                </div>
                {errors.cardNumber && <p className="text-[9px] text-red-500 font-black uppercase mt-1 flex items-center gap-1 ml-1"><AlertCircle size={10}/> {errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Expiry Date</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className={`${getInputClass('expiry')} text-center`}
                  />
                  {errors.expiry && <p className="text-[9px] text-red-500 font-black uppercase mt-1 flex items-center gap-1 ml-1"><AlertCircle size={10}/> {errors.expiry}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CVC Code</label>
                  <input 
                    type="text" 
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="123"
                    className={`${getInputClass('cvc')} text-center`}
                  />
                  {errors.cvc && <p className="text-[9px] text-red-500 font-black uppercase mt-1 flex items-center gap-1 ml-1"><AlertCircle size={10}/> {errors.cvc}</p>}
                </div>
              </div>

              <button 
                type="button"
                onClick={handleRandomizePayment}
                disabled={isProcessing}
                className="w-full border-2 border-[#3a0e23]/30 text-[#3a0e23] font-black py-3 rounded-2xl transition-all uppercase text-[11px] tracking-[0.18em] hover:bg-[#f0f2f5] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Randomize Payment (Debug)
              </button>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#3a0e23] hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 mt-4 uppercase text-[12px] tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  'Complete Purchase'
                )}
              </button>

              {submissionError && (
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-500 text-center">{submissionError}</p>
              )}

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