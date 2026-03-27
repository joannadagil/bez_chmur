// src/pages/SeatSelection.tsx
import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';

const SeatSelection = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 14;
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) 
        : [...prev, seatId]
    );
  };

  const getSeatColor = (row: string) => {
    if (['A', 'B'].includes(row)) return 'bg-orange-400';
    if (['C', 'D', 'E'].includes(row)) return 'bg-blue-400';
    if (['F', 'G'].includes(row)) return 'bg-emerald-400';
    return 'bg-indigo-400';
  };

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a] animate-in fade-in duration-700">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1a0b1a] tracking-tighter  uppercase">
            Dune: Part Two — <span className="text-gray-500 not-italic">Hall A</span>
          </h1>
          <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse"></span>
            Multikino Złote Tarasy · Sun 23 Mar, 14:30
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-16 items-start">
          
          <div className="md:col-span-8 flex flex-col items-center bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 transition-all hover:shadow-md">
            
            <div className="w-3/4 h-1.5 bg-gray-200 rounded-full mb-20 relative shadow-[0_10px_30px_rgba(45,106,122,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-300/20 to-transparent blur-xl -bottom-12"></div>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">Screen Area</span>
            </div>

            <div className="space-y-4 w-full max-w-2xl px-4">
              {rows.map(row => (
                <div key={row} className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-gray-300 w-4">{row}</span>
                  <div className="flex gap-2.5 flex-grow justify-center">
                    {Array.from({ length: seatsPerRow }).map((_, i) => {
                      const seatId = `${row}${i + 1}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isTaken = (row === 'E' && i > 5 && i < 9) || (row === 'A' && i === 2);

                      return (
                        <button
                          key={seatId}
                          disabled={isTaken}
                          onClick={() => toggleSeat(seatId)}
                          className={`
                            w-7 h-7 rounded-[8px] transition-all duration-300 relative group
                            ${isTaken ? 'bg-gray-100 cursor-not-allowed opacity-50' : 
                              isSelected ? 'bg-[#3a0e23] ring-4 ring-[#3a0e23]/10 scale-110 z-10' : 
                              `${getSeatColor(row)} hover:scale-125 hover:rotate-3 shadow-sm`}
                          `}
                        >
                          {!isTaken && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3a0e23] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-20">
                              {seatId}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-50 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-orange-400"/> Economy — $5</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-blue-400"/> Standard — $7</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-emerald-400"/> Premium — $10</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-indigo-400"/> VIP — $14</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-[#3a0e23]"/> Selected</div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-gray-100"/> Taken</div>
            </div>
          </div>

          <aside className="md:col-span-4 relative">
            <div className="bg-[#e7e6f0] p-8 rounded-[35px] border border-white shadow-sm sticky top-28 transition-all hover:shadow-xl hover:-rotate-1">
              <h2 className="text-xl font-black mb-8 text-[#3a0e23] uppercase tracking-tighter italic">Your selection</h2>
              
              <div className="min-h-[120px] border-b border-gray-300/50 pb-8 mb-8">
                <span className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-black">Selected seats:</span>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.sort().map(seat => (
                      <span key={seat} className="bg-white px-4 py-2 rounded-xl text-[11px] font-black text-[#3a0e23] shadow-md animate-in zoom-in duration-300">
                        {seat}
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
                  ${selectedSeats.length * 12}
                </span>
              </div>

              <button 
                disabled={selectedSeats.length === 0}
                className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95
                  ${selectedSeats.length > 0 
                    ? 'bg-[#3a0e23] text-white hover:bg-black hover:shadow-black/20' 
                    : 'bg-gray-300 text-white cursor-not-allowed'}
                `}
              >
                Proceed to payment
              </button>
              
              <p className="text-center text-[9px] opacity-40 uppercase font-black tracking-widest mt-6 text-gray-500">
                Secure checkout · 10:00 remaining
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SeatSelection;