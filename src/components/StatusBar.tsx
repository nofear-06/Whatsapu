import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryMedium } from 'lucide-react';

interface StatusBarProps {
  dark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ dark = false }) => {
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Format 12-hour or 24-hour style
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`h-7 px-4 flex items-center justify-between text-xs select-none transition-colors ${
        dark ? 'bg-[#0f171e] text-white/90' : 'bg-[#054c44] text-white/90'
      }`}
    >
      <div className="flex items-center gap-2 font-medium tracking-tight">
        <span>{timeStr}</span>
        {/* Subtle WhatsApp notification icon */}
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] text-emerald-400">
          ●
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-white/90">
        <Wifi className="w-3.5 h-3.5" />
        <Signal className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">85%</span>
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
