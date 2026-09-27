import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Video, VideoOff } from 'lucide-react';
import { Contact, CallItem } from '../types/whatsapp';

interface ActiveCallModalProps {
  call: CallItem | null;
  onEndCall: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({ call, onEndCall }) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!call) return;
    setSeconds(0);
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [call]);

  if (!call) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#075E54] flex flex-col justify-between p-8 text-white select-none animate-in fade-in duration-200">
      {/* Top Details */}
      <div className="text-center mt-6">
        <h3 className="text-2xl font-bold mb-1">{call.contact.name}</h3>
        <p className="text-sm text-emerald-100/90 font-medium">
          {call.callType === 'video' ? 'WhatsApp Video Call' : 'WhatsApp Voice Call'} · {formatTime(seconds)}
        </p>
      </div>

      {/* Center Avatar */}
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative mb-4">
          <img
            src={call.contact.avatar}
            alt={call.contact.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xs text-white/70">🔒 End-to-end encrypted</span>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-6 mb-4">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isMuted ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {call.callType === 'video' && (
            <button
              onClick={() => setIsVideoOff((prev) => !prev)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isVideoOff ? 'bg-white text-gray-900' : 'bg-white/20 text-white'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="End call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
