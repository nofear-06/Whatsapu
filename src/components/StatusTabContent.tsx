import React from 'react';
import { Plus } from 'lucide-react';
import { StatusItem } from '../types/whatsapp';

interface StatusTabContentProps {
  statuses: StatusItem[];
  onSelectStatus: (status: StatusItem) => void;
  isDarkMode: boolean;
}

export const StatusTabContent: React.FC<StatusTabContentProps> = ({
  statuses,
  onSelectStatus,
  isDarkMode,
}) => {
  const recentStatuses = statuses.filter((s) => !s.viewed);
  const viewedStatuses = statuses.filter((s) => s.viewed);

  return (
    <div className="flex-1 overflow-y-auto pb-20 select-none">
      {/* My Status */}
      <div
        className={`flex items-center px-4 py-3.5 transition-colors cursor-pointer ${
          isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
        }`}
        onClick={() => alert('Add to your status: Share a photo, video, or text')}
      >
        <div className="relative mr-3 shrink-0">
          <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <img
              src="/src/assets/images/avatar_leon_1790508448213.jpg"
              alt="My Status"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#00a884] text-white flex items-center justify-center border-2 border-white dark:border-[#111b21]">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        </div>

        <div className="flex-1">
          <h3 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My status
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Tap to add status update
          </p>
        </div>
      </div>

      {/* Recent Updates Header */}
      {recentStatuses.length > 0 && (
        <div
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
            isDarkMode ? 'bg-[#182229] text-gray-400' : 'bg-gray-100/70 text-gray-500'
          }`}
        >
          Recent updates
        </div>
      )}

      {/* Recent Updates List */}
      {recentStatuses.map((status) => (
        <div
          key={status.id}
          onClick={() => onSelectStatus(status)}
          className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
          }`}
        >
          <div className="relative mr-3 shrink-0 p-0.5 rounded-full ring-2 ring-[#25D366]">
            <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-slate-200">
              <img
                src={status.contact.avatar}
                alt={status.contact.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div
            className={`flex-1 border-b pb-2 ${
              isDarkMode ? 'border-white/5' : 'border-gray-100'
            }`}
          >
            <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {status.contact.name}
            </h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              {status.timestamp}
            </p>
          </div>
        </div>
      ))}

      {/* Viewed Updates Header */}
      {viewedStatuses.length > 0 && (
        <div
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
            isDarkMode ? 'bg-[#182229] text-gray-400' : 'bg-gray-100/70 text-gray-500'
          }`}
        >
          Viewed updates
        </div>
      )}

      {/* Viewed Updates List */}
      {viewedStatuses.map((status) => (
        <div
          key={status.id}
          onClick={() => onSelectStatus(status)}
          className={`flex items-center px-4 py-3 cursor-pointer transition-colors opacity-75 ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
          }`}
        >
          <div className="relative mr-3 shrink-0 p-0.5 rounded-full ring-2 ring-gray-300 dark:ring-gray-600">
            <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-slate-200">
              <img
                src={status.contact.avatar}
                alt={status.contact.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div
            className={`flex-1 border-b pb-2 ${
              isDarkMode ? 'border-white/5' : 'border-gray-100'
            }`}
          >
            <h4 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {status.contact.name}
            </h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              {status.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
