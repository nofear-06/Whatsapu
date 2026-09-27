/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
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

const TABS: WhatsAppTab[] = ['camera', 'chats', 'status', 'calls'];

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

  // Real-time Swiping State
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const directionLockedRef = useRef<'horizontal' | 'vertical' | null>(null);
  const didDragHorizontallyRef = useRef<boolean>(false);

  // Resize listener for container width
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

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

  // Handle pointer swipe interactions (mouse and touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, button[type="submit"]')) {
      return;
    }

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    directionLockedRef.current = null;
    didDragHorizontallyRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (directionLockedRef.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        if (Math.abs(dx) > Math.abs(dy)) {
          directionLockedRef.current = 'horizontal';
          didDragHorizontallyRef.current = true;
          setIsDragging(true);
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
        } else {
          directionLockedRef.current = 'vertical';
        }
      }
    }

    if (directionLockedRef.current === 'horizontal') {
      const currentIndex = TABS.indexOf(activeTab);
      let offset = dx;

      // Resistance at left & right outer boundaries
      if (currentIndex === 0 && dx > 0) {
        offset = dx * 0.25;
      } else if (currentIndex === 3 && dx < 0) {
        offset = dx * 0.25;
      }

      setDragOffset(offset);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;

    if (directionLockedRef.current === 'horizontal') {
      const elapsed = Math.max(1, Date.now() - pointerStartRef.current.time);
      const velocity = Math.abs(dragOffset) / elapsed; // px per ms
      const width = containerWidth || 390;
      const threshold = width * 0.18; // 18% of screen or flick velocity

      const currentIndex = TABS.indexOf(activeTab);
      let targetIndex = currentIndex;

      if (dragOffset < -threshold || (dragOffset < -25 && velocity > 0.25)) {
        targetIndex = Math.min(3, currentIndex + 1);
      } else if (dragOffset > threshold || (dragOffset > 25 && velocity > 0.25)) {
        targetIndex = Math.max(0, currentIndex - 1);
      }

      if (targetIndex !== currentIndex) {
        setActiveTab(TABS[targetIndex]);
      }

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }

    setIsDragging(false);
    setDragOffset(0);
    pointerStartRef.current = null;
    directionLockedRef.current = null;

    setTimeout(() => {
      didDragHorizontallyRef.current = false;
    }, 60);
  };

  // Real-time tab fraction (0 to 3) for the TabsBar indicator line
  const currentIndex = TABS.indexOf(activeTab);
  const realtimeTabFraction =
    containerWidth > 0
      ? currentIndex - dragOffset / containerWidth
      : currentIndex;

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

    setMessagesMap((prev) => {
      const existing = prev[chatId] || [];
      return { ...prev, [chatId]: [...existing, newMsg] };
    });

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

      {/* WhatsApp Navigation Tabs Bar with real-time sliding indicator */}
      <TabsBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setDragOffset(0);
          setIsDragging(false);
        }}
        unreadChatsCount={unreadChatsCount}
        hasStatusUpdates={hasStatusUpdates}
        isDarkMode={isDarkMode}
        realtimeTabFraction={realtimeTabFraction}
        isDragging={isDragging}
      />

      {/* Real-time Horizontal ViewPager Container */}
      <main
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={(e) => {
          if (didDragHorizontallyRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className="flex-1 overflow-hidden relative flex flex-col touch-pan-y"
      >
        <div
          className="flex flex-row h-full w-[400%] will-change-transform select-none"
          style={{
            transform: `translate3d(${-currentIndex * containerWidth + dragOffset}px, 0, 0)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Tab 0: Camera */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <CameraTabContent
              onCapturePhoto={(photoUrl) => {
                alert('Photo captured! Added to your Status updates.');
                setActiveTab('chats');
              }}
              onClose={() => setActiveTab('chats')}
            />
          </div>

          {/* Tab 1: Chats */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto select-none touch-pan-y overscroll-contain">
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
          </div>

          {/* Tab 2: Status */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <StatusTabContent
              statuses={statuses}
              onSelectStatus={handleSelectStatus}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Tab 3: Calls */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <CallsTabContent
              calls={calls}
              onStartCall={handleStartCall}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <FloatingActionButton
          activeTab={activeTab}
          onClick={() => {
            if (activeTab === 'chats') setIsNewChatOpen(true);
            else if (activeTab === 'status') alert('Camera / Status photo capture');
            else if (activeTab === 'calls') alert('Select contact to start call');
          }}
        />
      </main>

      {/* Sliding Chat Detail View */}
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

      {/* Modals & Overlays */}
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
