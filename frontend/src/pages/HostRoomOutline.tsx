import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { venues } from '../data/venues';
import { fetchHostEventById, type HostEventDto } from '../api/hostEvents';
import { useTheme } from '../context/ThemeContext';

type HostCategory = 'vip' | 'area1' | 'area2' | 'handicap';

const CATEGORY_META: Record<HostCategory, { label: string; color: string }> = {
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

const HostRoomOutline = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [event, setEvent] = useState<HostEventDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadEvent = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!id || !currentUser?.email) return;

      try {
        const data = await fetchHostEventById(id, currentUser.email);
        if (!ignore) {
          setEvent(data);
        }
      } catch {
        if (!ignore) {
          setEvent(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadEvent();
    return () => {
      ignore = true;
    };
  }, [id]);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.name === event?.venue && venue.type === 'seated') || null,
    [event?.venue],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] font-bold shadow-sm">
            Loading room outline...
          </section>
        </main>
      </div>
    );
  }

  if (!event || !selectedVenue) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] font-bold shadow-sm">
            Room outline configuration was not found for this event.
          </section>
          <button
            type="button"
            onClick={() => navigate(`/host-dashboard/event/${id}`)}
            className="mt-6 rounded-xl bg-[#3a0e23] px-6 py-4 text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition"
          >
            Back to Event
          </button>
        </main>
      </div>
    );
  }

  const removedSeats = new Set(event.removedSeats);
  const sections = splitSeatSections(selectedVenue.layout.seatsPerRow);
  const matrixWidth = Math.min(selectedVenue.layout.seatsPerRow * 42, 1040);
  const sessionLabel = searchParams.get('session') || 'Selected session';

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

      <main className="max-w-[1240px] mx-auto px-6 py-10">
        <h1 className="text-5xl md:text-6xl font-black text-[#ee5164] tracking-tight mb-3">
          Room outline: {event.title}
        </h1>
        <p className={`text-sm uppercase tracking-[0.16em] font-black mb-10 ${isDark ? 'text-white' : 'text-[#3a0e23]/70'}`}>
          {sessionLabel} · {event.venue}
        </p>

        <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-[#e7e7e7] p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-6 mb-8">
            {(Object.keys(CATEGORY_META) as HostCategory[]).map((category) => (
              <div key={category} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#3a0e23]">
                <span className="w-4 h-4 rounded-md" style={{ backgroundColor: CATEGORY_META[category].color }} />
                {CATEGORY_META[category].label}: ${event.prices[category]}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#3a0e23]">
              <span className="w-4 h-4 rounded-md border border-dashed border-[#9ea0ab]" />
              Deleted seat
            </div>
          </div>

          <div className="w-full max-w-[440px] mx-auto h-24 border-2 border-[#ff3f7a] flex items-center justify-center mb-8 md:mb-12">
            <span className="text-5xl font-black text-[#bfc0cb] tracking-wide">STAGE</span>
          </div>

          <div className="mx-auto w-full overflow-x-auto select-none">
            <div className="space-y-4 mx-auto" style={{ width: `${matrixWidth}px` }}>
              {selectedVenue.layout.rows.map((row) => (
                <div key={row} className="flex items-center gap-5 justify-center">
                  <span className="text-[10px] font-black text-[#c1c2cc] w-4">
                    {Array.from({ length: selectedVenue.layout.seatsPerRow }).some((_, seatIndex) => !removedSeats.has(`${row}${seatIndex + 1}`)) ? row : ''}
                  </span>
                  <div className="flex items-center gap-8">
                    {sections.map((sectionCount, sectionIndex) => {
                      const sectionStart = sections.slice(0, sectionIndex).reduce((sum, value) => sum + value, 0);
                      return (
                        <div
                          key={`${row}-section-${sectionIndex}`}
                          className="grid"
                          style={{ gridTemplateColumns: `repeat(${sectionCount}, minmax(0, 1fr))`, gap: '8px' }}
                        >
                          {Array.from({ length: sectionCount }).map((_, localIndex) => {
                            const seatIndex = sectionStart + localIndex;
                            const seatId = `${row}${seatIndex + 1}`;
                            if (removedSeats.has(seatId)) {
                              return (
                                <div
                                  key={seatId}
                                  className="h-8 w-8 border border-dashed border-[#b9bac5] rounded-lg bg-transparent"
                                  title={`${seatId} removed`}
                                />
                              );
                            }

                            const category = event.seatAssignments[seatId];
                            return (
                              <div
                                key={seatId}
                                className="h-8 w-8 rounded-lg border border-[#c1c2cc]"
                                style={
                                  category
                                    ? {
                                        backgroundColor: `${CATEGORY_META[category].color}22`,
                                        borderColor: CATEGORY_META[category].color,
                                        boxShadow: `0 0 0 2px ${CATEGORY_META[category].color}44`,
                                      }
                                    : undefined
                                }
                                title={`${seatId} ${category ? `(${CATEGORY_META[category].label})` : ''}`}
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
              type="button"
              onClick={() => navigate(`/host-dashboard/event/${id}`)}
              className="rounded-full bg-[#3a0e23] px-8 py-3 text-white font-black text-lg uppercase tracking-wide hover:bg-black transition"
            >
              BACK TO EVENT
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HostRoomOutline;
