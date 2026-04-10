import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  type: 'seated' | 'no-seats';
  size?: number;
  color: string;
}

const venues: Venue[] = [
  { id: '1', name: 'HALL A', type: 'seated', size: 500, color: '#d3265b' },
  { id: '2', name: 'HALL B', type: 'seated', size: 300, color: '#ff6b6b' },
  { id: '3', name: 'HALL C', type: 'seated', size: 200, color: '#845ec2' },
  { id: '4', name: 'NO SEATS VENUE', type: 'no-seats', color: '#00bcd4' },
];

const VenueSelection = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'seated' | 'no-seats'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || venue.type === filterType;
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

  const handleFilterClick = () => {
    if (filterType === 'all') setFilterType('seated');
    else if (filterType === 'seated') setFilterType('no-seats');
    else setFilterType('all');
  };

  const handleSortClick = () => {
    if (filterType === 'seated') {
      setSortBy(sortBy === 'name' ? 'size' : 'name');
    }
  };

  const handleGoToSeating = () => {
    if (selectedVenue) {
      navigate('/host-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] font-sans selection:bg-[#ffbcc7] selection:text-[#3a0e23]">
      {/* Header */}
      <div className="bg-[#3a0e23] px-6 md:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <img src="/logo_white.png" alt="Logo" className="h-8" />
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-white text-sm mb-4">
          <span className="text-white/70">Adding new event</span>
          <span className="mx-3 text-white/70">→</span>
          <span className="font-semibold">Choosing venue</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-black text-[#3a0e23] mb-8">Pick venue</h1>

          {/* Search and Controls */}
          <div className="mb-8 flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#d3265b] w-5 h-5" />
              <input
                type="text"
                placeholder="Search venue..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-[#d3265b] bg-white text-[#3a0e23] placeholder-[#d3265b]/50 focus:outline-none focus:ring-2 focus:ring-[#d3265b] focus:ring-offset-2"
              />
            </div>

            {/* Filter and Sort Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFilterClick}
                className="px-6 py-2 bg-[#d3265b] text-white font-black rounded-full uppercase text-sm hover:bg-[#b81d47] transition"
              >
                FILTER
              </button>
              {filterType === 'seated' && (
                <button
                  onClick={handleSortClick}
                  className={`px-6 py-2 font-black rounded-full uppercase text-sm transition ${
                    sortBy === 'size'
                      ? 'bg-[#ff69b4] text-white'
                      : 'bg-[#ffb6d9] text-[#d3265b]'
                  }`}
                >
                  SORT
                </button>
              )}
              {filterType === 'seated' && (
                <span className="px-4 py-2 text-sm text-[#3a0e23] font-semibold">
                  {sortBy === 'size' ? 'Size' : 'Name'}
                </span>
              )}
              {filterType !== 'all' && (
                <span className="px-4 py-2 text-sm text-[#3a0e23] font-semibold capitalize">
                  {filterType === 'seated' ? 'Seated' : 'No Seats'}
                </span>
              )}
            </div>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedVenues.map(venue => (
              <button
                key={venue.id}
                onClick={() => setSelectedVenue(venue.id)}
                className={`py-12 px-6 rounded-3xl font-black text-xl text-white transition-all transform ${
                  selectedVenue === venue.id
                    ? 'ring-4 ring-[#3a0e23] scale-105 shadow-xl'
                    : 'hover:scale-105 shadow-lg'
                }`}
                style={{ backgroundColor: venue.color }}
              >
                <div className="flex flex-col items-center gap-2">
                  <span>{venue.name}</span>
                  {venue.size && (
                    <span className="text-sm font-semibold opacity-90">{venue.size} seats</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Go to Seating Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGoToSeating}
              disabled={!selectedVenue}
              className={`px-8 py-3 rounded-full font-black text-white uppercase tracking-wide flex items-center gap-2 transition ${
                selectedVenue
                  ? 'bg-[#d3265b] hover:bg-[#b81d47] cursor-pointer'
                  : 'bg-[#d3265b]/50 cursor-not-allowed'
              }`}
            >
              GO TO SEATING
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueSelection;
