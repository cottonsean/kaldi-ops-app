export interface Technician {
  id: string;
  name: string;
  photoUrl: string;
  bio: string;
  credentials: string[];
  references: { name: string; quote: string; location: string }[];
  companyName: string;
}

export const mockDB: Record<string, Technician> = {
  'carlos-electric': {
    id: 'carlos-electric',
    name: 'Carlos Mendez',
    photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop',
    bio: 'Licensed Master Electrician with over 15 years of experience in residential and commercial wiring. Dedicated to safety and excellence.',
    credentials: [
      'Master Electrician License #4592',
      'Licensed & Insured',
      'OSHA Safety Certified',
      'JSU Alum'
    ],
    references: [
      { name: 'Marcus L.', quote: 'Carlos arrived on time and fixed a complex breaker issue in minutes. Highly professional.', location: 'Canton, MS' },
      { name: 'Sarah G.', quote: 'Excellent work on our kitchen remodel. He explained everything clearly and the quote was spot on.', location: 'Jackson, MS' },
      { name: 'Robert S.', quote: 'Fast, clean, and honest. Carlos is the only electrician I call now.', location: 'Ridgeland, MS' }
    ],
    companyName: 'Mendez Electric'
  },
  'sean-cotton': {
    id: 'sean-cotton',
    name: 'Sean Cotton',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Software Engineer and Army Veteran focused on high-utility tools for the trades. Committed to building the community legacy.',
    credentials: [
      'Army Veteran',
      'Software Engineer, MBA',
      'JSU Tiger',
      'Alpha Phi Alpha'
    ],
    references: [
      { name: 'Alex Rivera', quote: 'Sean built our intake system and it has cut our response time in half. Game changer.', location: 'Chicago, IL' },
      { name: 'Ebony Chisholm', quote: 'The most reliable partner we have worked with. He understands the trade business.', location: 'Atlanta, GA' }
    ],
    companyName: 'KaldiFlow Solutions'
  }
};
