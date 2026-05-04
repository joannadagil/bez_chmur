import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { fetchHostEventShowings, type HostEventDto } from '../api/hostEvents';

const HostEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventGroup, setEventGroup] = useState<HostEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadEventGroup = async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!id || !currentUser?.email) {
        if (!ignore) setIsLoading(false);
        return;
      }

      try {
        const data = await fetchHostEventShowings(id, currentUser.email);
        const group = data
          .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        if (!ignore) {
          setEventGroup(group);
        }
      } catch {
        if (!ignore) {
          setEventGroup([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadEventGroup();
    return () => {
      ignore = true;
    };
  }, [id]);

  const mainEvent = useMemo(() => eventGroup[0] ?? null, [eventGroup]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] font-bold shadow-sm">
            Loading event details...
          </section>
        </main>
      </div>
    );
  }

  if (!mainEvent) {
    return (
      <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1100px] mx-auto px-8 py-12">
          <section className="rounded-2xl border border-gray-100 bg-white p-8 text-[#3a0e23] font-bold shadow-sm">
            Event was not found or has no upcoming showings.
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

  const typeChipColor =
    mainEvent.type === 'Cinema' ? 'bg-[#24839a]' : mainEvent.type === 'Theatre' ? 'bg-[#8b4ec5]' : 'bg-[#1f7b88]';

  return (
    <div className="min-h-screen bg-[#fcfbff] font-sans text-[#1a0b1a]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

      <div className="relative h-[260px] bg-gradient-to-r from-[#ffafbd] via-[#ffbcc7] to-[#fcfbff] border-b border-[#f0bcc7]">
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center gap-10 relative">
          <div className="relative w-[170px] h-[240px] flex-shrink-0 z-20 shadow-2xl transition-all duration-500 hover:scale-105">
            <img
              src={mainEvent.image_url ?? undefined}
              alt={mainEvent.title}
              className="w-full h-full object-cover rounded-xl border-[4px] border-white"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight uppercase">
              {mainEvent.title}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              <span className={`${typeChipColor} text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md`}>
                {mainEvent.type}
              </span>
              <span className="bg-[#2d6a7a] text-white px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-md">
                Host View
              </span>
            </div>
            <p className="text-sm text-white/90 font-bold uppercase tracking-[0.15em]">
              Upcoming showings: {eventGroup.length}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-8 py-12 flex flex-col md:grid md:grid-cols-12 gap-12">
        <article className="md:col-span-5 space-y-8">
          {mainEvent.description ? (
            <p className="text-[14px] text-gray-700 leading-relaxed font-medium opacity-90 max-w-3xl border-l-4 border-[#ff3366] pl-6 py-1">
              {mainEvent.description}
            </p>
          ) : null}
          <p className="text-[12px] text-[#3a0e23]/70 font-black uppercase tracking-[0.14em]">
            {eventGroup.length} active {eventGroup.length === 1 ? 'showing' : 'showings'}
          </p>
        </article>

        <aside className="md:col-span-7 relative">
          <div className="bg-[#e7e6f0] p-7 rounded-[30px] border border-gray-200/50 shadow-sm sticky top-28">
            <h2 className="text-lg font-black mb-7 text-[#3a0e23] uppercase tracking-tighter italic">Dates and tickets</h2>
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {eventGroup.map((showing) => (
                <div key={showing.id} className="rounded-2xl bg-white p-4 border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 gap-3">
                    <span className="bg-[#2d6a7a] text-white px-4 py-3 rounded-xl font-black text-[12px] uppercase tracking-[0.12em] text-center">
                      {new Date(showing.time).toLocaleString()}
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-[#3a0e23] uppercase tracking-[0.08em]">
                        {showing.soldTickets ?? 0} sold / {showing.seatsLeft} left
                      </span>
                      {showing.seats.length > 0 && (
                        <button
                          type="button"
                          onClick={() => navigate(`/host-dashboard/event/${showing.id}/room-outline`)}
                          className="text-[11px] font-black uppercase tracking-[0.14em] text-[#3a0e23] underline decoration-[#3a0e23]/40 underline-offset-4"
                        >
                          See room outline
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
