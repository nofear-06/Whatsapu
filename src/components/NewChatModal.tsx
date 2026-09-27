import React, { useState } from 'react';
import { ArrowLeft, Search, Users, UserPlus, Sparkles } from 'lucide-react';
import { Contact, Chat } from '../types/whatsapp';

interface NewChatModalProps {
  contacts: Contact[];
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  isDarkMode: boolean;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  onClose,
  onSelectContact,
  isDarkMode,
}) => {
  const [query, setQuery] = useState('');

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col select-none transition-colors ${
        isDarkMode ? 'bg-[#111b21] text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Header */}
      <header
        className={`h-14 px-3 flex items-center justify-between select-none shadow-sm ${
          isDarkMode ? 'bg-[#1f2c34] text-white' : 'bg-[#075E54] text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-[17px] font-semibold leading-tight">Select contact</h2>
            <p className="text-[12px] text-white/80 leading-tight">
              {contacts.length} contacts
            </p>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Search Input Filter */}
      <div className={`p-2 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts..."
          className={`w-full py-1.5 px-3 rounded-lg text-sm outline-none ${
            isDarkMode ? 'bg-[#202c33] text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900'
          }`}
        />
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick actions */}
        <div className="py-2 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={() => alert('New Group setup: Select members to create group')}
            className={`w-full flex items-center gap-4 px-4 py-2.5 transition-colors ${
              isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-medium">New group</span>
          </button>

          <button
            onClick={() => alert('Add Contact: Enter name and phone number')}
            className={`w-full flex items-center gap-4 px-4 py-2.5 transition-colors ${
              isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-medium">New contact</span>
          </button>
        </div>

        {/* Contacts Header */}
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Contacts on WhatsApp
        </div>

        {/* Contacts */}
        {filtered.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors ${
              isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 mr-3 shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-medium truncate">{contact.name}</h4>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                {contact.about || 'Hey there! I am using WhatsApp.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
