import React from 'react';
import { Link2, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus } from 'lucide-react';
import { CallItem } from '../types/whatsapp';

interface CallsTabContentProps {
  calls: CallItem[];
  onStartCall: (call: CallItem) => void;
  isDarkMode: boolean;
}

export const CallsTabContent: React.FC<CallsTabContentProps> = ({
  calls,
  onStartCall,
  isDarkMode,
}) => {
  const renderCallIcon = (type: CallItem['type']) => {
    switch (type) {
      case 'missed':
        return <PhoneMissed className="w-3.5 h-3.5 text-rose-500 inline mr-1" />;
      case 'incoming':
        return <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />;
      case 'outgoing':
        return <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 select-none">
      {/* Create Call Link */}
      <div
        onClick={() => alert('Call link copied to clipboard: https://call.whatsapp.com/v/example123')}
        className={`flex items-center px-4 py-3.5 cursor-pointer transition-colors ${
          isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
        }`}
      >
        <div className="w-[50px] h-[50px] rounded-full bg-[#00a884] text-white flex items-center justify-center mr-3 shrink-0 shadow-sm">
          <Link2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create a call link
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Share a link for your WhatsApp call
          </p>
        </div>
      </div>

      {/* Recent Calls Header */}
      <div
        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
          isDarkMode ? 'bg-[#182229] text-gray-400' : 'bg-gray-100/70 text-gray-500'
        }`}
      >
        Recent
      </div>

      {/* Calls list */}
      {calls.map((call) => (
        <div
          key={call.id}
          className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/[0.02]'
          }`}
          onClick={() => onStartCall(call)}
        >
          <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-slate-200 mr-3 shrink-0">
            <img
              src={call.contact.avatar}
              alt={call.contact.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className={`flex-1 min-w-0 border-b pb-2 flex items-center justify-between ${
              isDarkMode ? 'border-white/5' : 'border-gray-100'
            }`}
          >
            <div className="min-w-0 pr-2">
              <h4
                className={`text-[15px] font-medium truncate ${
                  call.type === 'missed'
                    ? 'text-rose-500'
                    : isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                }`}
              >
                {call.contact.name}
              </h4>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 flex items-center">
                {renderCallIcon(call.type)}
                <span>{call.timestamp}</span>
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartCall(call);
              }}
              className="p-2 text-[#00a884] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full"
              aria-label={`Call ${call.contact.name}`}
            >
              {call.callType === 'video' ? (
                <Video className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
