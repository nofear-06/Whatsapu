import React, { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Chat } from '../types/whatsapp';

interface ChatListItemProps {
  chat: Chat;
  onSelectChat: (chat: Chat) => void;
  onAvatarClick?: (chat: Chat) => void;
  isDarkMode: boolean;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onSelectChat,
  onAvatarClick,
  isDarkMode,
}) => {
  const [imageError, setImageError] = useState(false);
  const { contact, lastMessage, unreadCount } = chat;

  const renderStatusTicks = () => {
    if (lastMessage.sender !== 'me') return null;

    if (lastMessage.status === 'read') {
      return <CheckCheck className="w-4 h-4 text-[#34B7F1] shrink-0 inline mr-1" />;
    }
    if (lastMessage.status === 'delivered') {
      return <CheckCheck className="w-4 h-4 text-gray-400 shrink-0 inline mr-1" />;
    }
    return <Check className="w-4 h-4 text-gray-400 shrink-0 inline mr-1" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div
      onClick={() => onSelectChat(chat)}
      className={`flex items-center px-4 py-3 cursor-pointer select-none transition-colors active:scale-[0.99] ${
        isDarkMode
          ? 'hover:bg-white/5 active:bg-white/10'
          : 'hover:bg-black/[0.02] active:bg-black/[0.05]'
      }`}
    >
      {/* Contact Avatar */}
      <div
        onClick={(e) => {
          if (onAvatarClick) {
            e.stopPropagation();
            onAvatarClick(chat);
          }
        }}
        className="relative shrink-0 mr-3 cursor-pointer"
        title={`View ${contact.name}'s info`}
      >
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-sm">
          {!imageError && contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {getInitials(contact.name)}
            </span>
          )}
        </div>
        {contact.isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-white dark:border-[#111b21]" />
        )}
      </div>

      {/* Chat Details & Last Message */}
      <div
        className={`flex-1 min-w-0 pb-1 flex flex-col justify-center border-b ${
          isDarkMode ? 'border-white/5' : 'border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <h2
            className={`text-[16px] font-medium truncate ${
              isDarkMode ? 'text-white' : 'text-[#111b21]'
            }`}
          >
            {contact.name}
          </h2>
          <span
            className={`text-[12px] whitespace-nowrap font-normal ml-2 ${
              unreadCount > 0
                ? 'text-[#25D366] font-semibold'
                : isDarkMode
                ? 'text-white/50'
                : 'text-gray-500'
            }`}
          >
            {lastMessage.timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-[14px] truncate text-slate-500 dark:text-slate-400 pr-2">
            {renderStatusTicks()}
            <span className="truncate">{lastMessage.text}</span>
          </div>

          {unreadCount > 0 && (
            <span className="shrink-0 min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold flex items-center justify-center leading-none">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
