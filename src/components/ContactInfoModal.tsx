import React from 'react';
import { ArrowLeft, Phone, Video, MessageSquare, Shield, Bell, Lock, Ban, ThumbsDown } from 'lucide-react';
import { Contact } from '../types/whatsapp';

interface ContactInfoModalProps {
  contact: Contact | null;
  onClose: () => void;
  onStartChat: (contact: Contact) => void;
  isDarkMode: boolean;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  contact,
  onClose,
  onStartChat,
  isDarkMode,
}) => {
  if (!contact) return null;

  return (
    <div
      className={`absolute inset-0 z-50 overflow-y-auto flex flex-col select-none transition-colors ${
        isDarkMode ? 'bg-[#111b21] text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* Header bar */}
      <div className="sticky top-0 z-10 p-3 flex items-center justify-between bg-black/40 text-white backdrop-blur-md">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm">Contact info</span>
        <div className="w-9" />
      </div>

      {/* Hero photo */}
      <div className="w-full h-72 bg-slate-800 relative overflow-hidden shrink-0 -mt-14">
        <img
          src={contact.avatar}
          alt={contact.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-2xl font-bold">{contact.name}</h2>
          <p className="text-sm opacity-80">{contact.phone || '+1 (555) 019-2834'}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className={`mx-3 my-3 p-3 rounded-2xl flex items-center justify-around shadow-sm ${
          isDarkMode ? 'bg-[#1f2c34]' : 'bg-white'
        }`}
      >
        <button
          onClick={() => {
            onStartChat(contact);
            onClose();
          }}
          className="flex flex-col items-center gap-1 text-[#00a884]"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-medium">Message</span>
        </button>

        <button
          onClick={() => alert(`Calling ${contact.name}...`)}
          className="flex flex-col items-center gap-1 text-[#00a884]"
        >
          <Phone className="w-5 h-5" />
          <span className="text-xs font-medium">Audio</span>
        </button>

        <button
          onClick={() => alert(`Video calling ${contact.name}...`)}
          className="flex flex-col items-center gap-1 text-[#00a884]"
        >
          <Video className="w-5 h-5" />
          <span className="text-xs font-medium">Video</span>
        </button>
      </div>

      {/* About & Phone */}
      <div
        className={`mx-3 mb-3 p-4 rounded-2xl shadow-sm ${
          isDarkMode ? 'bg-[#1f2c34]' : 'bg-white'
        }`}
      >
        <div className="mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">About</span>
          <p className="text-sm font-medium">{contact.about || 'Hey there! I am using WhatsApp.'}</p>
        </div>
        <div className="border-t border-gray-100 dark:border-white/5 pt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Phone</span>
          <p className="text-sm font-medium">{contact.phone || '+1 (555) 019-2834'}</p>
        </div>
      </div>

      {/* Encryption & Security */}
      <div
        className={`mx-3 mb-3 p-4 rounded-2xl shadow-sm flex items-start gap-3 ${
          isDarkMode ? 'bg-[#1f2c34]' : 'bg-white'
        }`}
      >
        <Lock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium">Encryption</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Messages and calls are end-to-end encrypted. Tap to verify.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div
        className={`mx-3 mb-3 p-4 rounded-2xl shadow-sm flex items-center justify-between ${
          isDarkMode ? 'bg-[#1f2c34]' : 'bg-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium">Mute notifications</span>
        </div>
        <span className="text-xs text-gray-400">No</span>
      </div>

      {/* Block & Report */}
      <div
        className={`mx-3 mb-6 p-2 rounded-2xl shadow-sm ${
          isDarkMode ? 'bg-[#1f2c34]' : 'bg-white'
        }`}
      >
        <button
          onClick={() => alert(`Blocked ${contact.name}`)}
          className="w-full p-2.5 flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-medium"
        >
          <Ban className="w-5 h-5" />
          <span>Block {contact.name}</span>
        </button>
        <button
          onClick={() => alert(`Reported ${contact.name}`)}
          className="w-full p-2.5 flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-medium"
        >
          <ThumbsDown className="w-5 h-5" />
          <span>Report {contact.name}</span>
        </button>
      </div>
    </div>
  );
};
