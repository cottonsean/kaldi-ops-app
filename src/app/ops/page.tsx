'use client';

import Link from 'next/link';

export default function OpsMarketingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-16 py-20">
        <header className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#38bdf8] to-[#818cf8] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#38bdf8]/20">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mix-blend-screen brightness-110" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Kaldi-Ops</h1>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Professional Operations Command for high-velocity trade professionals. Built to solve the trust gap between "good people" and their customers.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#15171c] border border-[#2d2f36] rounded-3xl p-8 space-y-4">
            <h2 className="text-[#38bdf8] font-bold uppercase tracking-widest text-xs">The Wedge</h2>
            <h3 className="text-2xl font-bold">One-Tap Trust Profiles</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Send a professional, pre-written text message to your client as you head to the job. It includes your credentials and references, proving you're the right person for the task before you even arrive.
            </p>
          </div>
          <div className="bg-[#15171c] border border-[#2d2f36] rounded-3xl p-8 space-y-4">
            <h2 className="text-[#38bdf8] font-bold uppercase tracking-widest text-xs">The Momentum</h2>
            <h3 className="text-2xl font-bold">Field-First Utility</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              No bloated forms. No complicated apps. Just a high-velocity dashboard designed for a quick thumb-tap in a hot driveway. Put it where the goats can get it.
            </p>
          </div>
        </section>

        <div className="text-center pt-10">
          <div className="inline-block bg-white/5 border border-white/10 px-8 py-4 rounded-2xl space-y-2">
            <p className="text-sm font-bold text-[#38bdf8] uppercase tracking-widest">Active Beta</p>
            <p className="text-xs text-[#64748b]">Private concierge onboarding only.</p>
          </div>
        </div>

        <footer className="text-center text-[10px] text-[#444] uppercase tracking-widest pt-20">
          A KaldiFlow Flagship Utility • Excellence • Heritage • Accessibility
        </footer>
      </div>
    </main>
  );
}
