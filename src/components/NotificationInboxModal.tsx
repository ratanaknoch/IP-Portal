import React from 'react';
import { 
  X, 
  Bell, 
  Calendar, 
  Radio, 
  CheckCheck, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppNotification, markNotificationAsRead } from '../lib/firebase';

interface NotificationInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  currentUserId?: string;
}

export function NotificationInboxModal({
  isOpen,
  onClose,
  notifications,
  currentUserId
}: NotificationInboxModalProps) {
  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    if (currentUserId) {
      await markNotificationAsRead(id, currentUserId);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;
    for (const n of notifications) {
      if (!n.readBy?.includes(currentUserId)) {
        await markNotificationAsRead(n.id, currentUserId);
      }
    }
  };

  const unreadCount = notifications.filter(
    (n) => currentUserId && !n.readBy?.includes(currentUserId)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs selection:bg-sky-900 selection:text-white">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col text-white overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Notifications & Inbox
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-slate-950">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Announcements and monitor make-up class reservation updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && currentUserId && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium">Your inbox is clear</p>
              <p className="text-[11px] text-slate-500">
                No announcements or class scheduling notifications yet.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = Boolean(currentUserId && !n.readBy?.includes(currentUserId));
              const isBooking = n.type === 'class_booking';

              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-sky-950/30 border-sky-700/60 shadow-xs'
                      : 'bg-slate-950/70 border-slate-800/80 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      {isBooking ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                      )}
                      <h4 className={`font-semibold text-xs ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400">
                        {n.audience}
                      </span>
                    </div>

                    {isUnread && (
                      <span className="text-[10px] font-bold text-sky-400 shrink-0">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    {n.message}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>
                      {n.senderName} · {n.senderRole || 'ITC'}
                    </span>
                    <span>
                      {new Date(n.createdAt).toLocaleDateString()} at{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
