/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WhatsAppHeader } from './components/WhatsAppHeader';
import { TabsBar } from './components/TabsBar';
import { ChatListItem } from './components/ChatListItem';
import { FloatingActionButton } from './components/FloatingActionButton';
import { ChatDetailView } from './components/ChatDetailView';
import { StatusTabContent } from './components/StatusTabContent';
import { CallsTabContent } from './components/CallsTabContent';
import { CameraTabContent } from './components/CameraTabContent';
import { StatusViewerModal } from './components/StatusViewerModal';
import { NewChatModal } from './components/NewChatModal';
import { ContactInfoModal } from './components/ContactInfoModal';
import { SettingsModal } from './components/SettingsModal';
import { ActiveCallModal } from './components/ActiveCallModal';
import {
  INITIAL_CHATS,
  INITIAL_MESSAGES_MAP,
  INITIAL_STATUSES,
  INITIAL_CALLS,
} from './data/mockData';
import { Chat, Contact, StatusItem, CallItem, WhatsAppTab, Message } from './types/whatsapp';

export default function App() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES_MAP);
  const [statuses, setStatuses] = useState<StatusItem[]>(INITIAL_STATUSES);
  const [calls, setCalls] = useState<CallItem[]>(INITIAL_CALLS);

  const [activeTab, setActiveTab] = useState<WhatsAppTab>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedContactForInfo, setSelectedContactForInfo] = useState<Contact | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusItem | null>(null);
  const [activeCall, setActiveCall] = useState<CallItem | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Unread count
  const unreadChatsCount = useMemo(() => {
    return chats.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0);
  }, [chats]);

  const hasStatusUpdates = useMemo(() => {
    return statuses.some((s) => !s.viewed);
  }, [statuses]);

  // Filtered chats based on search
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(
      (c) =>
        c.contact.name.toLowerCase().includes(q) ||
        c.lastMessage.text.toLowerCase().includes(q)
    );
  }, [chats, searchQuery]);

  // Handle message sending
  const handleSendMessage = (chatId: string, text: string) => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const timeFormatted = `${hours}:${minutes} ${ampm}`;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      sender: 'me',
      text,
      timestamp: timeFormatted,
      status: 'sending',
    };

    // Update messages map
    setMessagesMap((prev) => {
      const existing = prev[chatId] || [];
      return { ...prev, [chatId]: [...existing, newMsg] };
    });

    // Update chat last message
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: newMsg,
              unreadCount: 0,
            }
          : c
      )
    );

    // Simulate tick transitions: sent -> delivered -> read
    setTimeout(() => {
      setMessagesMap((prev) => {
        const current = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: current.map((m) =>
            m.id === newMsg.id ? { ...m, status: 'delivered' } : m
          ),
        };
      });
    }, 500);

    setTimeout(() => {
      setMessagesMap((prev) => {
        const current = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: current.map((m) =>
            m.id === newMsg.id ? { ...m, status: 'read' } : m
          ),
        };
      });
    }, 1200);

    // Simulate smart auto reply from contact
    setTimeout(() => {
      const replies = [
        'Sounds good! Let me check on that right away.',
        'Got it, thanks for letting me know!',
        'Perfect! See you shortly.',
        'Thanks for reaching out! Absolutely.',
        'Great, I will get back to you with the details soon.',
        'Appreciate the update! 👍',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        chatId,
        sender: 'them',
        text: randomReply,
        timestamp: timeFormatted,
        status: 'read',
      };

      setMessagesMap((prev) => {
        const current = prev[chatId] || [];
        return { ...prev, [chatId]: [...current, replyMsg] };
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: replyMsg,
              }
            : c
        )
      );
    }, 2200);
  };

  const handleSelectChat = (chat: Chat) => {
    // Clear unread count when opening
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
    );
    setSelectedChat(chat);
  };

  const handleMarkAllRead = () => {
    setChats((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
  };

  const handleSelectStatus = (status: StatusItem) => {
    setSelectedStatus(status);
    // Mark as viewed
    setStatuses((prev) =>
      prev.map((s) => (s.id === status.id ? { ...s, viewed: true } : s))
    );
  };

  const handleSendStatusReply = (statusId: string, replyText: string) => {
    const status = statuses.find((s) => s.id === statusId);
    if (!status) return;
    const targetChat = chats.find((c) => c.contact.id === status.contact.id);
    if (targetChat) {
      handleSendMessage(targetChat.id, `Replied to status: "${replyText}"`);
    }
  };

  const handleStartCall = (call: CallItem) => {
    setActiveCall(call);
  };

  const handleResetData = () => {
    setChats(INITIAL_CHATS);
    setMessagesMap(INITIAL_MESSAGES_MAP);
    setStatuses(INITIAL_STATUSES);
    setCalls(INITIAL_CALLS);
    setSelectedChat(null);
    setIsSearching(false);
    setSearchQuery('');
  };

  const allContacts: Contact[] = useMemo(() => {
    return chats.map((c) => c.contact);
  }, [chats]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col overflow-hidden transition-colors ${
        isDarkMode ? 'bg-[#111b21] text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* WhatsApp Top Header (App Bar) */}
      <WhatsAppHeader
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewGroup={() => setIsNewChatOpen(true)}
        onMarkAllRead={handleMarkAllRead}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* 3. WhatsApp Navigation Tabs Bar */}
      <TabsBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadChatsCount={unreadChatsCount}
        hasStatusUpdates={hasStatusUpdates}
        isDarkMode={isDarkMode}
      />

      {/* 4. Tab Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'camera' && (
          <CameraTabContent
            onCapturePhoto={(photoUrl) => {
              alert('Photo captured! Added to your Status updates.');
              setActiveTab('chats');
            }}
            onClose={() => setActiveTab('chats')}
          />
        )}

        {activeTab === 'chats' && (
          <div className="flex-1 overflow-y-auto select-none">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  onSelectChat={handleSelectChat}
                  onAvatarClick={(c) => setSelectedContactForInfo(c.contact)}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No chats match &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <StatusTabContent
            statuses={statuses}
            onSelectStatus={handleSelectStatus}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'calls' && (
          <CallsTabContent
            calls={calls}
            onStartCall={handleStartCall}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Floating Action Button (FAB) */}
        <FloatingActionButton
          activeTab={activeTab}
          onClick={() => setIsNewChatOpen(true)}
        />
      </main>

      {/* 5. Sliding Chat Detail View */}
      {selectedChat && (
        <ChatDetailView
          chat={selectedChat}
          messages={messagesMap[selectedChat.id] || []}
          onBack={() => setSelectedChat(null)}
          onSendMessage={handleSendMessage}
          isDarkMode={isDarkMode}
          onOpenContactInfo={(chat) => setSelectedContactForInfo(chat.contact)}
        />
      )}

      {/* 6. Modals & Overlays */}
      {selectedStatus && (
        <StatusViewerModal
          status={selectedStatus}
          onClose={() => setSelectedStatus(null)}
          onSendReply={handleSendStatusReply}
        />
      )}

      {isNewChatOpen && (
        <NewChatModal
          contacts={allContacts}
          onClose={() => setIsNewChatOpen(false)}
          onSelectContact={(contact) => {
            const chat = chats.find((c) => c.contact.id === contact.id);
            if (chat) {
              handleSelectChat(chat);
            }
            setIsNewChatOpen(false);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {selectedContactForInfo && (
        <ContactInfoModal
          contact={selectedContactForInfo}
          onClose={() => setSelectedContactForInfo(null)}
          onStartChat={(contact) => {
            const chat = chats.find((c) => c.contact.id === contact.id);
            if (chat) {
              handleSelectChat(chat);
            }
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}

      {activeCall && (
        <ActiveCallModal
          call={activeCall}
          onEndCall={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
