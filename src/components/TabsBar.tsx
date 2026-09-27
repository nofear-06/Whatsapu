import React from 'react';
import { Camera } from 'lucide-react';
import { WhatsAppTab } from '../types/whatsapp';

interface TabsBarProps {
  activeTab: WhatsAppTab;
  onTabChange: (tab: WhatsAppTab) => void;
  unreadChatsCount: number;
  hasStatusUpdates: boolean;
  isDarkMode: boolean;
}

export const TabsBar: React.FC<TabsBarProps> = ({
  activeTab,
  onTabChange,
  unreadChatsCount,
  hasStatusUpdates,
  isDarkMode,
}) => {
  return (
    <nav
      className={`relative select-none border-b transition-colors ${
        isDarkMode
          ? 'bg-[#1f2c34] text-white/70 border-white/5'
          : 'bg-[#075E54] text-white/75 border-black/10'
      }`}
      aria-label="WhatsApp Tabs"
    >
      <div className="flex items-center text-sm font-semibold tracking-wider">
        {/* Camera Tab (Narrow width) */}
        <button
          onClick={() => onTabChange('camera')}
          className={`h-12 w-12 flex items-center justify-center transition-colors relative ${
            activeTab === 'camera' ? 'text-white' : 'hover:text-white/90'
          }`}
          aria-label="Camera"
        >
          <Camera className="w-5 h-5" />
          {activeTab === 'camera' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-sm" />
          )}
        </button>

        {/* CHATS Tab */}
        <button
          onClick={() => onTabChange('chats')}
          className={`flex-1 h-12 flex items-center justify-center gap-1.5 transition-colors relative uppercase text-[13px] font-bold ${
            activeTab === 'chats' ? 'text-white' : 'hover:text-white/90'
          }`}
        >
          <span>CHATS</span>
          {unreadChatsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#075E54] text-[11px] font-bold flex items-center justify-center">
              {unreadChatsCount}
            </span>
          )}
          {activeTab === 'chats' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-sm" />
          )}
        </button>

        {/* STATUS Tab */}
        <button
          onClick={() => onTabChange('status')}
          className={`flex-1 h-12 flex items-center justify-center gap-1.5 transition-colors relative uppercase text-[13px] font-bold ${
            activeTab === 'status' ? 'text-white' : 'hover:text-white/90'
          }`}
        >
          <span>STATUS</span>
          {hasStatusUpdates && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
          {activeTab === 'status' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-sm" />
          )}
        </button>

        {/* CALLS Tab */}
        <button
          onClick={() => onTabChange('calls')}
          className={`flex-1 h-12 flex items-center justify-center gap-1.5 transition-colors relative uppercase text-[13px] font-bold ${
            activeTab === 'calls' ? 'text-white' : 'hover:text-white/90'
          }`}
        >
          <span>CALLS</span>
          {activeTab === 'calls' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-sm" />
          )}
        </button>
      </div>
    </nav>
  );
};
