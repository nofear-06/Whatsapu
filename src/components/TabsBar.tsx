import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Camera } from 'lucide-react';
import { WhatsAppTab } from '../types/whatsapp';

interface TabsBarProps {
  activeTab: WhatsAppTab;
  onTabChange: (tab: WhatsAppTab) => void;
  unreadChatsCount: number;
  hasStatusUpdates: boolean;
  isDarkMode: boolean;
  realtimeTabFraction?: number;
  isDragging?: boolean;
}

const TABS: WhatsAppTab[] = ['camera', 'chats', 'status', 'calls'];

export const TabsBar: React.FC<TabsBarProps> = ({
  activeTab,
  onTabChange,
  unreadChatsCount,
  hasStatusUpdates,
  isDarkMode,
  realtimeTabFraction,
  isDragging = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tab0Ref = useRef<HTMLButtonElement>(null);
  const tab1Ref = useRef<HTMLButtonElement>(null);
  const tab2Ref = useRef<HTMLButtonElement>(null);
  const tab3Ref = useRef<HTMLButtonElement>(null);

  const [tabLayouts, setTabLayouts] = useState<{ left: number; width: number }[]>([]);

  const measureTabs = () => {
    const refs = [tab0Ref.current, tab1Ref.current, tab2Ref.current, tab3Ref.current];
    if (refs.some((r) => !r)) return;
    const layouts = refs.map((btn) => ({
      left: btn?.offsetLeft ?? 0,
      width: btn?.offsetWidth ?? 0,
    }));
    setTabLayouts(layouts);
  };

  useLayoutEffect(() => {
    measureTabs();
  }, []);

  useEffect(() => {
    const handleResize = () => measureTabs();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeIndex = TABS.indexOf(activeTab);
  const currentFraction =
    typeof realtimeTabFraction === 'number'
      ? Math.max(0, Math.min(3, realtimeTabFraction))
      : activeIndex;

  // Compute interpolated indicator position
  let indicatorStyle: React.CSSProperties = { opacity: 0 };
  if (tabLayouts.length === 4) {
    const floorIndex = Math.floor(currentFraction);
    const ceilIndex = Math.min(3, floorIndex + 1);
    const progress = currentFraction - floorIndex;

    const from = tabLayouts[floorIndex];
    const to = tabLayouts[ceilIndex];

    if (from && to) {
      const left = from.left + (to.left - from.left) * progress;
      const width = from.width + (to.width - from.width) * progress;

      indicatorStyle = {
        transform: `translateX(${left}px)`,
        width: `${width}px`,
        opacity: 1,
        transition: isDragging
          ? 'none'
          : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), width 0.28s cubic-bezier(0.25, 1, 0.5, 1)',
      };
    }
  }

  return (
    <nav
      ref={containerRef}
      className={`relative select-none border-b transition-colors ${
        isDarkMode
          ? 'bg-[#1f2c34] text-white/70 border-white/5'
          : 'bg-[#075E54] text-white/75 border-black/10'
      }`}
      aria-label="WhatsApp Tabs"
    >
      <div className="flex items-center text-sm font-semibold tracking-wider relative">
        {/* Camera Tab (Narrow width) */}
        <button
          ref={tab0Ref}
          onClick={() => onTabChange('camera')}
          className={`h-12 w-12 flex items-center justify-center transition-colors relative cursor-pointer ${
            activeTab === 'camera' ? 'text-white' : 'hover:text-white/90 text-white/70'
          }`}
          aria-label="Camera"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* CHATS Tab */}
        <button
          ref={tab1Ref}
          onClick={() => onTabChange('chats')}
          className={`flex-1 h-12 flex items-center justify-center gap-1.5 transition-colors relative uppercase text-[13px] font-bold cursor-pointer ${
            activeTab === 'chats' ? 'text-white' : 'hover:text-white/90 text-white/70'
          }`}
        >
          <span>CHATS</span>
          {unreadChatsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#075E54] text-[11px] font-bold flex items-center justify-center">
              {unreadChatsCount}
            </span>
          )}
        </button>

        {/* STATUS Tab */}
        <button
          ref={tab2Ref}
          onClick={() => onTabChange('status')}
          className={`flex-1 h-12 flex items-center justify-center gap-1.5 transition-colors relative uppercase text-[13px] font-bold cursor-pointer ${
            activeTab === 'status' ? 'text-white' : 'hover:text-white/90 text-white/70'
          }`}
        >
          <span>STATUS</span>
          {hasStatusUpdates && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </button>

        {/* CALLS Tab */}
        <button
          ref={tab3Ref}
          onClick={() => onTabChange('calls')}
          className={`flex-1 h-12 flex items-center justify-center gap-1.5 transition-colors relative uppercase text-[13px] font-bold cursor-pointer ${
            activeTab === 'calls' ? 'text-white' : 'hover:text-white/90 text-white/70'
          }`}
        >
          <span>CALLS</span>
        </button>

        {/* Active Underline Indicator Bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-white rounded-t-sm pointer-events-none will-change-transform z-10"
          style={indicatorStyle}
        />
      </div>
    </nav>
  );
};
