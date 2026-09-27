import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  activeTab: 'camera' | 'chats' | 'status' | 'calls';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  activeTab,
}) => {
  if (activeTab === 'camera') return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-[#00796B] hover:bg-[#00695C] text-white flex items-center justify-center shadow-lg shadow-black/30 active:scale-95 transition-all z-20 cursor-pointer"
      aria-label="New chat or action"
    >
      <Plus className="w-6 h-6 stroke-[2.5]" />
    </button>
  );
};
