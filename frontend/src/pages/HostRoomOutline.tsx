import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { fetchHostEventById, type HostEventDto, type SeatDto } from '../api/hostEvents';

const PALETTE = ['#ff66c4', '#6dd3d9', '#a438e7', '#fbb035', '#4caf50', '#ff7043', '#29b6f6'];

const shortCategoryName = (name: string) => {
  const idx = name.indexOf(' for ');
  return idx >= 0 ? name.slice(0, idx) : name;
};

function buildCategoryColors(seats: SeatDto[]): Record<string, string> {
  const names = [...new Set(seats.map((s) => s.seat_category?.name).filter(Boolean) as string[])];
  return Object.fromEntries(names.map((name, i) => [name, PALETTE[i % PALETTE.length]]));
}

const splitSeatSections = (seatsPerRow: number) => {
  const left = Math.max(2, Math.floor(seatsPerRow * 0.3));
  const right = left;
  const center = Math.max(2, seatsPerRow - left - right);
  return [left, center, right];
};

const HostRoomOutline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HostEventDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadEvent = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!id || !currentUser?.email) {
        if (!ignore) setIsLoading(false);
        return;
      }

      try {
        const data = await fetchHostEventById(id, currentUser.email);
        if (!ignore) setEvent(data);
      } catch {
        if (!ignore) setEvent(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadEvent();
    return () => {
      ignore = true;
    };
  }, [id]);

  const seatMap = useMemo<Record<string, SeatDto>>(() => {
    if (!event) return {};
    return Object.fromEntries(event.seats.map((s) => [`${s.row}-${s.number}`, s]));
  }, [event]);

  const { rows, seatsPerRow } = useMemo(() => {
    if (!event || event.venue_rows <= 0 || event.venue_seats_per_row <= 0) {
      return { rows: [], seatsPerRow: 0 };
    }
    const rowList = Array.from({ length: event.venue_rows }, (_, i) => i + 1);
    return { rows: rowList, seatsPerRow: event.venue_seats_per_row };
  }, [event]);

  const categoryColors = useMemo(() => (event ? buildCategoryColors(event.seats) : {}), [event]);
  const isNoSeatsEvent = useMemo(() => (event ? event.seats.length === 0 : false), [event]);

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

  if (!event || rows.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] font-bold shadow-sm">
            Room outline configuration was not found for this event.
          </section>
          <button
            type="button"
            onClick={() => navigate('/host-dashboard')}
            className="mt-6 rounded-xl bg-[#3a0e23] px-6 py-4 text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition"
          >
            Back to dashboard
          </button>
        </main>
      </div>
    );
  }

  const sections = splitSeatSections(seatsPerRow);
  const matrixWidth = Math.min(seatsPerRow * 42, 1040);

  if (isNoSeatsEvent) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] shadow-sm">
            <h1 className="text-2xl font-black uppercase tracking-tight">General admission showing</h1>
            <p className="mt-3 text-sm font-medium text-[#3a0e23]/80">
              This showing has no assigned seats, so there is no room matrix to display.
            </p>
            <p className="mt-5 text-[12px] font-black uppercase tracking-[0.14em] text-[#3a0e23]/70">
              Sold: {event.soldTickets ?? 0} · Left: {event.seatsLeft}
            </p>
          </section>

          <button
            type="button"
            onClick={() => navigate(`/host-dashboard/event/${event.event}`)}
            className="mt-6 rounded-xl bg-[#3a0e23] px-6 py-4 text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition"
          >
            Back to event
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

      <main className="max-w-[1240px] mx-auto px-6 py-10">
        <h1 className="text-5xl md:text-6xl font-black text-[#ee5164] tracking-tight mb-3">
          Room outline: {event.title}
        </h1>
        <p className="text-sm uppercase tracking-[0.16em] font-black mb-10 text-[#3a0e23]/70">
          {new Date(event.time).toLocaleString()} - {event.venue_name}
        </p>

        <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-[#e7e7e7] p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-6 mb-8">
            {Object.entries(categoryColors).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#3a0e23]">
                <span className="w-4 h-4 rounded-md" style={{ backgroundColor: color }} />
                {shortCategoryName(name)}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#3a0e23]">
              <span className="w-4 h-4 rounded-md bg-[#3a0e23]" />
              Purchased
            </div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#3a0e23]">
              <span className="w-4 h-4 rounded-md border border-dashed border-[#9ea0ab]" />
              Removed
            </div>
          </div>

          <div className="w-full max-w-[440px] mx-auto h-24 border-2 border-[#ff3f7a] flex items-center justify-center mb-8 md:mb-12">
            <span className="text-5xl font-black text-[#bfc0cb] tracking-wide">STAGE</span>
          </div>

          <div className="mx-auto w-full overflow-x-auto select-none">
            <div className="space-y-4 mx-auto" style={{ width: `${matrixWidth}px` }}>
              {rows.map((row) => (
                <div key={row} className="flex items-center gap-5 justify-center">
                  <span className="text-[10px] font-black text-[#c1c2cc] w-4">{row}</span>
                  <div className="flex items-center gap-8">
                    {sections.map((sectionCount, sectionIndex) => {
                      const sectionStart = sections.slice(0, sectionIndex).reduce((sum, v) => sum + v, 0);
                      return (
                        <div
                          key={`${row}-section-${sectionIndex}`}
                          className="grid"
                          style={{ gridTemplateColumns: `repeat(${sectionCount}, 32px)`, gap: '8px' }}
                        >
                          {Array.from({ length: sectionCount }).map((_, localIndex) => {
                            const seatNumber = sectionStart + localIndex + 1;
                            const seat = seatMap[`${row}-${seatNumber}`];

                            if (!seat || !seat.if_exist) {
                              return (
                                <div
                                  key={`${row}-${seatNumber}`}
                                  className="h-8 w-8 border border-dashed border-[#b9bac5] rounded-lg bg-transparent"
                                  title={`Row ${row} Seat ${seatNumber} - removed`}
                                />
                              );
                            }

                            const categoryName = seat.seat_category?.name;
                            const color = categoryName ? categoryColors[categoryName] : undefined;

                            if (seat.is_reserved) {
                              return (
                                <div
                                  key={`${row}-${seatNumber}`}
                                  className="h-8 w-8 rounded-lg bg-[#3a0e23]"
                                  title={`Row ${row} Seat ${seatNumber} - purchased (${categoryName ?? 'uncategorised'})`}
                                />
                              );
                            }

                            return (
                              <div
                                key={`${row}-${seatNumber}`}
                                className="h-8 w-8 rounded-lg border border-[#c1c2cc]"
                                style={
                                  color
                                    ? {
                                        backgroundColor: `${color}33`,
                                        borderColor: color,
                                        boxShadow: `0 0 0 2px ${color}55`,
                                      }
                                    : undefined
                                }
                                title={`Row ${row} Seat ${seatNumber}${categoryName ? ` (${shortCategoryName(categoryName)})` : ''}`}
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
              onClick={() => navigate(`/host-dashboard/event/${event.event}`)}
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
