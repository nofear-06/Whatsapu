import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  Send,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  MapPin,
  User,
} from 'lucide-react';
import { Chat, Message } from '../types/whatsapp';

interface ChatDetailViewProps {
  chat: Chat;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (chatId: string, text: string) => void;
  isDarkMode: boolean;
  onOpenContactInfo: (chat: Chat) => void;
}

export const ChatDetailView: React.FC<ChatDetailViewProps> = ({
  chat,
  messages,
  onBack,
  onSendMessage,
  isDarkMode,
  onOpenContactInfo,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTypingReply, setIsTypingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { contact } = chat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTypingReply]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(chat.id, trimmed);
    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const [swipeBackOffset, setSwipeBackOffset] = useState(0);
  const [isSwipingBack, setIsSwipingBack] = useState(false);
  const backPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const backLockedRef = useRef<'horizontal' | 'vertical' | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, button')) return;
    backPointerStartRef.current = { x: e.clientX, y: e.clientY };
    backLockedRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!backPointerStartRef.current) return;
    const dx = e.clientX - backPointerStartRef.current.x;
    const dy = e.clientY - backPointerStartRef.current.y;

    if (backLockedRef.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        if (dx > 0 && Math.abs(dx) > Math.abs(dy)) {
          backLockedRef.current = 'horizontal';
          setIsSwipingBack(true);
        } else {
          backLockedRef.current = 'vertical';
        }
      }
    }

    if (backLockedRef.current === 'horizontal' && dx > 0) {
      setSwipeBackOffset(dx);
    }
  };

  const handlePointerUp = () => {
    if (backLockedRef.current === 'horizontal') {
      if (swipeBackOffset > 100) {
        onBack();
      }
    }
    setSwipeBackOffset(0);
    setIsSwipingBack(false);
    backPointerStartRef.current = null;
    backLockedRef.current = null;
  };

  const quickEmojis = ['😊', '👍', '❤️', '😂', '🔥', '🎉', '🙏', '🙌', '✨', '👋'];

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${swipeBackOffset}px, 0, 0)`,
        transition: isSwipingBack ? 'none' : 'transform 0.25s ease-out',
      }}
      className={`absolute inset-0 z-40 flex flex-col transition-colors ${
        isDarkMode ? 'bg-[#0b141a]' : 'bg-[#EFEAE2]'
      }`}
    >
      {/* Top Header */}
      <header
        className={`h-14 px-2 flex items-center justify-between shadow-md select-none shrink-0 ${
          isDarkMode ? 'bg-[#1f2c34] text-white' : 'bg-[#075E54] text-white'
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95"
            aria-label="Back to chat list"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div
            onClick={() => onOpenContactInfo(chat)}
            className="flex items-center gap-2 cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-white truncate leading-tight">
                {contact.name}
              </h2>
              <p className="text-[11px] text-white/80 truncate leading-tight">
                {isTypingReply
                  ? 'typing...'
                  : contact.isOnline
                  ? 'online'
                  : contact.lastSeen || 'last seen recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 text-white">
          <button
            onClick={() => alert(`Starting video call with ${contact.name}...`)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => alert(`Calling ${contact.name} on WhatsApp audio...`)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Voice call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenContactInfo(chat)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Chat options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Canvas with classic WhatsApp wallpaper pattern */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
        style={{
          backgroundImage: isDarkMode
            ? `radial-gradient(#ffffff08 1px, transparent 1px)`
            : `radial-gradient(#0000000a 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Security Notice */}
        <div className="flex justify-center my-2">
          <div
            className={`text-center text-[11px] px-3 py-1.5 rounded-lg max-w-xs shadow-xs ${
              isDarkMode
                ? 'bg-[#182229] text-amber-300/80 border border-amber-300/10'
                : 'bg-[#FFF3C2] text-amber-900 border border-amber-200/50'
            }`}
          >
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
            >
              <div
                className={`relative max-w-[78%] rounded-lg px-3 py-1.5 shadow-xs text-sm break-words ${
                  isMe
                    ? isDarkMode
                      ? 'bg-[#005c4b] text-white rounded-tr-none'
                      : 'bg-[#DCF8C6] text-gray-900 rounded-tr-none'
                    : isDarkMode
                    ? 'bg-[#202c33] text-white rounded-tl-none'
                    : 'bg-white text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="leading-snug text-[14px]">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] opacity-60 float-right ml-2 -mb-0.5">
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-current" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-current" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTypingReply && (
          <div className="flex justify-start">
            <div
              className={`rounded-lg px-3 py-2 text-xs flex items-center gap-1.5 shadow-xs ${
                isDarkMode ? 'bg-[#202c33] text-white/80' : 'bg-white text-gray-600'
              }`}
            >
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
              <span className="ml-1 text-[11px] font-medium">{contact.name} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar when triggered */}
      {showEmojiPicker && (
        <div
          className={`p-2 flex items-center justify-around border-t select-none ${
            isDarkMode ? 'bg-[#1f2c34] border-white/5' : 'bg-gray-100 border-gray-200'
          }`}
        >
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Drawer */}
      {showAttachmentMenu && (
        <div
          className={`p-4 grid grid-cols-4 gap-4 border-t animate-in slide-in-from-bottom duration-150 ${
            isDarkMode ? 'bg-[#1f2c34] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <button
            onClick={() => {
              onSendMessage(chat.id, '📷 Photo shared: document_snapshot.jpg');
              setShowAttachmentMenu(false);
            }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Document</span>
          </button>

          <button
            onClick={() => {
              onSendMessage(chat.id, '📸 Photo captured via camera');
              setShowAttachmentMenu(false);
            }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Camera</span>
          </button>

          <button
            onClick={() => {
              onSendMessage(chat.id, '🖼️ Image from Gallery');
              setShowAttachmentMenu(false);
            }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Gallery</span>
          </button>

          <button
            onClick={() => {
              onSendMessage(chat.id, '📍 Live Location shared');
              setShowAttachmentMenu(false);
            }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Location</span>
          </button>
        </div>
      )}

      {/* Input Bar */}
      <footer className="p-2 flex items-center gap-1.5 shrink-0">
        <div
          className={`flex-1 flex items-center rounded-full px-3 py-1.5 shadow-sm transition-colors ${
            isDarkMode ? 'bg-[#202c33] text-white' : 'bg-white text-gray-900'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-gray-500 dark:text-gray-400 hover:text-[#00a884] p-1"
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            className="text-gray-500 dark:text-gray-400 hover:text-[#00a884] p-1"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>

          {!inputText.trim() && (
            <button
              type="button"
              onClick={() => {
                onSendMessage(chat.id, '📸 Photo taken with camera');
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-[#00a884] p-1 ml-1"
              aria-label="Take photo"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Send / Voice Note FAB */}
        <button
          onClick={
            inputText.trim()
              ? handleSend
              : () => {
                  onSendMessage(chat.id, '🎤 Voice message (0:04)');
                }
          }
          className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow hover:bg-[#009374] active:scale-95 transition-all shrink-0"
          aria-label={inputText.trim() ? 'Send message' : 'Record voice note'}
        >
          {inputText.trim() ? (
            <Send className="w-5 h-5 translate-x-0.5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </footer>
    </div>
  );
};
