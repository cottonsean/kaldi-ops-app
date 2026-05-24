import { supabase } from './lib/supabase';

const seedData = [
  {
    slug: 'carlos-electric',
    name: 'Carlos Mendez',
    company: 'Mendez Electric',
    headshot_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop',
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
    ]
  },
  {
    slug: 'sean-cotton',
    name: 'Sean Cotton',
    company: 'KaldiFlow Solutions',
    headshot_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    credentials: [
      'Army Veteran',
      'Software Engineer, MBA',
      'JSU Tiger',
      'Alpha Phi Alpha'
    ],
    references: [
      { name: 'Alex Rivera', quote: 'Sean built our intake system and it has cut our response time in half. Game changer.', location: 'Chicago, IL' },
      { name: 'Ebony Chisholm', quote: 'The most reliable partner we have worked with. He understands the trade business.', location: 'Atlanta, GA' }
    ]
  }
];

export async function seedDatabase() {
  console.log('Seeding Supabase Database...');
  
  for (const profile of seedData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'slug' });
      
    if (error) console.error(`Error seeding ${profile.slug}:`, error.message);
    else console.log(`Successfully seeded ${profile.slug}`);
  }
}
