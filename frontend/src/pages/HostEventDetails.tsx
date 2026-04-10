import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Film, MapPin, Ticket } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { mockEvents } from '../data/mockEvents';

type SessionRow = {
  id: string;
  label: string;
  unsoldSeats: number;
  roomLabel: string;
  totalSeats: number;
};

const DEFAULT_DESCRIPTION =
  'Enter a world of splendour and romance, of eye-popping excess, and unforgettable stage energy. ' +
  'Hosts can monitor each session, track unsold seats, and quickly check room-level capacity before launch.';

const buildHostSessions = (eventId: string, seatsLeft: number): SessionRow[] => {
  const baseSessions: Record<string, string[]> = {
    '1': ['Sat 22 Mar, 7PM - 10PM', 'Sun 23 Mar, 2PM - 5PM', 'Sun 23 Mar, 7PM - 10PM'],
    '2': ['Thu 27 Mar, 6PM - 9PM', 'Fri 28 Mar, 6PM - 9PM', 'Sat 29 Mar, 6PM - 9PM'],
    '3': ['Mon 24 Mar, 9AM - 11AM', 'Tue 25 Mar, 9AM - 11AM', 'Wed 26 Mar, 9AM - 11AM'],
  };

  const labels = baseSessions[eventId] ?? ['Sat 22 Mar, 7PM - 10PM', 'Sun 23 Mar, 2PM - 5PM', 'Sun 23 Mar, 7PM - 10PM'];
  const totalSeats = Math.max(40, seatsLeft + 40);

  return labels.map((label, idx) => {
    const spread = Math.max(0, seatsLeft - idx * 2);
    return {
      id: `${eventId}-${idx}`,
      label,
      unsoldSeats: spread,
      roomLabel: idx === 0 ? 'Hall C' : idx === 1 ? 'Hall B' : 'Hall A',
      totalSeats,
    };
  });
};

const HostEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [posterOrientation, setPosterOrientation] = useState<'portrait' | 'landscape' | 'square'>('portrait');

  const event = mockEvents.find((item) => item.id === id);

  const sessions = useMemo(() => {
    if (!event) return [];
    return buildHostSessions(event.id, event.seatsLeft ?? 0);
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a] animate-in fade-in duration-700 relative">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] font-bold shadow-sm">
            Event was not found.
          </section>
          <button
            type="button"
            onClick={() => navigate('/host-dashboard')}
            className="mt-6 rounded-xl bg-[#3a0e23] px-6 py-4 text-white text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black transition"
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const typeChipColor =
    event.type === 'Cinema' ? 'bg-[#24839a]' : event.type === 'Theatre' ? 'bg-[#8b4ec5]' : 'bg-[#1f7b88]';

  const posterFrameClass =
    posterOrientation === 'landscape'
      ? 'w-[300px] h-[170px]'
      : posterOrientation === 'square'
        ? 'w-[210px] h-[210px]'
        : 'w-[160px] h-[230px]';

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a] animate-in fade-in duration-700 relative">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

      <div className="relative h-[260px] bg-gradient-to-r from-[#ffafbd] via-[#ffbcc7] to-[#fcfbff] border-b border-[#f0bcc7]">
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center gap-10 relative">
          <div className={`relative ${posterFrameClass} flex-shrink-0 z-20 shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group`}>
            <img
              src={event.imageUrl}
              alt={event.title}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                if (!naturalWidth || !naturalHeight) return;
                const ratio = naturalWidth / naturalHeight;
                if (ratio > 1.15) {
                  setPosterOrientation('landscape');
                } else if (ratio < 0.9) {
                  setPosterOrientation('portrait');
                } else {
                  setPosterOrientation('square');
                }
              }}
              className="w-full h-full object-cover rounded-xl border-[4px] border-white transition-all group-hover:border-[#ffafbd]"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight uppercase">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              <span className={`${typeChipColor} text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md`}>
                {event.type}
              </span>
              <span className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md">2h 38min</span>
              <span className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md">Host View</span>
            </div>
            <p className="text-sm text-white/90 font-bold uppercase tracking-[0.15em]">
              {event.venue} · Hall C
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-8 py-12 flex flex-col md:grid md:grid-cols-12 gap-12">
        <article className="md:col-span-5 space-y-12">
          <p className="text-[14px] text-gray-700 leading-relaxed font-medium opacity-80 max-w-3xl border-l-4 border-[#ff3366] pl-6 py-1">
            {DEFAULT_DESCRIPTION}
          </p>
        </article>

        <aside className="md:col-span-7 relative">
          <div className="bg-[#e7e6f0] p-7 rounded-[30px] border border-gray-200/50 shadow-sm sticky top-28 transition-all hover:shadow-xl">
          <h2 className="text-lg font-black mb-7 text-[#3a0e23] uppercase tracking-tighter italic">Dates and tickets</h2>
          <div className="space-y-4">
            {sessions.map((session) => {
              const occupancy = Math.round(((session.totalSeats - session.unsoldSeats) / session.totalSeats) * 100);
              const isOpen = activeSessionId === session.id;

              return (
                <div key={session.id} className="rounded-2xl bg-white p-4 border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 gap-3">
                    <span className="bg-[#2d6a7a] text-white px-4 py-3 rounded-xl font-black text-[12px] uppercase tracking-[0.12em] text-center">
                      {session.label}
                    </span>
                    <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-[#3a0e23] uppercase tracking-[0.08em]">{session.unsoldSeats} unsold tickets</span>
                    <button
                      type="button"
                      onClick={() => setActiveSessionId(isOpen ? null : session.id)}
                      className="text-[11px] font-black uppercase tracking-[0.14em] text-[#3a0e23] underline decoration-[#3a0e23]/40 underline-offset-4"
                    >
                      {isOpen ? 'Hide room' : 'See details'}
                    </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-[#fcfbff] px-4 py-4 text-[#2b2237]">
                      <div className="space-y-2 text-[11px] font-black uppercase tracking-[0.1em] text-gray-600">
                        <p className="inline-flex items-center gap-2"><MapPin size={14} /> {session.roomLabel}</p>
                        <p className="inline-flex items-center gap-2"><Ticket size={14} /> {session.unsoldSeats} unsold / {session.totalSeats}</p>
                        <p className="inline-flex items-center gap-2"><Film size={14} /> {occupancy}% sold</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => navigate('/host-dashboard')}
              className="w-full py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl bg-[#3a0e23] text-white hover:bg-black active:scale-95"
            >
              Back to dashboard
            </button>
          </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default HostEventDetails;
