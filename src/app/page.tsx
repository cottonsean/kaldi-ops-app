'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
          KaldiFlow Platform v0.1.0
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="w-40 h-40 bg-white/5 rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-[#38bdf8]/10 border border-white/10 relative group overflow-hidden">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            {/* Final Rearing Goat Logo - newGoatFinal.png */}
            <img 
              src="/logo.png" 
              alt="KaldiFlow Logo" 
              className="w-32 h-32 object-contain z-10 mix-blend-screen brightness-110 contrast-110" 
            />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">
            KaldiFlow
          </span>
        </h1>
        
        <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto font-medium">
          Professional Operations Command for Trade Professionals.
        </p>
        <p className="text-md text-[#64748b] max-w-2xl mx-auto italic">
          Excellence • Heritage • Accessibility
        </p>

        <div className="flex justify-center mt-8">
          <a 
            href="#" 
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[#38bdf8] font-bold hover:bg-white/10 transition-all group"
            onClick={(e) => {
              e.preventDefault();
              alert("The KaldiFlow Desktop Suite is currently being compiled. Mobile PWA is ready for field use.");
            }}
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6l4.25 2.52.75-1.23-3-1.79V7z"/>
            </svg>
            Download Desktop
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {/* Kaldi-Ops Card */}
          <Link href="/ops" className="group p-6 bg-gradient-to-br from-[#15171c] to-[#1a1c23] border border-[#38bdf8]/30 rounded-xl hover:border-[#38bdf8] transition-all text-left relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold text-[#38bdf8]">FLAGSHIP</span>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[#38bdf8] transition-colors">Kaldi-Ops</h3>
            <p className="text-[#94a3b8] text-sm">
              The trade professional command center. Manage jobs, trust, and observations from the field.
            </p>
          </Link>

          {/* Kaldi-Kapture Card */}
          <Link href="/kapture" className="group p-6 bg-[#15171c] border border-[#2d2f36] rounded-xl hover:border-[#38bdf8] transition-all text-left relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold text-[#38bdf8]/50 group-hover:text-[#38bdf8]">v0.1.1</span>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[#38bdf8] transition-colors">Kaldi-Kapture</h3>
            <p className="text-[#94a3b8] text-sm">
              Precision system capture and visual documentation. Built for the driveway and the attic.
            </p>
          </Link>

          {/* Kaldi-Edit Card */}
          <Link href="/editor" className="group p-6 bg-[#15171c] border border-[#2d2f36] rounded-xl hover:border-[#38bdf8] transition-all text-left relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold text-[#38bdf8]/50 group-hover:text-[#38bdf8]">v0.1.2</span>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[#38bdf8] transition-colors">Kaldi-Edit</h3>
            <p className="text-[#94a3b8] text-sm">
              Fast, multi-tab editing stripped of the noise. The tool that stays within reach so you can keep moving.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
