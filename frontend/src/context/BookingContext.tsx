import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BookingData {
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  date: string;
  dateTo: string;
  time: string;
  seats: string[];
  removedSeats: string[];
  totalPrice: number;
  selectedVenue: string;
  venueLayout?: {
    width: number;
    depth: number;
    floors: number;
  };
  totalTickets: number;
}

interface BookingContextType {
  booking: BookingData;
  updateBooking: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const initialBooking: BookingData = {
  eventId: '',
  eventTitle: '',
  eventCategory: '',
  selectedVenue: '',
  date: '',
  dateTo: '',
  time: '',
  seats: [],
  removedSeats: [],
  totalPrice: 0,
  venueLayout: undefined,
  totalTickets: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingData>(initialBooking);

  const updateBooking = (data: Partial<BookingData>) => {
    setBooking(prev => ({ ...prev, ...data }));
  };

  const resetBooking = () => setBooking(initialBooking);

  return (
    <BookingContext.Provider value={{ booking, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};

