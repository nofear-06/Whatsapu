import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronUp, Send } from 'lucide-react';
import { StatusItem } from '../types/whatsapp';

interface StatusViewerModalProps {
  status: StatusItem | null;
  onClose: () => void;
  onSendReply: (statusId: string, replyText: string) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  status,
  onClose,
  onSendReply,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!status) return;
    setProgress(0);

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            onClose();
            return 100;
          }
          return prev + 2;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [status, isPaused, onClose]);

  if (!status) return null;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(status.id, replyText);
    setReplyText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Bar with Story Progress Line */}
      <div className="p-3 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden mb-3">
          <div
            className="bg-white h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700">
              <img
                src={status.contact.avatar}
                alt={status.contact.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{status.contact.name}</h4>
              <p className="text-[11px] text-white/70">{status.timestamp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Center Media */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="max-w-md max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl relative">
          <img
            src={status.mediaUrl}
            alt="Status story"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {status.caption && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-sm text-center max-w-sm">
            {status.caption}
          </div>
        )}
      </div>

      {/* Bottom Reply Bar */}
      <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
        <form onSubmit={handleReply} className="flex items-center gap-2 max-w-md mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to status..."
              className="w-full py-2.5 px-4 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/60 text-sm outline-none border border-white/20"
            />
          </div>
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
            aria-label="Send reply"
          >
            <Send className="w-4 h-4 translate-x-0.5" />
          </button>
        </form>
        <div className="flex items-center justify-center gap-1 text-[11px] text-white/50 mt-2">
          <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
          <span>Swipe up to reply</span>
        </div>
      </div>
    </div>
  );
};
