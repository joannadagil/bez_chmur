import axios from 'axios';
import { apiClient } from './client';

export type SeatDto = {
  id: number;
  row: string;
  number: number;
  is_reserved: boolean;
  if_exist: boolean;
  seat_category: { name: string; price: string } | null;
};

export type HostEventDto = {
  id: number;
  event: number;
  title: string;
  /** venue integer ID from backend */
  venue: number;
  /** venue display name from backend */
  venue_name: string;
  type: 'Cinema' | 'Theatre' | 'Lecture';
  price: number | string;
  seatsLeft: number;
  soldTickets: number;
  image_url: string | null;
  description: string;
  time: string;
  seats: SeatDto[];
  venue_rows: number;
  venue_seats_per_row: number;
};

export type CreateHostEventPayload = {
  event_name: string;
  event_description?: string;
  category: 'Cinema' | 'Theatre' | 'Lecture';
  event_image_url?: string;
  venue_name: string;
  venue_rows: number;
  venue_seats_per_row: number;
  time: string;
  prices: Record<string, number | string>;       
  seatAssignments: Record<string, string>;
  ticket_price?: number;
};

export const fetchHostEvents = async (email: string): Promise<HostEventDto[]> => {
  const response = await apiClient.get<HostEventDto[]>('/host-events/', { params: { email } });
  return response.data;
};

export const fetchHostEventShowings = async (eventId: string, email: string): Promise<HostEventDto[]> => {
  const response = await apiClient.get<HostEventDto[]>('/host-events/', { params: { email, event: eventId } });
  return response.data;
};

export const fetchHostEventById = async (eventId: string, email: string): Promise<HostEventDto> => {
  const response = await apiClient.get<HostEventDto>(`/host-events/${eventId}/`, { params: { email } });
  return response.data;
};

export const createHostEvent = async (payload: CreateHostEventPayload): Promise<HostEventDto> => {
  try {
    const response = await apiClient.post<HostEventDto>('/host-events/', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
      if (detail) {
        throw new Error(detail);
      }
      if (!error.response) {
        throw new Error('Cannot connect to backend API. Ensure Django server is running on port 8000.');
      }
      throw new Error(`Backend error (${error.response.status}).`);
    }
    throw error;
  }
};
