import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { venues } from '../data/venues';

type GridPoint = { rowIndex: number; seatIndex: number };

const HostSeatRemoval = () => {
  const navigate = useNavigate();
  const { id: venueId } = useParams();
  const { booking, updateBooking } = useBooking();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [removedSeats, setRemovedSeats] = useState<string[]>(booking.removedSeats ?? []);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<GridPoint | null>(null);
  const [dragCurrent, setDragCurrent] = useState<GridPoint | null>(null);
  const [dragAction, setDragAction] = useState<'mark' | 'unmark' | null>(null);

  const selectedVenueConfig = venues.find((venue) => venue.id === venueId && venue.type === 'seated');
  const currentLayout = selectedVenueConfig?.layout ?? { rows: [], seatsPerRow: 0 };
  const matrixWidth = Math.min(currentLayout.seatsPerRow * 42, 1040);

  const splitSeatSections = (seatsPerRow: number) => {
    const left = Math.max(2, Math.floor(seatsPerRow * 0.3));
    const right = left;
    const center = Math.max(2, seatsPerRow - left - right);
    return [left, center, right];
  };

  const getSeatId = (rowIndex: number, seatIndex: number) => {
    return `${currentLayout.rows[rowIndex]}${seatIndex + 1}`;
  };

  const seatCount = currentLayout.rows.length * currentLayout.seatsPerRow;

  const getRectangleTargets = (start: GridPoint, end: GridPoint) => {
    const minRow = Math.min(start.rowIndex, end.rowIndex);
    const maxRow = Math.max(start.rowIndex, end.rowIndex);
    const minSeat = Math.min(start.seatIndex, end.seatIndex);
    const maxSeat = Math.max(start.seatIndex, end.seatIndex);
    const targets: string[] = [];

    for (let r = minRow; r <= maxRow; r += 1) {
      for (let c = minSeat; c <= maxSeat; c += 1) {
        targets.push(getSeatId(r, c));
      }
    }

    return targets;
  };

  const applyTargets = (targets: string[], action: 'mark' | 'unmark') => {
    setSelectionError(null);
    setRemovedSeats((prev) => {
      const seatSet = new Set(prev);
      if (action === 'unmark') {
        targets.forEach((seatId) => seatSet.delete(seatId));
      } else {
        targets.forEach((seatId) => seatSet.add(seatId));
        if (seatSet.size >= seatCount && seatCount > 0) {
          setSelectionError('At least one seat must remain available. You cannot remove all seats.');
          return prev;
        }
      }
      return Array.from(seatSet);
    });
  };

  const handleDragStart = (rowIndex: number, seatIndex: number) => {
    const seatId = getSeatId(rowIndex, seatIndex);
    setIsDragging(true);
    setDragStart({ rowIndex, seatIndex });
    setDragCurrent({ rowIndex, seatIndex });
    setDragAction(removedSeats.includes(seatId) ? 'unmark' : 'mark');
  };

  const handleDragEnter = (rowIndex: number, seatIndex: number) => {
    if (!isDragging) return;
    setDragCurrent({ rowIndex, seatIndex });
  };

  const finalizeDrag = () => {
    if (!isDragging || !dragStart || !dragCurrent || !dragAction) {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      setDragAction(null);
      return;
    }

    applyTargets(getRectangleTargets(dragStart, dragCurrent), dragAction);
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
    setDragAction(null);
  };

  const previewSeatSet = useMemo(() => {
    if (!isDragging || !dragStart || !dragCurrent) return new Set<string>();
    return new Set(getRectangleTargets(dragStart, dragCurrent));
  }, [isDragging, dragStart, dragCurrent]);

  const seatSections = splitSeatSections(currentLayout.seatsPerRow);
  const canGoToPricing = removedSeats.length > 0 && removedSeats.length < seatCount;

  const handleGoToPricing = () => {
    setIsRedirecting(true);
    updateBooking({ seats: removedSeats });
    setTimeout(() => {
      navigate(`/host-dashboard/add-event/venue/${venueId}/pricing`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

      {isRedirecting && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-[#3a0e23] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffafbd]" />
            <span className="text-[11px] font-black uppercase tracking-widest">Saving seat removals...</span>
          </div>
        </div>
      )}

      <main className="max-w-[1240px] mx-auto px-6 py-10">
        <h1 className="text-5xl md:text-6xl font-black text-[#ee5164] tracking-tight mb-10 md:mb-12">
          Choosing seating in venue: {booking.selectedVenue || '[chosen]'}
        </h1>

        {!selectedVenueConfig && (
          <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-white p-8 text-[#3a0e23] font-bold">
            Seating map is not available for this venue yet.
          </section>
        )}

        {selectedVenueConfig && (

        <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-[#e7e7e7] p-8 md:p-10">
          <h2 className="text-4xl md:text-5xl font-black text-[#301326] mb-4">Mark the seats you want to remove</h2>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 text-[#b5b4c4] font-black text-3xl">
              <span className="w-6 h-6 rounded-full bg-[#ff6d8f]" />
              marked
            </div>
            <div className="text-xs uppercase tracking-[0.18em] font-black text-[#3a0e23]/70">
              Drag mouse to mark any rectangle · total seats: {seatCount}
            </div>
          </div>
          {selectionError && (
            <p className="mb-6 text-sm font-bold text-[#b81d47]">{selectionError}</p>
          )}

          <div className="w-full max-w-[440px] mx-auto h-24 border-2 border-[#ff3f7a] flex items-center justify-center mb-8 md:mb-12">
            <span className="text-5xl font-black text-[#bfc0cb] tracking-wide">STAGE</span>
          </div>

          <div className="mx-auto w-full overflow-x-auto select-none" onMouseLeave={finalizeDrag}>
            <div className="space-y-4 mx-auto" style={{ width: `${matrixWidth}px` }}>
            {currentLayout.rows.map((row, rowIndex) => (
              <div key={row} className="flex items-center gap-5 justify-center">
                <span className="text-[10px] font-black text-[#c1c2cc] w-4">{row}</span>
                <div className="flex items-center gap-8">
                  {seatSections.map((sectionCount, sectionIndex) => {
                    const sectionStart = seatSections
                      .slice(0, sectionIndex)
                      .reduce((sum, value) => sum + value, 0);

                    return (
                      <div
                        key={`${row}-section-${sectionIndex}`}
                        className="grid"
                        style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(0, 1fr))`, gap: '8px' }}
                      >
                        {Array.from({ length: sectionCount }).map((_, localIndex) => {
                          const seatIndex = sectionStart + localIndex;
                          const seatId = `${row}${seatIndex + 1}`;
                          const isRemoved = removedSeats.includes(seatId);
                          const isPreview = previewSeatSet.has(seatId);
                          const isPreviewMarked = isPreview && dragAction === 'mark';
                          const isPreviewUnmarked = isPreview && dragAction === 'unmark';

                          return (
                            <button
                              key={seatId}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleDragStart(rowIndex, seatIndex);
                              }}
                              onMouseEnter={() => handleDragEnter(rowIndex, seatIndex)}
                              onMouseUp={finalizeDrag}
                              disabled={isRedirecting}
                              className={`h-8 w-8 rounded-lg border transition ${
                                (isRemoved && !isPreviewUnmarked) || isPreviewMarked
                                  ? 'bg-[#ffedf2] border-[#ff6d8f] shadow-[0_0_0_2px_rgba(255,109,143,0.2)]'
                                  : 'bg-[#f7f7f8] border-[#d0d2db] hover:border-[#ff9fb3]'
                              }`}
                              title={seatId}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            </div>
          </div>

          <div className="flex justify-end mt-10">
            <button
              onClick={handleGoToPricing}
              disabled={isRedirecting || !canGoToPricing}
              className="rounded-full bg-[#d3265b] px-8 py-3 text-white font-black text-lg uppercase tracking-wide hover:bg-[#b81d47] transition"
            >
              GO TO PRICING
            </button>
          </div>
        </section>
        )}
      </main>
    </div>
  );
};

export default HostSeatRemoval;
