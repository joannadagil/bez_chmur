// src/data/mockEvents.ts

export interface Event {
  id: string;
  title: string;
  venue: string;
  type: 'Cinema' | 'Theatre' | 'Lecture';
  price: number | 'Free';
  seatsLeft?: number;
  imageUrl: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Dune: Part Two',
    venue: '12+ cinemas',
    type: 'Cinema',
    price: 5,
    imageUrl: 'https://www.superherotoystore.com/cdn/shop/articles/dune-part-two-2024-5k-rl-3840x2400_1600x.jpg?v=1709290352', // Przykładowy plakat
  },
  {
    id: '2',
    title: 'Romeo and Juliet',
    venue: 'National Theatre',
    type: 'Theatre',
    price: 21,
    seatsLeft: 42,
    imageUrl: 'https://cdn.svvoice.com/wp-content/uploads/2019/06/18020648/3-Balcony-credit-Jay-Yamada-Copy.jpg', // Przykładowe zdjęcie teatru
  },
  {
    id: '3',
    title: 'AI & Society - Open Lecture',
    venue: 'Warsaw University of Technology',
    type: 'Lecture',
    price: 'Free',
    seatsLeft: 42,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&auto=format&fit=crop', // Przykładowe zdjęcie AI
  },
   {
    id: '4',
    title: 'La La Land - City of Stars',
    venue: 'Multikino',
    type: 'Cinema',
    price: 8,
    imageUrl: 'https://occ-0-8407-2219.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABe0k0-UurHVbx9fm2hTVfoTVYElSw7GWMcvc1JAfGPsqraunVJBWewzMWxs8GmB4an5YQM1BPv3Y37wubHYKAJZ50hBn0oEfpX-m.jpg?r=ada', // Przykładowy plakat
  },
  {
    id: '5',
    title: 'Beetlejuice The Musical',
    venue: 'Teatr Roma',
    type: 'Theatre',
    price: 25,
    imageUrl: 'https://beetlejuicethemusical.com.au/wp-content/uploads/2025/06/beetlejuice-title.jpg',
    seatsLeft: 12,
  },
  {
    id: '6',
    title: 'Moulin Rouge! The Musical',
    venue: 'Teatr Muzyczny Buffo',
    type: 'Theatre',
    price: 30,
    imageUrl: 'https://aws-tiqets-cdn.imgix.net/images/content/af800c2a213a46b28e696d9efae8fcba.jpg?auto=format%2Ccompress&fit=crop&q=70&w=600&s=61daa83f62dc8edda6220caaa0ea0639',
    seatsLeft: 5,
  },
  {
    id: '7',
    title: 'Poor Things',
    venue: 'Kino Muranów',
    type: 'Cinema',
    price: 10,
    imageUrl: 'https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/019b2681-dd36-726b-acb2-b16a5872d0b6/compose?aspectRatio=1.78&format=webp&width=1200',
    seatsLeft: 24,
  },
  {
    id: '8',
    title: 'Phantom of the Opera',
    venue: 'Teatr Wielki',
    type: 'Theatre',
    price: 45,
    imageUrl: 'https://d28054jbxkgsih.cloudfront.net/uploads/_fullCroppedImage/CML_Production-Page-Banner_1920x1080_3_AW.jpg?v=1764185437',
    seatsLeft: 2,
  },
  {
    id: '9',
    title: 'The Secret Life of Trees',
    venue: 'Lecture Hall B2',
    type: 'Lecture',
    price: 5,
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800',
    seatsLeft: 310,
  }
];