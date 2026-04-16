import { apiClient } from './client';

type BackendOrderDto = {
  id: number;
  user_email: string;
  user_full_name: string;
  event_name: string;
  date: string;
  status: string;
  seats: string[];
};

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

type CreateOrderPayload = {
  event_instance_id: number;
  seat_ids: number[];
};

export const fetchMyTickets = async (): Promise<TicketDto[]> => {
  const response = await apiClient.get<BackendOrderDto[]>('/user-order/');

  return response.data.map((order) => {
    const dt = new Date(order.date);

    return {
      id: order.id,
      title: order.event_name,
      venue: 'Unknown venue', // TODO This should ideally come from the backend
      date: dt.toLocaleDateString(),
      time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seats: order.seats,
      status: order.status,
      is_past: dt.getTime() < Date.now(),
    };
  });
};

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<{ order_id: number; message: string }> => {
  const response = await apiClient.post<{ order_id: number; message: string }>(
    '/book-seats/',
    payload
  );
  return response.data;
};