import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BookingData {
  eventId: string;
  eventTitle: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  selectedVenue: string;
  orderId: string; //new
}

interface BookingContextType {
  booking: BookingData;
  updateBooking: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const initialBooking: BookingData = {
  eventId: '',
  eventTitle: '',
  selectedVenue: '',
  date: '',
  time: '',
  seats: [],
  totalPrice: 0,
  orderId: '', //new
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

