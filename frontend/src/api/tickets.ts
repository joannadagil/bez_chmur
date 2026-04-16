import { apiClient } from './client';

export type TicketDto = {
  id: number;
  title: string;
  venue: string;
  date: string;
  time: string;
  seats: string[];
  status: string;
  is_past: boolean;
};

export type CreateOrderPayload = {
  email: string;
  first_name?: string;
  last_name?: string;
  event_title: string;
  venue_name: string;
  event_date?: string;
  event_time?: string;
  seats: string[];
  total_price: number;
};

export const fetchMyTickets = async (email: string): Promise<TicketDto[]> => {
  const response = await apiClient.get<TicketDto[]>('/tickets/', {
    params: { email },
  });
  return response.data;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<{ order_id: number }> => {
  const response = await apiClient.post<{ order_id: number }>('/orders/', payload);
  return response.data;
};
