import { mockEvents, type Event } from './mockEvents';

export type ShowDay = {
  date: string;
  times: string[];
};

export type HostEvent = Event & {
  createdByHost?: boolean;
  schedule?: ShowDay[];
};

const STORAGE_KEY = 'hostCreatedEvents';

const readStored = (): HostEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as HostEvent[];
  } catch {
    return [];
  }
};

const writeStored = (events: HostEvent[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const getHostEvents = (): HostEvent[] => {
  const stored = readStored();
  return [...stored, ...mockEvents];
};

export const upsertHostEvent = (event: HostEvent) => {
  const events = readStored();
  const index = events.findIndex((item) => item.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.unshift(event);
  }
  writeStored(events);
};

export const getHostEventById = (id: string): HostEvent | undefined => {
  return getHostEvents().find((event) => event.id === id);
};
