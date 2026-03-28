// src/components/events/EventCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../../data/mockEvents';

interface EventCardProps { event: Event; }

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const typeColors: Record<string, string> = {
    Cinema: 'bg-[#d3265b]',      
    Theatre: 'bg-[#845ec2]',      
    Lecture: 'bg-[#2c73d2]',      
  };

  return (
    <Link to={`/event/${event.id}`} className="block group">
      <div className="bg-[#3a0e23] rounded-[28px] overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl text-white">
        <div className="relative h-44 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}

className="w-full h-full object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
          />
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between items-start">
            <span className={`${typeColors[event.type] || 'bg-gray-500'} text-white text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.2em]`}>
              {event.type}
            </span>
            <span className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">
              {event.seatsLeft !== undefined ? `${event.seatsLeft} left` : ''}
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold leading-tight group-hover:text-[#f27690] transition-colors">
              {event.title}
            </h3>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider truncate">
              {event.venue}
            </p>
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-white/5">
<span className="text-lg font-black text-[#f27690]">
  {Number(event.price) > 0 ? `$${event.price}` : 'FREE'}
</span>

            <button className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg group-hover:bg-[#f27690] group-hover:text-white transition-all">
              Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};