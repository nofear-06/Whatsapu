import React from 'react';
import { Plus, Camera, PhoneCall, Edit2 } from 'lucide-react';
import { WhatsAppTab } from '../types/whatsapp';

interface FloatingActionButtonProps {
  onClick: () => void;
  activeTab: WhatsAppTab;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  activeTab,
}) => {
  if (activeTab === 'camera') return null;

  return (
    <div className="absolute bottom-6 right-5 flex flex-col items-center gap-3 z-20">
      {activeTab === 'status' && (
        <button
          onClick={() => alert('Compose text status')}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#202c33] text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label="Text status"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-[#00796B] hover:bg-[#00695C] text-white flex items-center justify-center shadow-lg shadow-black/30 active:scale-95 transition-all cursor-pointer"
        aria-label={
          activeTab === 'chats'
            ? 'New chat'
            : activeTab === 'status'
            ? 'Add photo status'
            : 'New call'
        }
      >
        {activeTab === 'chats' && <Plus className="w-6 h-6 stroke-[2.5]" />}
        {activeTab === 'status' && <Camera className="w-6 h-6" />}
        {activeTab === 'calls' && <PhoneCall className="w-5 h-5" />}
      </button>
    </div>
  );
};
