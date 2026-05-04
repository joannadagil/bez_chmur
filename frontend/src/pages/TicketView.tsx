import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Armchair, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/layout/Navbar';
import { fetchMyTickets, type TicketDto } from '../api/tickets';

const TicketView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    let ignore = false;

    const loadTicket = async () => {
      try {
        const data = await fetchMyTickets();
        const selected = data.find((item) => String(item.id) === String(id));
        if (!ignore) {
          if (!selected) {
            setError('Ticket not found.');
            setTicket(null);
          } else {
            setTicket(selected);
            setError('');
          }
        }
      } catch {
        if (!ignore) {
          setError('Could not load this ticket from backend.');
          setTicket(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTicket();
    return () => {
      ignore = true;
    };
  }, [id]);

  const displayName = useMemo(() => {
    if (currentUser?.companyName) return currentUser.companyName;
    return [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Guest';
  }, [currentUser?.companyName, currentUser?.firstName, currentUser?.lastName]);

  const qrValue = useMemo(() => {
    if (!ticket) return '';

    return JSON.stringify({
      provider: 'getAroom',
      ticket_id: ticket.id,
      event: ticket.title,
      venue: ticket.venue,
      date: ticket.date,
      time: ticket.time,
      seats: ticket.seats,
      status: ticket.status,
      holder: displayName,
    });
  }, [ticket, displayName]);

  return (
    <div className="min-h-screen bg-[#e5e7eb] font-sans text-[#1a0b1a]">
      <Navbar />

      <main className="max-w-[980px] mx-auto px-6 py-10 space-y-6">
        <button
          type="button"
          onClick={() => navigate('/my-tickets')}
          className="inline-flex items-center gap-2 rounded-full border border-[#3a0e23]/20 bg-white px-5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a0e23] hover:bg-[#f5f5dc] transition"
        >
          <ArrowLeft size={14} />
          Back to My Tickets
        </button>

        {loading && (
          <section className="rounded-[30px] bg-white p-10 text-center font-bold text-[#3a0e23] shadow-xl">
            Loading ticket...
          </section>
        )}

        {!loading && error && (
          <section className="rounded-[30px] bg-white p-10 text-center font-bold text-red-500 shadow-xl">
            {error}
          </section>
        )}

        {!loading && !error && ticket && (
          <section className="rounded-[30px] bg-white p-8 md:p-10 shadow-2xl border border-[#3a0e23]/10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a56d7d]">Customer Ticket</p>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#3a0e23]">
                  {ticket.title}
                </h1>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#3a0e23]/70">Booked by {displayName}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl bg-[#f5f5dc] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56d7d] mb-2">Venue</p>
                    <div className="flex items-center gap-2 text-[#3a0e23] font-black">
                      <MapPin size={16} />
                      <span>{ticket.venue}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f5f5dc] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56d7d] mb-2">Date & Time</p>
                    <div className="flex items-center gap-2 text-[#3a0e23] font-black">
                      <Calendar size={16} />
                      <span>{ticket.date} {ticket.time}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f5f5dc] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56d7d] mb-3">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.seats.map((seat) => (
                      <span key={seat} className="inline-flex items-center gap-1 rounded-lg bg-[#3a0e23] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                        <Armchair size={12} />
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:w-[250px] shrink-0">
                <div className="rounded-2xl border-2 border-dashed border-[#3a0e23]/20 bg-[#fffdf8] p-5 text-center space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56d7d]">Scan at entrance</p>
                  <div className="mx-auto rounded-xl bg-white p-3 border border-[#3a0e23]/10 inline-flex items-center justify-center">
                    <QRCodeSVG
                      value={qrValue}
                      size={150}
                      level="M"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#2a0a1a"
                    />
                  </div>
                  <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#3a0e23]">Ticket #{ticket.id}</span>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3a0e23]">Status: {ticket.status}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TicketView;