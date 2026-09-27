import React from 'react';
import {
  ArrowLeft,
  Key,
  Lock,
  MessageCircle,
  Bell,
  HardDrive,
  Globe,
  HelpCircle,
  QrCode,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import { AppUser } from '../types/whatsapp';

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser?: AppUser | null;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isDarkMode,
  toggleDarkMode,
  currentUser,
  onSignOut,
}) => {
  return (
    <div
      className={`absolute inset-0 z-50 overflow-y-auto flex flex-col select-none transition-colors ${
        isDarkMode ? 'bg-[#111b21] text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Header */}
      <header
        className={`h-14 px-3 flex items-center gap-3 sticky top-0 z-10 select-none shadow-sm ${
          isDarkMode ? 'bg-[#1f2c34] text-white' : 'bg-[#075E54] text-white'
        }`}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-[18px] font-semibold">Settings</h2>
      </header>

      {/* User profile card */}
      <div
        className={`p-4 flex items-center justify-between border-b ${
          isDarkMode ? 'border-white/5' : 'border-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200">
            <img
              src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.displayName || 'User')}`}
              alt={currentUser?.displayName || 'My Profile'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{currentUser?.displayName || 'WhatsApp User'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentUser?.phoneNumber || currentUser?.email || 'Active on WhatsApp'}
            </p>
            <p className="text-[11px] text-[#00a884] font-medium mt-0.5">
              {currentUser?.about || 'Hey there! I am using WhatsApp.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Your personal WhatsApp QR Code')}
          className="p-2 text-[#00a884] hover:bg-emerald-500/10 rounded-full"
          aria-label="QR Code"
        >
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      {/* Options list */}
      <div className="py-2">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <div className="text-gray-500">
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </div>
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Appearance</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Currently {isDarkMode ? 'Dark theme' : 'Light theme'}
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Account security settings')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <Key className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Account</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Security notifications, change number
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Privacy settings')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <Lock className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Privacy</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Block contacts, disappearing messages
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Chats settings')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Chats</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Theme, wallpapers, chat history
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Notification settings')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <Bell className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Notifications</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Message, group & call tones
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Storage and data')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <HardDrive className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Storage and data</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Network usage, auto-download
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('App language: English (phone language)')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <Globe className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">App language</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              English (device language)
            </p>
          </div>
        </button>

        <button
          onClick={() => alert('Help center')}
          className={`w-full flex items-center gap-5 px-5 py-3.5 transition-colors ${
            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
          }`}
        >
          <HelpCircle className="w-5 h-5 text-gray-500" />
          <div className="text-left flex-1">
            <h4 className="text-[15px] font-medium">Help</h4>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Help center, contact us, privacy policy
            </p>
          </div>
        </button>

        {onSignOut && (
          <div className="px-5 pt-3 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
