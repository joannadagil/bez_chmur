export interface VenueData {
  id: string;
  name: string;
  type: 'seated' | 'no-seats';
  size?: number;
  color: string;
  layout: {
    rows: string[];
    seatsPerRow: number;
  };
  busyRanges: { start: string; end: string }[];
}

const createRowLabels = (count: number) => {
  return Array.from({ length: count }, (_, idx) => String.fromCharCode(65 + idx));
};

export const venues: VenueData[] = [
  {
    id: '1',
    name: 'HALL A',
    type: 'seated',
    size: 500,
    color: '#d3265b',
    layout: { rows: createRowLabels(20), seatsPerRow: 25 },
    busyRanges: [{ start: '2026-04-15', end: '2026-04-18' }],
  },
  {
    id: '2',
    name: 'HALL B',
    type: 'seated',
    size: 300,
    color: '#ff6b6b',
    layout: { rows: createRowLabels(15), seatsPerRow: 20 },
    busyRanges: [{ start: '2026-04-07', end: '2026-04-09' }],
  },
  {
    id: '3',
    name: 'HALL C',
    type: 'seated',
    size: 200,
    color: '#845ec2',
    layout: { rows: createRowLabels(10), seatsPerRow: 20 },
    busyRanges: [],
  },
  {
    id: '4',
    name: 'SMALL HALL',
    type: 'seated',
    size: 80,
    color: '#00bcd4',
    layout: { rows: createRowLabels(8), seatsPerRow: 10 },
    busyRanges: [{ start: '2026-04-20', end: '2026-04-22' }],
  },
  {
    id: '5',
    name: 'TINY ROOM',
    type: 'seated',
    size: 50,
    color: '#4caf50',
    layout: { rows: createRowLabels(5), seatsPerRow: 10 },
    busyRanges: [],
  },
  {
    id: '6',
    name: 'NO SEATS VENUE',
    type: 'no-seats',
    color: '#ff9800',
    layout: { rows: [], seatsPerRow: 0 },
    busyRanges: [{ start: '2026-04-15', end: '2026-04-15' }],
  },
];
