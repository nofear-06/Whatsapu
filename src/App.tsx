/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthScreen } from './components/AuthScreen';
import { WhatsAppHeader } from './components/WhatsAppHeader';
import { TabsBar } from './components/TabsBar';
import { ChatListItem } from './components/ChatListItem';
import { UserListItem } from './components/UserListItem';
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
  Chat,
  Contact,
  StatusItem,
  CallItem,
  WhatsAppTab,
  Message,
  AppUser,
  getDeterministicChatId,
} from './types/whatsapp';
import { Users, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const TABS: WhatsAppTab[] = ['camera', 'chats', 'status', 'calls'];

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [platformUsers, setPlatformUsers] = useState<AppUser[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [calls, setCalls] = useState<CallItem[]>([]);

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

  // Resize listener
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

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const appUserData: AppUser = {
          uid: user.uid,
          displayName: user.displayName || user.phoneNumber || 'WhatsApp User',
          phoneNumber: user.phoneNumber || '',
          email: user.email || '',
          photoURL:
            user.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.displayName || user.uid)}`,
          about: 'Hey there! I am using WhatsApp.',
          isOnline: true,
          lastSeen: new Date().toISOString(),
        };
        setCurrentUser(appUserData);

        // Update online status in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), appUserData, { merge: true });
        } catch (e) {
          console.warn('Error updating user presence:', e);
        }
      } else {
        setCurrentUser(null);
        setSelectedChat(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Seed initial demo users in real Firestore if collection is empty
  useEffect(() => {
    if (!currentUser) return;

    const seedInitialFirestoreUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (snap.size <= 1) {
          const demoUsers = [
            {
              uid: 'demo_leon',
              displayName: 'Leon McQuillan',
              phoneNumber: '+1 (555) 234-8901',
              email: 'user_15552348901@whatsapp.internal',
              photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
              about: 'Available for meetings · Work',
              isOnline: true,
              lastSeen: 'online',
              createdAt: serverTimestamp(),
            },
            {
              uid: 'demo_jemma',
              displayName: 'Jemma Freix',
              phoneNumber: '+1 (555) 872-4192',
              email: 'user_15558724192@whatsapp.internal',
              photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
              about: 'Living one day at a time ✨',
              isOnline: false,
              lastSeen: 'Today at 4:32 pm',
              createdAt: serverTimestamp(),
            },
            {
              uid: 'demo_arturo',
              displayName: 'Arturo Decoy',
              phoneNumber: '+1 (555) 345-9128',
              email: 'user_15553459128@whatsapp.internal',
              photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
              about: 'Coding, Coffee, Repeat ☕',
              isOnline: true,
              lastSeen: 'online',
              createdAt: serverTimestamp(),
            },
          ];

          for (const u of demoUsers) {
            await setDoc(doc(db, 'users', u.uid), u, { merge: true });
          }
        }
      } catch (err) {
        console.warn('Seed users error:', err);
      }
    };

    seedInitialFirestoreUsers();
  }, [currentUser]);

  // 2. Real-time Subscription to all Users on the Platform
  useEffect(() => {
    if (!currentUser) return;

    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersList: AppUser[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (docSnap.id !== currentUser.uid) {
            usersList.push({
              uid: docSnap.id,
              displayName: d.displayName || 'WhatsApp User',
              phoneNumber: d.phoneNumber || '',
              email: d.email || '',
              photoURL:
                d.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(d.displayName || docSnap.id)}`,
              about: d.about || 'Hey there! I am using WhatsApp.',
              isOnline: d.isOnline ?? false,
              lastSeen: d.lastSeen || 'recently',
            });
          }
        });
        setPlatformUsers(usersList);
      },
      (error) => {
        console.error('Real-time users error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Real-time Subscription to Active Chats
  useEffect(() => {
    if (!currentUser) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const list: Chat[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const otherUid = data.participants?.find((p: string) => p !== currentUser.uid);
          const details = data.participantDetails?.[otherUid] || {};

          list.push({
            id: docSnap.id,
            contact: {
              id: otherUid || 'unknown',
              name: details.name || 'WhatsApp Contact',
              avatar:
                details.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(details.name || otherUid)}`,
              phone: details.phone || '',
              about: details.about || '',
              isOnline: details.isOnline ?? false,
              lastSeen: details.lastSeen || 'online',
            },
            lastMessage: {
              id: data.lastMessage?.id || 'last-msg',
              chatId: docSnap.id,
              sender: data.lastMessage?.senderId === currentUser.uid ? 'me' : 'them',
              text: data.lastMessage?.text || 'No messages yet',
              timestamp: data.lastMessage?.timeStr || 'recently',
              status: data.lastMessage?.status || 'delivered',
            },
            unreadCount: data.unreadCounts?.[currentUser.uid] || 0,
            updatedAt: data.updatedAt,
          });
        });

        // Sort by recent update
        list.sort((a, b) => {
          const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return tB - tA;
        });

        setChats(list);
      },
      (error) => {
        console.error('Real-time chats error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 4. Real-time Subscription to Messages for Selected Chat
  useEffect(() => {
    if (!selectedChat || !currentUser) {
      setActiveChatMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          msgs.push({
            id: docSnap.id,
            chatId: selectedChat.id,
            sender: data.senderId === currentUser.uid ? 'me' : 'them',
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text || '',
            timestamp:
              data.timeStr ||
              (data.timestamp?.toDate
                ? formatTime(data.timestamp.toDate())
                : 'Just now'),
            status: data.status || 'delivered',
            mediaUrl: data.mediaUrl,
            mediaType: data.mediaType,
          });
        });
        setActiveChatMessages(msgs);
      },
      (error) => {
        console.error('Real-time messages error:', error);
      }
    );

    // Clear unread count for current user
    const chatRef = doc(db, 'chats', selectedChat.id);
    updateDoc(chatRef, {
      [`unreadCounts.${currentUser.uid}`]: 0,
    }).catch(() => {});

    return () => unsubscribe();
  }, [selectedChat, currentUser]);

  // Real-time Swiping Touch/Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, button[type="submit"], button')) {
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
      const currentIdx = TABS.indexOf(activeTab);
      let offset = dx;

      if (currentIdx === 0 && dx > 0) {
        offset = dx * 0.25;
      } else if (currentIdx === 3 && dx < 0) {
        offset = dx * 0.25;
      }

      setDragOffset(offset);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;

    if (directionLockedRef.current === 'horizontal') {
      const elapsed = Math.max(1, Date.now() - pointerStartRef.current.time);
      const velocity = Math.abs(dragOffset) / elapsed;
      const width = containerWidth || 390;
      const threshold = width * 0.18;

      const currentIdx = TABS.indexOf(activeTab);
      let targetIndex = currentIdx;

      if (dragOffset < -threshold || (dragOffset < -25 && velocity > 0.25)) {
        targetIndex = Math.min(3, currentIdx + 1);
      } else if (dragOffset > threshold || (dragOffset > 25 && velocity > 0.25)) {
        targetIndex = Math.max(0, currentIdx - 1);
      }

      if (targetIndex !== currentIdx) {
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

  // Unread badge count
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

  // Filtered platform users based on search
  const filteredPlatformUsers = useMemo(() => {
    if (!searchQuery.trim()) return platformUsers;
    const q = searchQuery.toLowerCase();
    return platformUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
        (u.about && u.about.toLowerCase().includes(q))
    );
  }, [platformUsers, searchQuery]);

  // Start chat with any platform user
  const handleStartChatWithUser = (user: AppUser) => {
    if (!currentUser) return;
    const chatId = getDeterministicChatId(currentUser.uid, user.uid);

    const existingChat = chats.find((c) => c.id === chatId);
    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      const newChat: Chat = {
        id: chatId,
        contact: {
          id: user.uid,
          name: user.displayName,
          avatar:
            user.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.displayName)}`,
          phone: user.phoneNumber,
          about: user.about,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        },
        lastMessage: {
          id: 'first',
          chatId,
          sender: 'them',
          text: user.about || 'Hey there! I am using WhatsApp.',
          timestamp: 'Just now',
          status: 'read',
        },
        unreadCount: 0,
      };
      setSelectedChat(newChat);
    }
  };

  // Send message to real Firestore
  const handleSendMessage = async (chatId: string, text: string) => {
    if (!currentUser || !selectedChat) return;

    const timeStr = formatTime(new Date());
    const otherContact = selectedChat.contact;

    try {
      // 1. Add to messages subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: currentUser.uid,
        receiverId: otherContact.id,
        text,
        timestamp: serverTimestamp(),
        timeStr,
        status: 'sent',
      });

      // 2. Set/update chat document in chats
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(
        chatRef,
        {
          id: chatId,
          participants: [currentUser.uid, otherContact.id],
          participantDetails: {
            [currentUser.uid]: {
              name: currentUser.displayName,
              avatar: currentUser.photoURL,
              phone: currentUser.phoneNumber || '',
              about: currentUser.about || '',
              isOnline: true,
            },
            [otherContact.id]: {
              name: otherContact.name,
              avatar: otherContact.avatar,
              phone: otherContact.phone || '',
              about: otherContact.about || '',
              isOnline: otherContact.isOnline ?? false,
            },
          },
          lastMessage: {
            text,
            senderId: currentUser.uid,
            timeStr,
            status: 'sent',
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSignOut = async () => {
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });
      } catch {}
    }
    await signOut(auth);
  };

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    chats.forEach((c) => {
      const chatRef = doc(db, 'chats', c.id);
      updateDoc(chatRef, {
        [`unreadCounts.${currentUser.uid}`]: 0,
      }).catch(() => {});
    });
  };

  const contactsForModal: Contact[] = useMemo(() => {
    return platformUsers.map((u) => ({
      id: u.uid,
      name: u.displayName,
      avatar:
        u.photoURL ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.displayName)}`,
      phone: u.phoneNumber,
      about: u.about,
      isOnline: u.isOnline,
    }));
  }, [platformUsers]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#075E54] text-white">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Starting WhatsApp...</p>
      </div>
    );
  }

  // Not logged in -> Show Authentication Screen
  if (!currentUser) {
    return <AuthScreen isDarkMode={isDarkMode} />;
  }

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
        currentUser={currentUser}
        onSignOut={handleSignOut}
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
              onCapturePhoto={() => {
                alert('Photo captured! Status features ready.');
                setActiveTab('chats');
              }}
              onClose={() => setActiveTab('chats')}
            />
          </div>

          {/* Tab 1: Chats & Platform Users */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto select-none touch-pan-y overscroll-contain">
              {/* Active Conversations Section */}
              {filteredChats.length > 0 && (
                <div className="border-b border-gray-100 dark:border-white/5">
                  <div
                    className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${
                      isDarkMode
                        ? 'bg-[#182229] text-gray-400'
                        : 'bg-gray-100/70 text-gray-500'
                    }`}
                  >
                    Active Chats ({filteredChats.length})
                  </div>
                  {filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      onSelectChat={(c) => setSelectedChat(c)}
                      onAvatarClick={(c) => setSelectedContactForInfo(c.contact)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              )}

              {/* All Registered Users on Platform */}
              <div>
                <div
                  className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
                    isDarkMode
                      ? 'bg-[#182229] text-gray-400'
                      : 'bg-gray-100/70 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00a884]" />
                    <span>All Users on WhatsApp ({filteredPlatformUsers.length})</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 lowercase font-medium">
                    Live Firestore
                  </span>
                </div>

                {filteredPlatformUsers.length > 0 ? (
                  filteredPlatformUsers.map((user) => (
                    <UserListItem
                      key={user.uid}
                      user={user}
                      onStartChat={handleStartChatWithUser}
                      isDarkMode={isDarkMode}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-gray-500">
                    {searchQuery ? (
                      `No users match "${searchQuery}"`
                    ) : (
                      <div className="flex flex-col items-center">
                        <Users className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Waiting for more users to join
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                          Open an incognito tab or another browser to sign up with another phone number and chat live!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab 2: Status */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <StatusTabContent
              statuses={statuses}
              onSelectStatus={(s) => setSelectedStatus(s)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Tab 3: Calls */}
          <div className="w-1/4 h-full relative overflow-hidden flex flex-col">
            <CallsTabContent
              calls={calls}
              onStartCall={(call) => setActiveCall(call)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <FloatingActionButton
          activeTab={activeTab}
          onClick={() => {
            if (activeTab === 'chats') setIsNewChatOpen(true);
            else if (activeTab === 'status') alert('Add photo to status');
            else if (activeTab === 'calls') alert('Select contact to start call');
          }}
        />
      </main>

      {/* Real-time Sliding Chat Detail View */}
      {selectedChat && (
        <ChatDetailView
          chat={selectedChat}
          messages={activeChatMessages}
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
          onSendReply={(statusId, replyText) => {
            alert(`Replied: ${replyText}`);
          }}
        />
      )}

      {isNewChatOpen && (
        <NewChatModal
          contacts={contactsForModal}
          onClose={() => setIsNewChatOpen(false)}
          onSelectContact={(contact) => {
            const user = platformUsers.find((u) => u.uid === contact.id);
            if (user) {
              handleStartChatWithUser(user);
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
            const user = platformUsers.find((u) => u.uid === contact.id);
            if (user) {
              handleStartChatWithUser(user);
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
          currentUser={currentUser}
          onSignOut={handleSignOut}
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
