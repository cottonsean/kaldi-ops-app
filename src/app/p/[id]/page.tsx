import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export async function generateStaticParams() {
  try {
    const { data: profiles } = await supabase.from('profiles').select('slug');
    if (!profiles || profiles.length === 0) {
      return [{ id: 'carlos-electric' }, { id: 'sean-cotton' }];
    }
    return profiles.map((profile) => ({
      id: profile.slug,
    }));
  } catch (e) {
    return [{ id: 'carlos-electric' }, { id: 'sean-cotton' }];
  }
}

export default async function HomeownerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: tech, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', id)
    .single();

  if (error || !tech) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] p-6 font-sans">
      <div className="max-w-md mx-auto space-y-8 pt-10">
        <header className="text-center">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#38bdf8] overflow-hidden mb-4 shadow-xl shadow-[#38bdf8]/10">
            <img src={tech.headshot_url} alt={tech.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">{tech.name}</h1>
          <p className="text-[#38bdf8] font-bold text-sm uppercase tracking-widest">{tech.company}</p>
        </header>

        <section className="bg-[#15171c] border border-[#2d2f36] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-[#38bdf8] rounded-full"></div>
            <h2 className="text-xl font-bold">Trust & Credentials</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(tech.credentials as string[]).map((cred, i) => (
              <span key={i} className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {cred}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-8 bg-white/20 rounded-full"></div>
            <h2 className="text-xl font-bold">People who vouch for me</h2>
          </div>
          {(tech.references as any[]).map((ref, i) => (
            <div key={i} className="bg-[#15171c]/50 border border-[#2d2f36] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H14.017C13.4647 8 13.017 8.44772 13.017 9V15C13.017 16.1046 12.1216 17 11.017 17H8.017C7.46472 17 7.017 17.4477 7.017 18V21C7.017 21.5523 7.46472 22 8.017 22H13.017C13.5693 22 14.017 21.5523 14.017 21Z" /></svg>
              </div>
              <p className="text-[#94a3b8] italic mb-4 leading-relaxed">"{ref.quote}"</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{ref.name}</span>
                <span className="text-[10px] text-[#64748b] uppercase tracking-widest">{ref.location}</span>
              </div>
            </div>
          ))}
        </section>

        <footer className="text-center py-10 opacity-30">
          <img src="/logo.png" alt="KaldiFlow" className="w-8 h-8 mx-auto mb-2 mix-blend-screen" />
          <p className="text-[10px] uppercase tracking-tighter italic">Verified by Kaldi-Ops</p>
        </footer>
      </div>
    </main>
  );
}
