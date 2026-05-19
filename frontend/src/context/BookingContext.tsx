import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Booking state shared across event details, seat selection, and checkout pages.
 */
interface BookingData {
  eventId: string;
  eventInstanceId: number | null;
  eventTitle: string;
  eventCategory: string;
  eventImageUrl: string;
  date: string;
  dateTo: string;
  time: string;
  showSchedule: Array<{ date: string; times: string[] }>;
  seats: string[];
  seatIds: number[];
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
  eventInstanceId: null,
  eventTitle: '',
  eventCategory: '',
  eventImageUrl: '',
  selectedVenue: '',
  date: '',
  dateTo: '',
  time: '',
  showSchedule: [],
  seats: [],
  seatIds: [],
  removedSeats: [],
  totalPrice: 0,
  venueLayout: undefined,
  totalTickets: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

/**
 * Provides mutable booking state for the current checkout flow.
 */
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

/**
 * Access the current booking context.
 *
 * @throws When used outside `BookingProvider`.
 */
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};

