import { venues } from './venues';

export type HostCategory = 'vip' | 'area1' | 'area2' | 'handicap';

export type HostRoomConfig = {
  eventId: string;
  eventCategory: string;
  venueId: string;
  venueName: string;
  removedSeats: string[];
  seatAssignments: Record<string, HostCategory>;
  prices: Record<HostCategory, number>;
  updatedAt: string;
};

const STORAGE_KEY = 'hostRoomConfigs';

const defaultPrices = (eventCategory: string): Record<HostCategory, number> => {
  const category = eventCategory.toLowerCase();
  if (category === 'cinema') return { vip: 12, area1: 6, area2: 9, handicap: 4 };
  if (category === 'theatre') return { vip: 13, area1: 10, area2: 7, handicap: 5 };
  return { vip: 12, area1: 8, area2: 10, handicap: 5 };
};

const getRowCategory = (eventCategory: string, rowIndex: number, totalRows: number): HostCategory => {
  const firstQuarterEnd = Math.max(0, Math.ceil(totalRows * 0.25) - 1);
  const thirdCut = Math.ceil(totalRows * 0.33);
  const category = eventCategory.toLowerCase();

  if (category === 'cinema') {
    if (rowIndex <= firstQuarterEnd) return 'area1';
    if (rowIndex >= Math.floor(totalRows * 0.65)) return 'vip';
    return 'area2';
  }

  if (category === 'theatre') {
    if (rowIndex < thirdCut) return rowIndex % 2 === 0 ? 'vip' : 'area1';
    return 'area2';
  }

  if (rowIndex >= Math.floor(totalRows * 0.7)) return 'vip';
  if (rowIndex >= Math.floor(totalRows * 0.35)) return 'area2';
  return 'area1';
};

const parseConfigs = (): HostRoomConfig[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as HostRoomConfig[];
  } catch {
    return [];
  }
};

const writeConfigs = (configs: HostRoomConfig[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
};

export const saveHostRoomConfig = (config: HostRoomConfig) => {
  const configs = parseConfigs();
  const existingIndex = configs.findIndex((item) => item.eventId === config.eventId);
  if (existingIndex >= 0) {
    configs[existingIndex] = config;
  } else {
    configs.push(config);
  }
  writeConfigs(configs);
};

export const getHostRoomConfig = (eventId: string): HostRoomConfig | null => {
  const configs = parseConfigs();
  const fromStorage = configs.find((item) => item.eventId === eventId);
  if (fromStorage) return fromStorage;

  const venue = venues.find((item) => item.type === 'seated');
  if (!venue) return null;

  const removedSeats = ['A1', 'A2', 'B1', 'B2', 'C10', 'C11', 'D5', 'D6'];
  const seatAssignments: Record<string, HostCategory> = {};

  venue.layout.rows.forEach((rowLabel, rowIndex) => {
    for (let seatIndex = 0; seatIndex < venue.layout.seatsPerRow; seatIndex += 1) {
      const seatCode = `${rowLabel}${seatIndex + 1}`;
      if (removedSeats.includes(seatCode)) continue;

      const isHandicap = rowIndex === 0 && (seatIndex === 0 || seatIndex === venue.layout.seatsPerRow - 1);
      seatAssignments[seatCode] = isHandicap
        ? 'handicap'
        : getRowCategory('cinema', rowIndex, venue.layout.rows.length);
    }
  });

  return {
    eventId,
    eventCategory: 'Cinema',
    venueId: venue.id,
    venueName: venue.name,
    removedSeats,
    seatAssignments,
    prices: defaultPrices('cinema'),
    updatedAt: new Date().toISOString(),
  };
};
