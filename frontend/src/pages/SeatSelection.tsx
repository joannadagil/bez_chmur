// src/pages/SeatSelection.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { venues } from '../data/venues';
import { apiClient } from '../api/client';

type Category = 'vip' | 'area1' | 'area2' | 'handicap';

type BackendSeat = {
  id: number;
  row: string;
  number: number;
  is_reserved: boolean;
  if_exist: boolean;
  seat_category: {
    name: string;
    price: number;
  };
};

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  vip: { label: 'VIP', color: '#ff66c4' },
  area1: { label: 'AREA 1', color: '#6dd3d9' },
  area2: { label: 'AREA 2', color: '#a438e7' },
  handicap: { label: 'HANDICAP', color: '#fbb035' },
};

const splitSeatSections = (seatsPerRow: number) => {
  const left = Math.max(2, Math.floor(seatsPerRow * 0.3));
  const right = left;
  const center = Math.max(2, seatsPerRow - left - right);
  return [left, center, right];
};

const normalizeCategory = (name?: string): Category => {
  const value = (name || '').trim().toLowerCase();

  if (value.includes('vip')) return 'vip';
  if (value.includes('handicap') || value.includes('accessible')) return 'handicap';
  if (value.includes('area 2') || value.includes('area2')) return 'area2';
  return 'area1';
};

