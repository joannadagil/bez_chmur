import { mockEvents, type Event } from './mockEvents';

export type ShowDay = {
  date: string;
  times: string[];
};

/**
 * Host-created or mock event with optional multi-day schedule metadata.
 */
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

/**
 * Return host-created events from local storage followed by bundled mock events.
 */
export const getHostEvents = (): HostEvent[] => {
  const stored = readStored();
  return [...stored, ...mockEvents];
};

/**
 * Insert or replace a host-created event in local storage.
 */
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

/**
 * Find a host event by id across local storage and mock data.
 */
export const getHostEventById = (id: string): HostEvent | undefined => {
  return getHostEvents().find((event) => event.id === id);
};
