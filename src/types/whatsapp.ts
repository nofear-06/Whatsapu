export interface Contact {
  id: string;
  name: string;
  avatar: string;
  about?: string;
  phone?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'document';
}

export interface Chat {
  id: string;
  contact: Contact;
  lastMessage: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
}

export interface StatusItem {
  id: string;
  contact: Contact;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  viewed: boolean;
}

export interface CallItem {
  id: string;
  contact: Contact;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  timestamp: string;
}

export type WhatsAppTab = 'camera' | 'chats' | 'status' | 'calls';