const SeatSelection = () => {
  const navigate = useNavigate();
  const { id: venueId } = useParams();
  const { booking, updateBooking } = useBooking();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [seatError, setSeatError] = useState('');
  const [backendSeats, setBackendSeats] = useState<BackendSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  const defaultLayout = {
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    seatsPerRow: 14,
  };

  const selectedVenue =
    venues.find((venue) => venue.id === venueId && venue.type === 'seated') ||
    venues.find((venue) => venue.name === booking.selectedVenue && venue.type === 'seated');

  const currentLayout = selectedVenue?.layout ?? defaultLayout;
  const seatSections = splitSeatSections(currentLayout.seatsPerRow);
  const matrixWidth = Math.min(currentLayout.seatsPerRow * 42, 1040);
  const removedSeats = new Set(booking.removedSeats ?? []);

  const eventInstanceId = useMemo(() => {
    if (booking.eventInstanceId) return booking.eventInstanceId;
    const parsed = Number(booking.eventId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [booking.eventId, booking.eventInstanceId]);

  useEffect(() => {
    let ignore = false;

    const loadSeats = async () => {
      if (!eventInstanceId) {
        if (!ignore) {
          setSeatError('Missing event instance. Please go back and choose an event again.');
          setLoadingSeats(false);
        }
        return;
      }

      try {
        const response = await apiClient.get<BackendSeat[]>(
          `/event-instances/${eventInstanceId}/seats/`
        );

        if (!ignore) {
          setBackendSeats(response.data);
          setSeatError('');
        }
      } catch {
        if (!ignore) {
          setSeatError('Could not load seats from backend.');
        }
      } finally {
        if (!ignore) {
          setLoadingSeats(false);
        }
      }
    };

    loadSeats();

    return () => {
      ignore = true;
    };
  }, [eventInstanceId]);

  const seatMap = useMemo(() => {
    const map = new Map<string, BackendSeat>();
    backendSeats.forEach((seat) => {
      map.set(`${seat.row}${seat.number}`, seat);
    });
    return map;
  }, [backendSeats]);

  const currentTotalPrice = useMemo(() => {
    return backendSeats
      .filter((seat) => selectedSeatIds.includes(seat.id))
      .reduce((sum, seat) => sum + Number(seat.seat_category?.price ?? 0), 0);
  }, [backendSeats, selectedSeatIds]);

  const toggleSeat = (seat: BackendSeat) => {
    if (seat.is_reserved || isRedirecting || !seat.if_exist) return;

    const seatLabel = `${seat.row}${seat.number}`;

    setSelectedSeats((prev) =>
      prev.includes(seatLabel)
        ? prev.filter((s) => s !== seatLabel)
        : [...prev, seatLabel]
    );

    setSelectedSeatIds((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id]
    );
  };

  const randomizeDebugSeats = () => {
    if (isRedirecting) return;

    const availableSeats = backendSeats.filter(
      (seat) =>
        seat.if_exist &&
        !seat.is_reserved &&
        !removedSeats.has(`${seat.row}${seat.number}`)
    );

    if (availableSeats.length === 0) {
      setSelectedSeats([]);
      setSelectedSeatIds([]);
      return;
    }

    const shuffled = [...availableSeats].sort(() => Math.random() - 0.5);
    const amount = Math.min(4, Math.max(1, Math.floor(Math.random() * 4) + 1), shuffled.length);
    const picked = shuffled.slice(0, amount);

    setSelectedSeats(picked.map((seat) => `${seat.row}${seat.number}`));
    setSelectedSeatIds(picked.map((seat) => seat.id));
  };

  const handleProceedToPayment = () => {
    if (!eventInstanceId || selectedSeatIds.length === 0) return;

    setIsRedirecting(true);

    updateBooking({
      eventInstanceId,
      seats: selectedSeats,
      seatIds: selectedSeatIds,
      totalPrice: currentTotalPrice,
    });

    setTimeout(() => {
      navigate('/checkout/payment');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#1a0b1a] animate-in fade-in duration-700">
      <Navbar />

      {isRedirecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#3a0e23] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffafbd]" />
            <span className="text-[11px] font-black uppercase tracking-widest">
              Securing your seats...
            </span>
          </div>
        </div>
      )}

      <main className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1a0b1a] tracking-tighter uppercase">
            {booking.eventTitle} —{' '}
            <span className="text-gray-500 not-italic text-2xl">
              {booking.selectedVenue || 'Venue'}
            </span>
          </h1>
          <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse"></span>
            {booking.selectedVenue} · {booking.date}, {booking.time}
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-8 flex flex-col items-center bg-white p-12 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="w-3/4 h-1.5 bg-gray-200 rounded-full mb-20 relative shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-300/20 to-transparent blur-xl -bottom-12"></div>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">
                Screen Area
              </span>
            </div>

            {loadingSeats && (
              <div className="w-full text-center py-12 text-[#3a0e23] font-bold">
                Loading seats...
              </div>
            )}

            {!loadingSeats && seatError && (
              <div className="w-full text-center py-12 text-red-500 font-bold">
                {seatError}
              </div>
            )}

            {!loadingSeats && !seatError && (
              <>
                <div className="mx-auto w-full select-none">
                  <div className="space-y-4">
                    {Array.from(new Set(backendSeats.map((seat) => seat.row))).map((row) => {
                      const rowSeats = backendSeats
                        .filter((seat) => seat.row === row && seat.if_exist)
                        .sort((a, b) => a.number - b.number);

                      return (
                        <div key={row} className="flex items-center gap-5 justify-center">
                          <span className="text-[10px] font-black text-gray-300 w-4">{row}</span>

                          <div className="flex items-center gap-2 flex-wrap max-w-[760px]">
                            {rowSeats.map((seat) => {
                              const seatLabel = `${seat.row}${seat.number}`;
                              const isSelected = selectedSeatIds.includes(seat.id);
                              const isTaken = seat.is_reserved;
                              const category = normalizeCategory(seat.seat_category?.name);

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={isTaken || isRedirecting}
                                  onClick={() => toggleSeat(seat)}
                                  className="w-7 h-7 rounded-[8px] transition-all duration-300 relative group border"
                                  style={
                                    isTaken
                                      ? {
                                          backgroundColor: '#efeff3',
                                          borderColor: '#d5d6df',
                                          opacity: 0.65,
                                          cursor: 'not-allowed',
                                        }
                                      : isSelected
                                        ? {
                                            backgroundColor: '#3a0e23',
                                            borderColor: '#3a0e23',
                                            boxShadow: '0 0 0 3px rgba(58,14,35,0.12)',
                                            transform: 'scale(1.1)',
                                          }
                                        : {
                                            backgroundColor: `${CATEGORY_META[category].color}30`,
                                            borderColor: `${CATEGORY_META[category].color}A0`,
                                          }
                                  }
                                  title={`${seatLabel} · $${seat.seat_category?.price ?? 0}`}
                                >
                                  {!isTaken && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3a0e23] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-20 whitespace-nowrap">
                                      {seatLabel}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-md"
                      style={{ backgroundColor: CATEGORY_META.area1.color }}
                    />{' '}
                    {CATEGORY_META.area1.label}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-md"
                      style={{ backgroundColor: CATEGORY_META.area2.color }}
                    />{' '}
                    {CATEGORY_META.area2.label}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-md"
                      style={{ backgroundColor: CATEGORY_META.vip.color }}
                    />{' '}
                    {CATEGORY_META.vip.label}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-md"
                      style={{ backgroundColor: CATEGORY_META.handicap.color }}
                    />{' '}
                    {CATEGORY_META.handicap.label}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-[#3a0e23] shadow-sm" /> Selected
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-gray-200" /> Taken
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="md:col-span-4 relative">
            <div className="bg-white p-8 rounded-[35px] border border-white shadow-[0_25px_60px_rgba(0,0,0,0.12)] sticky top-28 transition-all hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)]">
              <h2 className="text-xl font-black mb-8 text-[#3a0e23] uppercase tracking-tighter italic">
                Your selection
              </h2>

              <div className="min-h-[120px] border-b border-gray-100 pb-8 mb-8">
                <span className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-black">
                  Selected seats:
                </span>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {selectedSeats.length > 0 ? (
                    [...selectedSeats].sort().map((seat) => (
                      <span
                        key={seat}
                        className="bg-[#f0f2f5] border border-gray-200 px-4 py-2 rounded-xl text-[11px] font-black text-[#3a0e23] shadow-sm animate-in zoom-in duration-300"
                      >
                        {seat}
                      </span>
                    ))
                  ) : (
                    <p className="text-[11px] italic text-gray-400 font-medium py-2 uppercase tracking-widest">
                      Pick your seat...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-400 uppercase tracking-[0.2em] text-[10px] font-black">
                  Total Price:
                </span>
                <span className="text-2xl font-black text-[#3a0e23] tracking-tighter italic">
                  ${currentTotalPrice}
                </span>
              </div>

              <button
                onClick={randomizeDebugSeats}
                disabled={isRedirecting || loadingSeats || !!seatError}
                className="w-full mb-3 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.18em] transition-all border-2 border-[#3a0e23]/40 text-[#3a0e23] bg-[#f5f5dc] hover:bg-[#eee4d6] disabled:opacity-50"
              >
                Randomize Seats (Debug)
              </button>

              <button
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0 || isRedirecting || loadingSeats || !!seatError}
                className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2
                  ${
                    selectedSeats.length > 0 && !isRedirecting && !loadingSeats && !seatError
                      ? 'bg-[#3a0e23] text-white hover:bg-black hover:shadow-[#3a0e23]/20'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }
                `}
              >
                {isRedirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proceed to payment'}
              </button>

              <p className="text-center text-[9px] opacity-40 uppercase font-black tracking-widest mt-6 text-gray-500 italic">
                Seats reserved for 10 min during checkout
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SeatSelection;