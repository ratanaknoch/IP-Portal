import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2,
  ShieldAlert,
  Check
} from 'lucide-react';
import { 
  AppNotification, 
  UserRole,
  markNotificationAsRead,
  clearNotificationForUser,
  clearAllNotificationsForUser,
  deleteAllNotificationsAcrossAllUsers
} from '../lib/firebase';

interface NotificationInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  currentUserId?: string;
  currentUserRole?: UserRole;
  onClearLocalNotification?: (id: string) => void;
  onClearAllLocalNotifications?: (ids: string[]) => void;
}

export function NotificationInboxModal({
  isOpen,
  onClose,
  notifications,
  currentUserId,
  currentUserRole,
  onClearLocalNotification,
  onClearAllLocalNotifications
}: NotificationInboxModalProps) {
  const [confirmGlobalClear, setConfirmGlobalClear] = useState(false);
  const [isClearingGlobal, setIsClearingGlobal] = useState(false);

  if (!isOpen) return null;

  const effectiveUid = currentUserId || 'guest';
  const isAdmin = currentUserRole === 'admin';

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

  const handleClearSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onClearLocalNotification) {
      onClearLocalNotification(id);
    }
    if (currentUserId) {
      await clearNotificationForUser(id, currentUserId);
    }
  };

  const handleClearMyInbox = async () => {
    const allIds = notifications.map((n) => n.id);
    if (allIds.length === 0) return;
    if (onClearAllLocalNotifications) {
      onClearAllLocalNotifications(allIds);
    }
    if (currentUserId) {
      await clearAllNotificationsForUser(allIds, currentUserId);
    }
  };

  const handleGlobalClearAllUsers = async () => {
    setIsClearingGlobal(true);
    try {
      const allIds = notifications.map((n) => n.id);
      if (onClearAllLocalNotifications && allIds.length > 0) {
        onClearAllLocalNotifications(allIds);
      }
      await deleteAllNotificationsAcrossAllUsers();
      setConfirmGlobalClear(false);
    } catch (err) {
      console.error('Failed to clear all notifications globally:', err);
    } finally {
      setIsClearingGlobal(false);
    }
  };

  const unreadCount = notifications.filter(
    (n) => !n.readBy?.includes(effectiveUid)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs selection:bg-sky-900 selection:text-white">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col text-white overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">
                  Notifications & Inbox
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-slate-950">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Announcements and make-up class updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && currentUserId && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-2 py-1 rounded text-[11px] text-sky-400 hover:text-sky-300 hover:bg-sky-950/50 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearMyInbox}
                className="px-2 py-1 rounded text-[11px] text-slate-300 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                title="Clear all notifications from your inbox"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Global Clear Banner */}
        {isAdmin && notifications.length > 0 && (
          <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-800/50 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px]">
                <strong className="text-amber-300">Admin Control:</strong> Wipe notifications for all users
              </span>
            </div>

            {!confirmGlobalClear ? (
              <button
                type="button"
                onClick={() => setConfirmGlobalClear(true)}
                className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All Users</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={isClearingGlobal}
                  onClick={handleGlobalClearAllUsers}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  <span>{isClearingGlobal ? 'Clearing...' : 'Confirm Wipe'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmGlobalClear(false)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium">Your inbox is clear</p>
              <p className="text-[11px] text-slate-500">
                No announcements or class scheduling notifications right now.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = Boolean(!n.readBy?.includes(effectiveUid));
              const isBooking = n.type === 'class_booking';

              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`group p-3.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-sky-950/30 border-sky-700/60 shadow-xs'
                      : 'bg-slate-950/70 border-slate-800/80 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1 min-w-0">
                      {isBooking ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                      )}
                      <h4 className={`font-semibold text-xs truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-slate-800 text-slate-400 shrink-0">
                        {n.audience}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUnread && (
                        <span className="text-[10px] font-bold text-sky-400">
                          NEW
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleClearSingle(e, n.id)}
                        title="Clear notification"
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
