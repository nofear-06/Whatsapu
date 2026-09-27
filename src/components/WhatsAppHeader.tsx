import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, ArrowLeft, X, Users, Radio, Laptop, Star, Settings, CheckCheck, Moon, Sun, LogOut } from 'lucide-react';
import { AppUser } from '../types/whatsapp';

interface WhatsAppHeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  onOpenSettings: () => void;
  onOpenNewGroup: () => void;
  onMarkAllRead: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser?: AppUser | null;
  onSignOut?: () => void;
}

export const WhatsAppHeader: React.FC<WhatsAppHeaderProps> = ({
  onSearchChange,
  searchQuery,
  isSearching,
  setIsSearching,
  onOpenSettings,
  onOpenNewGroup,
  onMarkAllRead,
  isDarkMode,
  toggleDarkMode,
  currentUser,
  onSignOut,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header
      className={`relative z-30 transition-colors ${
        isDarkMode ? 'bg-[#1f2c34] text-white' : 'bg-[#075E54] text-white'
      }`}
    >
      {isSearching ? (
        /* Active Search Mode Header */
        <div className="h-14 px-3 flex items-center gap-2">
          <button
            onClick={() => {
              setIsSearching(false);
              onSearchChange('');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 text-white/90"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-white placeholder-white/60 text-base outline-none px-2"
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/80 active:bg-white/10"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        /* Standard WhatsApp Title & Actions Bar */
        <div className="h-14 px-4 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold tracking-wide text-white select-none">
            WhatsApp
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearching(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/90 active:bg-white/10 transition-colors"
              aria-label="Search chats"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white/90 active:bg-white/10 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* 3-Dots Dropdown Menu */}
              {showMenu && (
                <div
                  className={`absolute right-2 top-2 w-52 py-2 rounded shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 ${
                    isDarkMode
                      ? 'bg-[#233138] text-white/90 border border-white/5'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenNewGroup();
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-4 h-4 opacity-70" />
                    <span>New group</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      alert('Broadcast feature created for announcements');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Radio className="w-4 h-4 opacity-70" />
                    <span>New broadcast</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      alert('Linked Devices: 1 Active Web Session');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Laptop className="w-4 h-4 opacity-70" />
                    <span>Linked devices</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      alert('Starred Messages list');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Star className="w-4 h-4 opacity-70" />
                    <span>Starred messages</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onMarkAllRead();
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-500" />
                    <span>Mark all read</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setShowMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Light theme</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span>Dark theme</span>
                      </>
                    )}
                  </button>

                  <div className={`my-1 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`} />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenSettings();
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-4 h-4 opacity-70" />
                    <span>Settings</span>
                  </button>

                  {onSignOut && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSignOut();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
