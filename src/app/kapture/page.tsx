'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { invoke } from '@tauri-apps/api/core';

export default function KapturePage() {
  const [isTauri, setIsTauri] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [cropStart, setCropArea] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      setIsTauri(true);
    }
  }, []);

  const takeScreenshot = async () => {
    if (isTauri) {
      try {
        await invoke('kapture');
      } catch (err) {
        console.error("Native capture failed:", err);
      }
    }

    let activeStream = stream;
    let autoStop = false;

    if (!activeStream) {
      try {
        activeStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        autoStop = true;
      } catch (err) { return; }
    }

    const video = document.createElement('video');
    video.srcObject = activeStream;
    video.play();
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const canvas = document.createElement('canvas');
    const track = activeStream.getVideoTracks()[0];
    const settings = track.getSettings();
    canvas.width = settings.width || 1920;
    canvas.height = settings.height || 1080;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/png'));
    setIsCropping(true);

    if (autoStop) activeStream.getTracks().forEach(t => t.stop());
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping || !overlayCanvasRef.current) return;
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    setCropArea({ x: e.clientX - rect.left, y: e.clientY - rect.top, w: 0, h: 0 });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !overlayCanvasRef.current) return;
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    setCropArea(prev => ({ ...prev, w: (e.clientX - rect.left) - prev.x, h: (e.clientY - rect.top) - prev.y }));
    drawOverlay();
  };

  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropStart.x, cropStart.y, cropStart.w, cropStart.h);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropStart.x, cropStart.y, cropStart.w, cropStart.h);
  }, [cropStart]);

  useEffect(() => { if (isCropping) drawOverlay(); }, [isCropping, drawOverlay]);

  const confirmCrop = async () => {
    if (!capturedImage) return;
    const img = new Image();
    img.src = capturedImage;
    await img.decode();
    const canvas = document.createElement('canvas');
    const displayCanvas = overlayCanvasRef.current;
    if (!displayCanvas) return;
    const scaleX = img.width / displayCanvas.width;
    const scaleY = img.height / displayCanvas.height;
    canvas.width = Math.abs(cropStart.w * scaleX);
    canvas.height = Math.abs(cropStart.h * scaleY);
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, Math.min(cropStart.x, cropStart.x + cropStart.w) * scaleX, Math.min(cropStart.y, cropStart.y + cropStart.h) * scaleY, Math.abs(cropStart.w * scaleX), Math.abs(cropStart.h * scaleY), 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
        setIsCropping(false);
        setCapturedImage(null);
      }
    }, 'image/png');
  };

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      let finalStream = displayStream;
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        finalStream = new MediaStream([...displayStream.getTracks(), ...audioStream.getAudioTracks()]);
      } catch (e) {}
      setStream(finalStream);
      const recorder = new MediaRecorder(finalStream, { mimeType: 'video/webm;codecs=vp9' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        setRecordedBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
        chunksRef.current = [];
        finalStream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current = recorder; recorder.start(); setIsRecording(true);
    } catch (err) { alert("Permissions required."); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); setStream(null); } };
  const downloadRecording = () => { if (recordedBlob) { const url = URL.createObjectURL(recordedBlob); const a = document.createElement('a'); a.href = url; a.download = `kaldi-kapture-${Date.now()}.webm`; a.click(); } };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain mix-blend-screen brightness-110" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold leading-tight">Kaldi-Kapture <span className="text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded border border-[#38bdf8]/20 ml-2">v0.1.1</span></h1>
              <Link href="/" className="text-[10px] text-[#38bdf8] hover:underline uppercase tracking-widest opacity-70">Visit Dashboard</Link>
            </div>
          </div>
          {isTauri && <div className="bg-[#38bdf8]/10 text-[#38bdf8] text-xs font-bold px-3 py-1 rounded-full border border-[#38bdf8]/20">DESKTOP NATIVE</div>}
        </header>

        {isCropping && capturedImage ? (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8">
            <div className="mb-6 flex gap-4">
              <button onClick={() => { setIsCropping(false); setCapturedImage(null); }} className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition">Cancel</button>
              <button onClick={confirmCrop} className="px-8 py-2 bg-[#38bdf8] text-black font-bold rounded-lg hover:scale-105 transition">Copy Selection</button>
            </div>
            <div className="relative max-w-full max-h-[80vh] overflow-hidden rounded-xl border border-[#38bdf8]/30">
              <img src={capturedImage} className="max-w-full max-h-[80vh] block" alt="Captured" />
              <canvas ref={overlayCanvasRef} width={800} height={600} className="absolute inset-0 cursor-crosshair w-full h-full" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} />
            </div>
            <p className="mt-4 text-[#94a3b8]">Drag to select the area you want to kapture.</p>
          </div>
        ) : (
          <div className="bg-[#15171c] border border-[#2d2f36] rounded-2xl p-8 text-center shadow-2xl">
            {!recordedBlob && !isRecording && (
              <div className="py-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 overflow-hidden">
                   <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain mix-blend-screen" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Utility Sequence</h2>
                <div className="flex gap-4 justify-center">
                  <button onClick={startRecording} className="bg-[#38bdf8] text-[#000] px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 transition">Start Recording</button>
                  <button onClick={takeScreenshot} className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold text-lg border border-white/10 hover:bg-white/20 transition">Precision Kapture</button>
                </div>
                {copyStatus && <div className="mt-4 text-[#38bdf8] font-bold animate-bounce">✨ Copied to Clipboard!</div>}
              </div>
            )}
            {isRecording && (
              <div className="py-20">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                  <div className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center"><div className="w-8 h-8 bg-white rounded-sm"></div></div>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-red-500">Recording...</h2>
                <div className="flex gap-4 justify-center">
                  <button onClick={stopRecording} className="bg-white text-black px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-200">Stop & Preview</button>
                  <button onClick={takeScreenshot} className="bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#38bdf8]/30">Instant Snap</button>
                </div>
                {copyStatus && <div className="mt-4 text-[#38bdf8] font-bold">✨ Copied!</div>}
              </div>
            )}
            {recordedBlob && !isRecording && (
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-6">Preview Recording</h2>
                <video src={URL.createObjectURL(recordedBlob)} controls className="w-full rounded-xl border border-[#2d2f36] shadow-xl mb-8 max-h-[400px]" />
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setRecordedBlob(null)} className="px-6 py-3 rounded-xl font-bold border border-[#2d2f36] text-[#94a3b8] hover:bg-white/5 transition">Discard</button>
                  <button onClick={downloadRecording} className="bg-[#38bdf8] text-[#000] px-8 py-3 rounded-xl font-bold transition hover:scale-105 shadow-lg">Download .webm</button>
                </div>
              </div>
            )}
          </div>
        )}

        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-[#15171c]/50 rounded-xl border border-[#2d2f36]">
            <h3 className="font-bold mb-2 text-[#38bdf8]">Precision Crop</h3>
            <p className="text-sm text-[#94a3b8]">Snagit-style area selection. Only capture what you need.</p>
          </div>
          <div className="p-6 bg-[#15171c]/50 rounded-xl border border-[#2d2f36]">
            <h3 className="font-bold mb-2 text-[#38bdf8]">Auto Copy</h3>
            <p className="text-sm text-[#94a3b8]">Automatically copies to your clipboard for instant sharing.</p>
          </div>
          <div className="p-6 bg-[#15171c]/50 rounded-xl border border-[#2d2f36]">
            <h3 className="font-bold mb-2 text-[#38bdf8]">Local Privacy</h3>
            <p className="text-sm text-[#94a3b8]">All processing happens locally. No servers, no tracking.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
