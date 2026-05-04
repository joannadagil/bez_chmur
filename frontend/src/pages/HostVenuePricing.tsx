import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useBooking } from '../context/BookingContext';
import { venues } from '../data/venues';
import { createHostEvent, fetchHostEvents } from '../api/hostEvents';

const toMinutes = (timeValue: string) => {
  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
};

type Category = 'vip' | 'area1' | 'area2' | 'handicap';
type GridPoint = { rowIndex: number; seatIndex: number };

type PriceState = {
  vip: string;
  area1: string;
  area2: string;
  handicap: string;
};

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  vip: { label: 'VIP', color: '#ff66c4' },
  area1: { label: 'AREA 1 ROWS', color: '#6dd3d9' },
  area2: { label: 'AREA 2 ROWS', color: '#a438e7' },
  handicap: { label: 'HANDICAP / ENTRY', color: '#fbb035' },
};

const HostVenuePricing = () => {
  const navigate = useNavigate();
  const { id: venueId } = useParams();
  const { booking } = useBooking();

  const [selectedCategory, setSelectedCategory] = useState<Category>('area1');
  const [seatAssignments, setSeatAssignments] = useState<Record<string, Category>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<GridPoint | null>(null);
  const [dragCurrent, setDragCurrent] = useState<GridPoint | null>(null);
  const [prices, setPrices] = useState<PriceState>({ vip: '', area1: '', area2: '', handicap: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [existingHostEvents, setExistingHostEvents] = useState<any[]>([]);

  const selectedVenue = venues.find((venue) => venue.id === venueId && venue.type === 'seated');
  const layout = selectedVenue?.layout ?? { rows: [], seatsPerRow: 0 };
  const removedSeats = new Set(booking.removedSeats ?? []);

  useEffect(() => {
    let ignore = false;

    const loadHostEvents = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser?.email) return;

      try {
        const data = await fetchHostEvents(currentUser.email);
        if (!ignore) {
          setExistingHostEvents(data);
        }
      } catch {
        if (!ignore) {
          setExistingHostEvents([]);
        }
      }
    };

    loadHostEvents();
    return () => {
      ignore = true;
    };
  }, []);

  const splitSeatSections = (seatsPerRow: number) => {
    const left = Math.max(2, Math.floor(seatsPerRow * 0.3));
    const right = left;
    const center = Math.max(2, seatsPerRow - left - right);
    return [left, center, right];
  };

  const seatSections = splitSeatSections(layout.seatsPerRow);
  const matrixWidth = Math.min(layout.seatsPerRow * 42, 1040);

  const getSeatId = (rowIndex: number, seatIndex: number) => `${layout.rows[rowIndex]}${seatIndex + 1}`;

  const getRectangleTargets = (start: GridPoint, end: GridPoint) => {
    const minRow = Math.min(start.rowIndex, end.rowIndex);
    const maxRow = Math.max(start.rowIndex, end.rowIndex);
    const minSeat = Math.min(start.seatIndex, end.seatIndex);
    const maxSeat = Math.max(start.seatIndex, end.seatIndex);
    const targets: string[] = [];

    for (let r = minRow; r <= maxRow; r += 1) {
      for (let c = minSeat; c <= maxSeat; c += 1) {
        const seatId = getSeatId(r, c);
        if (!removedSeats.has(seatId)) {
          targets.push(seatId);
        }
      }
    }

    return targets;
  };

  const applyTargets = (targets: string[]) => {
    if (!canApplyTargets(targets, selectedCategory)) {
      setErrors([`Cannot mark ${CATEGORY_META[selectedCategory].label} in those rows for ${booking.eventCategory}.`]);
      return;
    }
    setSeatAssignments((prev) => {
      const next = { ...prev };
      targets.forEach((seatId) => {
        next[seatId] = selectedCategory;
      });
      return next;
    });
    setErrors([]);
  };

  const handleDragStart = (rowIndex: number, seatIndex: number) => {
    const seatId = getSeatId(rowIndex, seatIndex);
    if (removedSeats.has(seatId)) return;
    setIsDragging(true);
    setDragStart({ rowIndex, seatIndex });
    setDragCurrent({ rowIndex, seatIndex });
  };

  const handleDragEnter = (rowIndex: number, seatIndex: number) => {
    if (!isDragging) return;
    setDragCurrent({ rowIndex, seatIndex });
  };

  const finalizeDrag = () => {
    if (!isDragging || !dragStart || !dragCurrent) {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    applyTargets(getRectangleTargets(dragStart, dragCurrent));
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const previewSeatSet = useMemo(() => {
    if (!isDragging || !dragStart || !dragCurrent) return new Set<string>();
    return new Set(getRectangleTargets(dragStart, dragCurrent));
  }, [isDragging, dragStart, dragCurrent]);

  const getInvalidRowsForCategory = (category: Category): number[] => {
    if (!layout.rows.length) return [];
    const totalRows = layout.rows.length;
    const firstQuarterEnd = Math.max(0, Math.ceil(totalRows * 0.25) - 1);
    const thirdCut = Math.ceil(totalRows * 0.33);

    if (booking.eventCategory.toLowerCase() === 'cinema') {
      if (category === 'vip' || category === 'area2') {
        return Array.from({ length: firstQuarterEnd + 1 }, (_, i) => i);
      }
      if (category === 'area1' || category === 'handicap') {
        return Array.from({ length: totalRows - firstQuarterEnd - 1 }, (_, i) => i + firstQuarterEnd + 1);
      }
    } else if (booking.eventCategory.toLowerCase() === 'theatre') {
      if (category === 'area2') {
        return Array.from({ length: thirdCut }, (_, i) => i);
      }
      if (category === 'vip' || category === 'area1') {
        return Array.from({ length: totalRows - thirdCut }, (_, i) => i + thirdCut);
      }
    }
    return [];
  };

  const isSeatAllowed = (rowIndex: number, category: Category): boolean => {
    const invalidRows = getInvalidRowsForCategory(category);
    return !invalidRows.includes(rowIndex);
  };

  const canApplyTargets = (targets: string[], category: Category): boolean => {
    return targets.every((seatId) => {
      const rowLabel = seatId.match(/^[A-Z]+/)?.[0];
      const rowIndex = rowLabel ? layout.rows.indexOf(rowLabel) : -1;
      return rowIndex >= 0 && isSeatAllowed(rowIndex, category);
    });
  };

  const seatRowsByCategory = useMemo(() => {
    const rows: Record<Category, number[]> = { vip: [], area1: [], area2: [], handicap: [] };

    Object.entries(seatAssignments).forEach(([seatId, category]) => {
      const rowLabel = seatId.match(/^[A-Z]+/)?.[0];
      const rowIndex = rowLabel ? layout.rows.indexOf(rowLabel) : -1;
      if (rowIndex >= 0) {
        rows[category].push(rowIndex);
      }
    });

    return rows;
  }, [seatAssignments, layout.rows]);

  const parsePrice = (value: string) => Number(value);

  const validatePricingRules = () => {
    const validationErrors: string[] = [];
    const totalRows = layout.rows.length;

    const assignedCount = Object.keys(seatAssignments).length;
    if (assignedCount === 0) {
      validationErrors.push('Pick at least one category by assigning seats on the matrix.');
    }

    const assignedCategories = new Set(Object.values(seatAssignments));
    assignedCategories.forEach((category) => {
      const price = prices[category as Category];
      if (!price || Number.isNaN(Number(price)) || Number(price) < 0) {
        validationErrors.push(`${CATEGORY_META[category as Category].label} has no valid price set.`);
      }
    });

    const vipPrice = parsePrice(prices.vip);
    const area1Price = parsePrice(prices.area1);
    const area2Price = parsePrice(prices.area2);
    const handicapPrice = parsePrice(prices.handicap);

    if ([vipPrice, area1Price, area2Price, handicapPrice].some((price) => Number.isNaN(price) || price < 0)) {
      // This was already handled by the per-category check, so skip duplicate error
    }

    if (!Number.isNaN(vipPrice) && !Number.isNaN(area1Price) && !Number.isNaN(area2Price) && !Number.isNaN(handicapPrice)) {
      if (seatRowsByCategory.vip.length > 0 && (seatRowsByCategory.area1.length > 0 || seatRowsByCategory.area2.length > 0 || seatRowsByCategory.handicap.length > 0)) {
        if (!(vipPrice > area1Price && vipPrice > area2Price && vipPrice > handicapPrice)) {
          validationErrors.push('VIP must be the most expensive category.');
        }
      }

      if (seatRowsByCategory.handicap.length > 0 && (seatRowsByCategory.area1.length > 0 || seatRowsByCategory.area2.length > 0 || seatRowsByCategory.vip.length > 0)) {
        if (!(handicapPrice < area1Price && handicapPrice < area2Price && handicapPrice < vipPrice)) {
          validationErrors.push('Handicap/Entry seats must have the lowest price.');
        }
      }
    }

    if (seatRowsByCategory.area1.length > 0 && seatRowsByCategory.area2.length > 0) {
      const maxArea1Row = Math.max(...seatRowsByCategory.area1);
      const minArea2Row = Math.min(...seatRowsByCategory.area2);
      if (minArea2Row < maxArea1Row) {
        validationErrors.push('Sphere/Area 2 cannot be closer to the stage than Sphere/Area 1.');
      }
    }

    const firstQuarterEnd = Math.max(0, Math.ceil(totalRows * 0.25) - 1);
    const thirdCut = Math.ceil(totalRows * 0.33);

    if (booking.eventCategory.toLowerCase() === 'cinema') {
      // Cinema: first 25% are cheapest
      if (seatRowsByCategory.area1.some((rowIndex) => rowIndex > firstQuarterEnd) ||
          seatRowsByCategory.handicap.some((rowIndex) => rowIndex > firstQuarterEnd)) {
        validationErrors.push('For cinema, Area 1 and Handicap (cheapest zones) must stay within the first 25% of rows.');
      }
      if (seatRowsByCategory.area2.some((rowIndex) => rowIndex <= firstQuarterEnd) ||
          seatRowsByCategory.vip.some((rowIndex) => rowIndex <= firstQuarterEnd)) {
        validationErrors.push('For cinema, Area 2 and VIP must be in rows beyond the first 25%.');
      }
      if (!Number.isNaN(area1Price) && !Number.isNaN(area2Price) && seatRowsByCategory.area1.length > 0 && seatRowsByCategory.area2.length > 0 && !(area1Price < area2Price)) {
        validationErrors.push('For cinema, first 25% rows (Area 1) must be cheaper than rows beyond.');
      }
    }

    if (booking.eventCategory.toLowerCase() === 'theatre') {
      // Theatre: first 33% are expensive (closer to stage), rows 33%+ are cheaper (back seats)
      if (seatRowsByCategory.area2.some((rowIndex) => rowIndex < thirdCut)) {
        validationErrors.push('For theatre, Area 2 (back seats) must start from row 33% onwards.');
      }
      if (seatRowsByCategory.vip.some((rowIndex) => rowIndex >= thirdCut) ||
          seatRowsByCategory.area1.some((rowIndex) => rowIndex >= thirdCut)) {
        validationErrors.push('For theatre, VIP and Area 1 (closer to stage) must stay within the first 33% of rows.');
      }
      if (!Number.isNaN(area1Price) && !Number.isNaN(area2Price) && seatRowsByCategory.area1.length > 0 && seatRowsByCategory.area2.length > 0 && !(area1Price > area2Price)) {
        validationErrors.push('For theatre, rows closer to stage (Area 1) must be more expensive than back seats (Area 2).');
      }
    }

    const handicapSeats = Object.entries(seatAssignments).filter(([, category]) => category === 'handicap').map(([seatId]) => seatId);

    handicapSeats.forEach((seatId) => {
      const rowLabel = seatId.match(/^[A-Z]+/)?.[0];
      const seatNumber = Number(seatId.match(/\d+$/)?.[0] ?? 0);
      const rowIndex = rowLabel ? layout.rows.indexOf(rowLabel) : -1;
      const seatIndex = seatNumber - 1;

      const isFirstRow = rowIndex === 0;
      const isEdge = seatIndex === 0 || seatIndex === layout.seatsPerRow - 1;
      const leftSeat = `${rowLabel}${seatNumber - 1}`;
      const rightSeat = `${rowLabel}${seatNumber + 1}`;
      const hasEmptyAdjacent = removedSeats.has(leftSeat) || removedSeats.has(rightSeat);

      if (!(isFirstRow || isEdge || hasEmptyAdjacent)) {
        validationErrors.push('Handicap seats must be in first row, on row edges, or next to an empty space.');
      }
    });

    return validationErrors;
  };

  const handleCreateEvent = async () => {
    if (!selectedVenue) return;

    const validationErrors = validatePricingRules();
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    const currentSchedule = booking.showSchedule || [];
    const existingInVenue = existingHostEvents.filter(
      (event) => event.venue === selectedVenue.name && event.schedule && event.schedule.length > 0,
    );

    for (const day of currentSchedule) {
      const newTimes = [...day.times].sort((a, b) => toMinutes(a) - toMinutes(b));
      for (const event of existingInVenue) {
        const existingDay = event.schedule?.find((sessionDay: any) => sessionDay.date === day.date);
        if (!existingDay) continue;
        for (const newTime of newTimes) {
          for (const existingTime of existingDay.times) {
            const diff = Math.abs(toMinutes(newTime) - toMinutes(existingTime));
            if (diff < 60) {
              setErrors([
                `Show ${newTime} on ${day.date} conflicts with another show in ${selectedVenue.name}. Keep at least 1 hour gap between shows in one venue.`,
              ]);
              return;
            }
          }
        }
      }
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.email) {
      setErrors(['You need to be logged in as host to create this event.']);
      return;
    }

    const eventType =
      booking.eventCategory.toLowerCase() === 'theatre'
        ? 'Theatre'
        : booking.eventCategory.toLowerCase() === 'lecture hall'
          ? 'Lecture'
          : 'Cinema';

    try {
      const firstDay = booking.showSchedule?.[0];
      const firstTime = firstDay?.times?.[0] || '19:00';
      const eventDate = booking.date;
      const eventDateTime = `${eventDate}T${firstTime}:00`;

      const created = await createHostEvent({
        event_name: booking.eventTitle,
        event_description: booking.eventTitle,
        category: eventType,
        event_image_url: booking.eventImageUrl || '',
        venue_name: selectedVenue.name,
        venue_rows: layout.rows.length,
        venue_seats_per_row: layout.seatsPerRow,
        time: eventDateTime,
        prices: prices,           
        seatAssignments: seatAssignments,
      });

      navigate(`/host-dashboard/event/${created.id}`);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Could not save this event to backend. Please try again.']);
    }
  };

  const randomizeDebugPricing = () => {
    if (!layout.rows.length || layout.seatsPerRow <= 0) return;

    const totalRows = layout.rows.length;
    const firstQuarterEnd = Math.max(0, Math.ceil(totalRows * 0.25) - 1);
    const thirdCut = Math.ceil(totalRows * 0.33);
    const nextAssignments: Record<string, Category> = {};

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
      for (let seatIndex = 0; seatIndex < layout.seatsPerRow; seatIndex += 1) {
        const seatId = `${layout.rows[rowIndex]}${seatIndex + 1}`;
        if (removedSeats.has(seatId)) continue;

        const isEdge = seatIndex === 0 || seatIndex === layout.seatsPerRow - 1;
        let category: Category;

        if (booking.eventCategory.toLowerCase() === 'cinema') {
          if (rowIndex <= firstQuarterEnd) {
            category = rowIndex === 0 && isEdge ? 'handicap' : 'area1';
          } else if (rowIndex >= Math.floor(totalRows * 0.68)) {
            category = 'vip';
          } else {
            category = 'area2';
          }
        } else if (booking.eventCategory.toLowerCase() === 'theatre') {
          if (rowIndex < thirdCut) {
            category = rowIndex === 0 && isEdge ? 'handicap' : rowIndex % 2 === 0 ? 'vip' : 'area1';
          } else {
            category = 'area2';
          }
        } else {
          if (rowIndex === 0 && isEdge) {
            category = 'handicap';
          } else if (rowIndex >= Math.floor(totalRows * 0.7)) {
            category = 'vip';
          } else if (rowIndex >= Math.floor(totalRows * 0.35)) {
            category = 'area2';
          } else {
            category = 'area1';
          }
        }

        nextAssignments[seatId] = category;
      }
    }

    const pricingPreset: PriceState =
      booking.eventCategory.toLowerCase() === 'cinema'
        ? { vip: '12', area1: '6', area2: '9', handicap: '4' }
        : booking.eventCategory.toLowerCase() === 'theatre'
          ? { vip: '13', area1: '10', area2: '7', handicap: '5' }
          : { vip: '12', area1: '8', area2: '10', handicap: '5' };

    setSeatAssignments(nextAssignments);
    setPrices(pricingPreset);
    setErrors([]);
  };

  if (!selectedVenue) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1240px] mx-auto px-6 py-10">
          <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-white p-8 text-[#3a0e23] font-bold">
            Seating map is not available for this venue yet.
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

      <main className="max-w-[1240px] mx-auto px-6 py-10">
        <h1 className="text-5xl md:text-6xl font-black text-[#ee5164] tracking-tight mb-10 md:mb-12">
          Choosing seating in venue: {booking.selectedVenue || '[chosen]'}
        </h1>

        <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-[#e7e7e7] p-8 md:p-10" style={{ fontFamily: '"TT Firs Neue", sans-serif' }}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-[#301326] mb-4">Mark the seats by category</h2>
              <div className="space-y-2">
                {(Object.keys(CATEGORY_META) as Category[]).map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-3 text-2xl font-black transition ${
                        isActive ? 'opacity-100 scale-[1.08]' : 'opacity-50'
                      }`}
                      style={{
                        color: CATEGORY_META[category].color,
                        filter: isActive ? 'brightness(1.1) saturate(1.2)' : 'saturate(0.7) brightness(0.92)',
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-full transition"
                        style={{
                          backgroundColor: CATEGORY_META[category].color,
                          filter: isActive ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'saturate(0.7)',
                        }}
                      />
                      {CATEGORY_META[category].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full max-w-[290px]">
              <p className="text-5xl text-[#301326] mb-4">Pricing</p>
              <div className="space-y-2">
                {(Object.keys(CATEGORY_META) as Category[]).map((category) => (
                  <div key={`price-${category}`} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full transition"
                      style={{
                        backgroundColor: CATEGORY_META[category].color,
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prices[category]}
                      onChange={(event) => setPrices((prev) => ({ ...prev, [category]: event.target.value }))}
                      placeholder="Enter price"
                      className="w-full border-2 border-[#4a3142] bg-[#e7e7e7] px-3 py-1 text-3xl text-[#4a3142] placeholder:text-[#8f8f95]"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={randomizeDebugPricing}
                className="mt-4 w-full rounded-full border-2 border-[#4a3142]/40 bg-[#f5f5dc] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#301326] hover:bg-[#efe6d8] transition"
              >
                RANDOMIZE PRICING (DEBUG)
              </button>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 rounded-xl border border-[#d3265b]/40 bg-white px-4 py-3 text-[#8f1c3f]">
              {errors.map((error) => (
                <p key={error} className="text-sm font-semibold">{error}</p>
              ))}
            </div>
          )}

          <div className="w-full max-w-[440px] mx-auto h-24 border-2 border-[#ff3f7a] flex items-center justify-center mb-8 md:mb-12">
            <span className="text-5xl font-black text-[#bfc0cb] tracking-wide">STAGE</span>
          </div>

          <div className="mx-auto w-full overflow-x-auto select-none" onMouseLeave={finalizeDrag}>
            <div className="space-y-4 mx-auto" style={{ width: `${matrixWidth}px` }}>
              {layout.rows.map((row, rowIndex) => (
                <div key={row} className="flex items-center gap-5 justify-center">
                  <span className="text-[10px] font-black text-[#c1c2cc] w-4">
                    {Array.from({ length: layout.seatsPerRow }).some((_, seatIndex) => !removedSeats.has(`${row}${seatIndex + 1}`)) ? row : ''}
                  </span>
                  <div className="flex items-center gap-8">
                    {seatSections.map((sectionCount, sectionIndex) => {
                      const sectionStart = seatSections.slice(0, sectionIndex).reduce((sum, value) => sum + value, 0);

                      return (
                        <div
                          key={`${row}-section-${sectionIndex}`}
                          className="grid"
                          style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(0, 1fr))`, gap: '8px' }}
                        >
                          {Array.from({ length: sectionCount }).map((_, localIndex) => {
                            const seatIndex = sectionStart + localIndex;
                            const seatId = `${row}${seatIndex + 1}`;
                            const isRemoved = removedSeats.has(seatId);
                            if (isRemoved) return <div key={seatId} className="h-8 w-8" title={`${seatId} removed`} />;
                            
                            const assignedCategory = seatAssignments[seatId];
                            const isPreview = previewSeatSet.has(seatId);
                            const previewCategory = isPreview ? selectedCategory : assignedCategory;

                            return (
                              <button
                                key={seatId}
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleDragStart(rowIndex, seatIndex);
                                }}
                                onMouseEnter={() => handleDragEnter(rowIndex, seatIndex)}
                                onMouseUp={finalizeDrag}
                                className="h-8 w-8 rounded-lg border transition border-[#c1c2cc]"
                                style={
                                  previewCategory
                                    ? {
                                        backgroundColor: `${CATEGORY_META[previewCategory].color}22`,
                                        borderColor: CATEGORY_META[previewCategory].color,
                                        boxShadow: `0 0 0 2px ${CATEGORY_META[previewCategory].color}44`,
                                      }
                                    : undefined
                                }
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
              onClick={handleCreateEvent}
              className="rounded-full bg-[#d3265b] px-8 py-3 text-white font-black text-lg uppercase tracking-wide hover:bg-[#b81d47] transition"
            >
              CREATE EVENT
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HostVenuePricing;
