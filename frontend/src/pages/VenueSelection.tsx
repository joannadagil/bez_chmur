import type { ChangeEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useBooking } from '../context/BookingContext';
import { venues } from '../data/venues';
import type { VenueData } from '../data/venues';

const VenueSelection = () => {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'seated' | 'no-seats' | 'large' | 'small'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = false;
    
    if (filterType === 'all') {
      matchesFilter = true;
    } else if (filterType === 'seated') {
      matchesFilter = venue.type === 'seated';
    } else if (filterType === 'no-seats') {
      matchesFilter = venue.type === 'no-seats';
    } else if (filterType === 'large') {
      matchesFilter = venue.type === 'seated' && !!venue.size && venue.size >= 500;
    } else if (filterType === 'small') {
      matchesFilter = venue.type === 'seated' && !!venue.size && venue.size <= 100;
    }
    
    return matchesSearch && matchesFilter;
  });

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    if (sortBy === 'size') {
      const sizeA = a.size ?? 0;
      const sizeB = b.size ?? 0;
      return sizeB - sizeA;
    }
    return a.name.localeCompare(b.name);
  });

  const handleFilterSelect = (type: 'all' | 'seated' | 'no-seats' | 'large' | 'small') => {
    setFilterType(type);
    setShowFilterDropdown(false);
  };

  const handleSortSelect = (sort: 'name' | 'size') => {
    setSortBy(sort);
    setShowSortDropdown(false);
    if (sort === 'size') {
      setFilterType('seated');
    }
  };

  const parseDate = (value: string) => {
    return value ? new Date(value) : null;
  };

  const eventStart = parseDate(booking.date);
  const eventEnd = parseDate(booking.dateTo || booking.date);

  const rangesOverlap = (startA: Date, endA: Date, startB: Date, endB: Date) => {
    return startA <= endB && startB <= endA;
  };

  const isVenueBusy = (venue: VenueData) => {
    if (!eventStart || !eventEnd) return false;
    return venue.busyRanges.some(range => {
      const busyStart = new Date(range.start);
      const busyEnd = new Date(range.end);
      return rangesOverlap(eventStart, eventEnd, busyStart, busyEnd);
    });
  };

  const handleGoToSeating = () => {
    if (selectedVenue) {
      const currentVenue = venues.find(venue => venue.id === selectedVenue);
      if (currentVenue) {
        updateBooking({ selectedVenue: currentVenue.name });
        if (currentVenue.type === 'seated') {
          navigate(`/host-dashboard/add-event/venue/${selectedVenue}/seating`);
        } else if (currentVenue.type === 'no-seats') {
          navigate(`/host-dashboard/add-event/venue/${selectedVenue}/configure-no-seats`);
        }
      }
    }
  };

  const selectedVenueData = selectedVenue ? venues.find((venue) => venue.id === selectedVenue) : null;
  const canGoToSeating = Boolean(selectedVenueData);

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans selection:bg-[#ffbcc7] selection:text-[#3a0e23]">
      <Navbar hideTicketsLink logoLink="/host-dashboard" userName="Company Name" />

   

      {/* Main Content */}
      <div className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-black text-[#3a0e23] mb-8">Pick a venue</h1>
          {booking.date && booking.dateTo && (
            <p className="text-sm text-[#3a0e23]/80 mb-8">
              Event dates: {booking.date} → {booking.dateTo}
            </p>
          )}

          {/* Search and Controls */}
          <div className="mb-8 flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#d3265b] w-5 h-5" />
              <input
                placeholder="Search venue..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-[#d3265b] bg-white text-[#3a0e23] placeholder-[#d3265b]/50 focus:outline-none focus:ring-2 focus:ring-[#d3265b] focus:ring-offset-2"
              />
            </div>

            {/* Filter and Sort Buttons */}
            <div className="flex gap-3 relative">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="px-6 py-2 bg-[#d3265b] text-white font-black rounded-full uppercase text-sm hover:bg-[#b81d47] transition flex items-center gap-2"
                >
                  FILTER
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg z-10">
                    <button
                      onClick={() => handleFilterSelect('all')}
                      className="w-full text-left px-4 py-3 hover:bg-[#f5f5dc] rounded-t-2xl font-semibold text-[#3a0e23]"
                    >
                      All Venues
                    </button>
                    <button
                      onClick={() => handleFilterSelect('no-seats')}
                      className="w-full text-left px-4 py-3 hover:bg-[#f5f5dc] font-semibold text-[#3a0e23]"
                    >
                      No Seats Venues
                    </button>
                    <button
                      onClick={() => handleFilterSelect('large')}
                      className="w-full text-left px-4 py-3 hover:bg-[#f5f5dc] font-semibold text-[#3a0e23]"
                    >
                      Large (≥500 seats)
                    </button>
                    <button
                      onClick={() => handleFilterSelect('small')}
                      className="w-full text-left px-4 py-3 hover:bg-[#f5f5dc] rounded-b-2xl font-semibold text-[#3a0e23]"
                    >
                      Small (≤100 seats)
                    </button>
                  </div>
                )}
              </div>

              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-6 py-2 bg-[#ff69b4] text-white font-black rounded-full uppercase text-sm hover:bg-[#ff1493] transition flex items-center gap-2"
                >
                  SORT
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full mt-2 w-32 bg-white border border-gray-200 rounded-2xl shadow-lg z-10">
                    <button
                      onClick={() => handleSortSelect('name')}
                      className="w-full text-left px-4 py-3 hover:bg-[#f5f5dc] rounded-t-2xl font-semibold text-[#3a0e23]"
                    >
                      Name
                    </button>
                    <button
                      onClick={() => handleSortSelect('size')}
                      className="w-full text-left px-4 py-3 hover:bg-[#f5f5dc] rounded-b-2xl font-semibold text-[#3a0e23]"
                    >
                      Size
                    </button>
                  </div>
                )}
              </div>

              {filterType !== 'all' && (
                <span className="px-4 py-2 text-sm text-[#3a0e23] font-semibold capitalize bg-[#ffbcc7] rounded-full">
                  {filterType === 'seated' ? 'Seated' : 
                   filterType === 'no-seats' ? 'No Seats' :
                   filterType === 'large' ? 'Large (≥500)' :
                   filterType === 'small' ? 'Small (≤100)' : filterType}
                </span>
              )}

              <span className="px-4 py-2 text-sm text-[#3a0e23] font-semibold bg-[#ffb6d9] rounded-full">
                Sort: {sortBy === 'size' ? 'Size' : 'Name'}
              </span>
            </div>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedVenues.map(venue => {
              const venueIsBusy = isVenueBusy(venue);
              const venueDisabled = venueIsBusy;
              return (
                <button
                  key={venue.id}
                  onClick={() => !venueDisabled && setSelectedVenue(venue.id)}
                  disabled={venueDisabled}
                  className={`py-16 px-8 rounded-full font-black text-xl text-white transition-all transform duration-300 shadow-lg ${
                    selectedVenue === venue.id && !venueDisabled
                      ? 'ring-4 ring-[#3a0e23] scale-110 shadow-2xl'
                      : 'hover:scale-110 hover:shadow-xl'
                  } ${venueDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  title={
                    venueIsBusy
                      ? 'This venue is busy during your event'
                      : undefined
                  }
                  style={{ backgroundColor: venueDisabled ? '#8f8f8f' : venue.color }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-2xl">{venue.name}</span>
                    {venueIsBusy && (
                      <span className="text-xs uppercase tracking-[0.2em] text-white/90 bg-black/20 px-3 py-1 rounded-full">
                        Busy during event
                      </span>
                    )}
                    {venue.size && (
                      <span className="text-lg font-bold opacity-90 bg-white/20 px-3 py-1 rounded-full">
                        {venue.size} seats
                      </span>
                    )}
                    {!venue.size && (
                      <span className="text-lg font-bold opacity-90 bg-white/20 px-3 py-1 rounded-full">
                        No seats
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Go to Seating Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGoToSeating}
              disabled={!canGoToSeating}
              className={`px-8 py-3 rounded-full font-black text-white uppercase tracking-wide flex items-center gap-2 transition ${
                canGoToSeating
                  ? 'bg-[#d3265b] hover:bg-[#b81d47] cursor-pointer'
                  : 'bg-[#d3265b]/50 cursor-not-allowed'
              }`}
            >
              CONTINUE
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VenueSelection;
