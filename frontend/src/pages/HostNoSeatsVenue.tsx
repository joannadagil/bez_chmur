import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useBooking } from '../context/BookingContext';
import { venues } from '../data/venues';

const HostNoSeatsVenue = () => {
  const navigate = useNavigate();
  const { id: venueId } = useParams();
  const { booking, updateBooking } = useBooking();

  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [floors, setFloors] = useState('');
  const [location, setLocation] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const selectedVenue = venues.find((venue) => venue.id === venueId && venue.type === 'no-seats');

  const validateForm = () => {
    const validationErrors: string[] = [];

    const widthNum = Number(width);
    const depthNum = Number(depth);
    const floorsNum = Number(floors);
    const ticketsNum = Number(totalTickets);

    if (!width || Number.isNaN(widthNum) || widthNum <= 0) {
      validationErrors.push('Width must be a positive number.');
    }

    if (!depth || Number.isNaN(depthNum) || depthNum <= 0) {
      validationErrors.push('Depth must be a positive number.');
    }

    if (!floors || Number.isNaN(floorsNum) || floorsNum < 0) {
      validationErrors.push('Floors must be 0 or a positive number.');
    }

    if (!location.trim()) {
      validationErrors.push('Enter a location for the venue.');
    } else {
      const hasWord = /[a-zA-Z]/.test(location);
      const hasNumber = /\d/.test(location);
      if (!hasWord || !hasNumber) {
        validationErrors.push('Location must contain at least one letter and one number.');
      }
    }

    if (!totalTickets || Number.isNaN(ticketsNum) || ticketsNum <= 0) {
      validationErrors.push('Tickets must be at least 1.');
    }

    return validationErrors;
  };

  const handleCreateEvent = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      updateBooking({
        venueLayout: {
          width: Number(width),
          depth: Number(depth),
          floors: Number(floors),
        },
        totalTickets: Number(totalTickets),
      });
      navigate('/host-dashboard');
    }
  };

  if (!selectedVenue) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] font-sans text-[#1a0b1a]">
        <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />
        <main className="max-w-[1240px] mx-auto px-6 py-10">
          <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-white p-8 text-[#3a0e23] font-bold">
            Venue is not available for this configuration.
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
          No-seats venue
        </h1>

        <section className="rounded-[18px] border-2 border-[#ff3f7a] bg-white p-8 md:p-10">
          <div className="space-y-8">
            <div className="w-full space-y-8">
            {errors.length > 0 && (
              <div className="rounded-xl border border-[#d3265b]/40 bg-[#fff5f7] px-4 py-3">
                {errors.map((error) => (
                  <p key={error} className="text-sm font-semibold text-[#8f1c3f]">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Venue Parameters */}
            <div>
              <h2 className="text-4xl font-black text-[#301326] mb-6">Choose the parameters of the venue:</h2>
              <div className="flex items-start gap-4 mb-3 w-full">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Width"
                  className="flex-1 min-w-0 border-2 border-[#4a3142] bg-white px-4 py-3 text-xl font-black text-[#4a3142] placeholder:text-[#8f8f95] focus:outline-none focus:ring-2 focus:ring-[#ff3f7a]"
                />
                <span className="text-2xl font-black text-[#4a3142] flex-shrink-0 mt-2">×</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="Depth"
                  className="flex-1 min-w-0 border-2 border-[#4a3142] bg-white px-4 py-3 text-xl font-black text-[#4a3142] placeholder:text-[#8f8f95] focus:outline-none focus:ring-2 focus:ring-[#ff3f7a]"
                />
                <span className="text-2xl font-black text-[#4a3142] flex-shrink-0 mt-2">×</span>
                <div className="flex-1 min-w-0">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    placeholder="Floors"
                    className="w-full border-2 border-[#4a3142] bg-white px-4 py-3 text-xl font-black text-[#4a3142] placeholder:text-[#8f8f95] focus:outline-none focus:ring-2 focus:ring-[#ff3f7a]"
                  />
                  <p className="mt-2 text-sm text-[#8f8f95]">0 if there is only ground floor, 1 if there&apos;s a 1st floor, etc.</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-4xl font-black text-[#301326] mb-6">Choose the location of the venue:</h2>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Address or location description"
                className="w-full border-2 border-[#4a3142] bg-white px-4 py-3 text-2xl font-black text-[#4a3142] placeholder:text-[#8f8f95] focus:outline-none focus:ring-2 focus:ring-[#ff3f7a]"
              />
            </div>

            {/* Number of Tickets */}
            <div>
              <h2 className="text-4xl font-black text-[#301326] mb-6">Choose the number of tickets:</h2>
              <input
                type="number"
                min="1"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                placeholder="Total number of tickets"
                className="w-full border-2 border-[#4a3142] bg-white px-4 py-3 text-2xl font-black text-[#4a3142] placeholder:text-[#8f8f95] focus:outline-none focus:ring-2 focus:ring-[#ff3f7a]"
              />
            </div>
            </div>

            {/* Create Event Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleCreateEvent}
                className="px-8 py-3 bg-[#ff3f7a] text-white font-black rounded-full text-xl uppercase tracking-wide hover:bg-[#d3265b] transition transform hover:scale-105"
              >
                CREATE EVENT
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HostNoSeatsVenue;
