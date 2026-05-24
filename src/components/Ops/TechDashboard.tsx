'use client';

import { useState } from 'react';
import { Technician } from '../../app/mockDB';
import Link from 'next/link';

export default function TechDashboard({ tech }: { tech: Technician }) {
  const [copyStatus, setCopyStatus] = useState(false);

  // Since we are in a client component, window is available
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/p/${tech.id}`
    : `https://kaldi-platform.vercel.app/p/${tech.id}`;

  const message = `Hi, this is ${tech.name} from ${tech.companyName}. I'm heading your way! You can view my credentials and references here: ${profileUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 3000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] p-6 font-sans flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center space-y-10">
        <header>
           <div className="w-20 h-20 bg-gradient-to-br from-[#38bdf8] to-[#818cf8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#38bdf8]/20">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain mix-blend-screen brightness-110" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Ready to roll, {tech.name.split(' ')[0]}?</h1>
          <p className="text-[#94a3b8] text-sm">Send your trust profile to the homeowner before you arrive.</p>
        </header>

        <div className="space-y-4">
          <button 
            onClick={copyToClipboard}
            className="w-full bg-[#38bdf8] text-[#0a0a0c] py-6 rounded-3xl text-2xl font-black shadow-xl shadow-[#38bdf8]/20 transition active:scale-95 hover:brightness-110 flex flex-col items-center gap-2"
          >
            <span>SEND UPDATE</span>
            <span className="text-xs font-bold opacity-60 tracking-widest uppercase text-black">Tap to copy message</span>
          </button>
          
          {copyStatus && (
            <div className="bg-green-500/20 text-green-400 py-3 rounded-xl border border-green-500/30 font-bold animate-pulse text-sm">
              ✨ Professional message copied!
            </div>
          )}
        </div>

        <div className="bg-[#15171c] border border-[#2d2f36] rounded-2xl p-6 text-left space-y-4">
          <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest">The Message</h3>
          <p className="text-sm text-[#94a3b8] leading-relaxed italic line-clamp-3">
            "{message}"
          </p>
        </div>

        <Link href={`/p/${tech.id}`} className="block text-[#38bdf8] text-xs font-bold uppercase tracking-widest hover:underline opacity-60 hover:opacity-100 transition-opacity">
          Preview My Public Profile
        </Link>

        <p className="text-[10px] text-[#444] uppercase tracking-tighter">
          Kaldi-Ops v0.1.1 • Dedicated to your flow
        </p>
      </div>
    </main>
  );
}
