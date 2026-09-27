import React, { useState } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import { AppUser } from '../types/whatsapp';

interface UserListItemProps {
  user: AppUser;
  onStartChat: (user: AppUser) => void;
  isDarkMode: boolean;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  onStartChat,
  isDarkMode,
}) => {
  const [imgError, setImgError] = useState(false);

  const avatarUrl =
    user.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.displayName || user.uid)}`;

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
      onClick={() => onStartChat(user)}
      className={`flex items-center px-4 py-3 cursor-pointer select-none transition-colors active:scale-[0.99] border-b ${
        isDarkMode
          ? 'hover:bg-white/5 active:bg-white/10 border-white/5'
          : 'hover:bg-black/[0.02] active:bg-black/[0.05] border-gray-100'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0 mr-3.5">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-xs">
          {!imgError ? (
            <img
              src={avatarUrl}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {getInitials(user.displayName || 'U')}
            </span>
          )}
        </div>
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-white dark:border-[#111b21]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between mb-0.5">
          <h3
            className={`text-[15px] font-semibold truncate ${
              isDarkMode ? 'text-white' : 'text-[#111b21]'
            }`}
          >
            {user.displayName || 'WhatsApp User'}
          </h3>
          <span className="text-[11px] text-emerald-500 font-medium">
            {user.isOnline ? 'Online' : 'Available'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate pr-2">
            {user.about || user.phoneNumber || user.email || 'Hey there! I am using WhatsApp.'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(user);
            }}
            className="px-2.5 py-1 rounded-full bg-[#00a884]/15 hover:bg-[#00a884]/25 text-[#00a884] font-semibold text-xs flex items-center gap-1 transition-colors shrink-0"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
