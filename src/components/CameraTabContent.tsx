import React, { useState } from 'react';
import { Camera, RefreshCw, Zap, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface CameraTabContentProps {
  onCapturePhoto: (url: string) => void;
  onClose: () => void;
}

export const CameraTabContent: React.FC<CameraTabContentProps> = ({
  onCapturePhoto,
  onClose,
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  const sampleSnapshots = [
    '/src/assets/images/avatar_leon_1790508448213.jpg',
    '/src/assets/images/avatar_jemma_1790508459477.jpg',
    '/src/assets/images/avatar_arturo_1790508471926.jpg',
    '/src/assets/images/avatar_adam_1790508483035.jpg',
  ];

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col justify-between select-none">
      {/* Top Camera Controls */}
      <div className="p-4 flex items-center justify-between text-white z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setFlashOn((prev) => !prev)}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            flashOn ? 'bg-amber-400 text-black' : 'bg-black/40 text-white'
          }`}
          aria-label="Toggle flash"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Simulated Viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-black relative">
          {/* Subtle grid crosshairs */}
          <div className="w-48 h-48 border border-white/20 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 bg-emerald-400/80 rounded-full animate-ping" />
          </div>

          <div className="absolute bottom-6 text-center text-xs text-white/70">
            Hold for video, tap for photo
          </div>
        </div>
      </div>

      {/* Gallery Roll Thumbnails */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto bg-black/60 backdrop-blur-md">
        {sampleSnapshots.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onCapturePhoto(img)}
            className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 border-white/30 hover:border-emerald-400 active:scale-95 transition-all"
          >
            <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Bottom Shutter Controls */}
      <div className="p-6 bg-black flex items-center justify-around">
        <button
          onClick={() => onCapturePhoto(sampleSnapshots[0])}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
          aria-label="Open gallery"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Shutter Button */}
        <button
          onClick={() => onCapturePhoto(sampleSnapshots[0])}
          className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform"
          aria-label="Take photo"
        >
          <div className="w-full h-full rounded-full bg-white active:bg-gray-300" />
        </button>

        {/* Camera Switch */}
        <button
          onClick={() => setIsFrontCamera((prev) => !prev)}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
          aria-label="Switch camera"
        >
          <RefreshCw className={`w-5 h-5 transition-transform ${isFrontCamera ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
