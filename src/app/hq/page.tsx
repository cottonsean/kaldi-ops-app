'use client';

import { useState, useRef } from 'react';
import { supabase as defaultSupabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

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

export default function AdminHQ() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Claude's Bulletproof Refs
  const manualUrlRef = useRef<HTMLTextAreaElement>(null);
  const manualKeyRef = useRef<HTMLTextAreaElement>(null);

  const runSystemCheck = async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const info = {
      urlFound: !!url && !url.includes('placeholder'),
      keyFound: !!key && !key.includes('placeholder'),
      urlValue: url || 'NOT_FOUND',
      keyLength: key?.length || 0,
      timestamp: new Date().toLocaleTimeString()
    };

    try {
      const { error } = await defaultSupabase.from('profiles').select('count');
      setDebugInfo({ ...info, apiResponse: error ? `Error: ${error.message}` : 'Success: Connection Live' });
    } catch (err: any) {
      setDebugInfo({ ...info, apiResponse: `Fatal Error: ${err.message}` });
    }
  };

  const handleSeed = async (isManual = false) => {
    setIsSeeding(true);
    setSeedStatus('Starting seed...');
    
    try {
      let client = defaultSupabase;

      if (isManual) {
        const overrideUrl = manualUrlRef.current?.value;
        const overrideKey = manualKeyRef.current?.value;

        if (!overrideUrl || !overrideKey) {
          throw new Error('Please enter both URL and Key for manual seed.');
        }
        client = createClient(overrideUrl, overrideKey);
      }

      for (const profile of seedData) {
        const { error } = await client
          .from('profiles')
          .upsert(profile, { onConflict: 'slug' });
          
        if (error) throw error;
      }
      setSeedStatus('✅ Success: Profiles are now live in Supabase!');
    } catch (err: any) {
      console.error(err);
      setSeedStatus(`❌ Error: ${err.message || 'Failed to seed database'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-[#2d2f36] pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Admin HQ</h1>
            <p className="text-[#94a3b8]">Concierge Onboarding & Field Control</p>
          </div>
          <button 
            onClick={runSystemCheck}
            className="text-[10px] text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-1 rounded-full uppercase font-bold hover:bg-[#38bdf8]/10 transition"
          >
            Run System Check
          </button>
        </header>

        {debugInfo && (
          <section className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 font-mono text-[10px] space-y-2 animate-in fade-in">
            <p className="text-[#38bdf8] font-bold mb-2">DEBUG CONSOLE [{debugInfo.timestamp}]</p>
            <p>URL_CONFIGURED: {debugInfo.urlFound ? 'YES' : 'NO'}</p>
            <p>KEY_CONFIGURED: {debugInfo.keyFound ? 'YES' : 'NO'}</p>
            <p>URL_START: {debugInfo.urlValue}</p>
            <p>KEY_SIZE: {debugInfo.keyLength} chars</p>
            <p className={debugInfo.apiResponse.includes('Success') ? 'text-green-400' : 'text-red-400'}>
              API_RESULT: {debugInfo.apiResponse}
            </p>
          </section>
        )}

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#15171c] border border-[#2d2f36] rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-[#38bdf8]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold">Onboard Technician</h2>
            <p className="text-[#94a3b8] text-sm">Input profile details to generate a dashboard link.</p>
            <button className="w-full bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-[#15171c] border border-[#2d2f36] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-[#38bdf8]/10 rounded-full flex items-center justify-center border border-[#38bdf8]/20 text-[#38bdf8]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <h2 className="text-2xl font-bold">Initialize Database</h2>
            
            {/* Manual Override Section */}
            <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
              <p className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest">Manual Override (Zero-Friction Textarea)</p>
              <textarea 
                ref={manualUrlRef}
                placeholder="Paste Supabase URL" 
                rows={1}
                className="w-full bg-[#0a0a0c] border border-[#2d2f36] px-3 py-2 rounded-lg text-xs outline-none focus:border-[#38bdf8] transition-colors resize-none"
              />
              <textarea 
                ref={manualKeyRef}
                placeholder="Paste Supabase Anon Key" 
                rows={2}
                className="w-full bg-[#0a0a0c] border border-[#2d2f36] px-3 py-2 rounded-lg text-xs outline-none focus:border-[#38bdf8] transition-colors resize-none"
              />
              <button 
                onClick={() => handleSeed(true)}
                disabled={isSeeding}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition disabled:opacity-30"
              >
                Manual Seed
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#2d2f36]"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase text-[#444] font-bold"><span className="bg-[#15171c] px-2">Or Use Vercel Keys</span></div>
            </div>

            <button 
              onClick={() => handleSeed(false)}
              disabled={isSeeding}
              className="w-full bg-[#38bdf8] text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition active:scale-95 disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : 'Seed Initial Profiles'}
            </button>
            {seedStatus && (
              <p className={`text-xs font-medium text-center ${seedStatus.includes('❌') ? 'text-red-400' : 'text-green-400'}`}>
                {seedStatus}
              </p>
            )}
          </div>
        </section>

        <footer className="opacity-20 text-center text-xs uppercase tracking-widest pt-10">
          Kaldi-Ops Command Center
        </footer>
      </div>
    </main>
  );
}
