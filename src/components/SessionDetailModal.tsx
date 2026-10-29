import { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  Bookmark, 
  ArrowRight, 
  Ban, 
  RotateCcw, 
  Trash2, 
  Lock,
  AlertTriangle
} from 'lucide-react';
import { ScheduleSession, getSessionTypeStyle } from '../data/scheduleData';
import { 
  MakeupClassBooking, 
  CancelledClassSession, 
  canDeleteMakeupBooking, 
  canManageCancelledClass,
  getActiveWeekBounds
} from './MakeupClassBookingModal';
import { UserProfile } from '../lib/firebase';

interface SessionDetailModalProps {
  session: ScheduleSession | null;
  onClose: () => void;
  onSelectLecturer?: (lecturerName: string) => void;
  onSelectRoom?: (roomName: string) => void;
  currentUserProfile?: UserProfile | null;
  isStudentMode?: boolean;
  onSaveCancelledClass?: (item: CancelledClassSession) => void;
  onDeleteCancelledClass?: (id: string) => void;
  onDeleteMakeupBooking?: (id: string) => void;
}

export function SessionDetailModal({
  session,
  onClose,
  onSelectLecturer,
  onSelectRoom,
  currentUserProfile,
  isStudentMode = false,
  onSaveCancelledClass,
  onDeleteCancelledClass,
  onDeleteMakeupBooking
}: SessionDetailModalProps) {
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showDeleteMakeupConfirm, setShowDeleteMakeupConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  useEffect(() => {
    setShowCancelPrompt(false);
    setCancelReason('');
    setShowDeleteMakeupConfirm(false);
    setShowRestoreConfirm(false);
  }, [session]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!session) return null;

  const weekBounds = getActiveWeekBounds();
  const style = getSessionTypeStyle(session.type);
  const isMakeup = session.course.includes('[Make-up]') || Boolean((session as any).makeupBookingData);
  const makeupData = (session as any).makeupBookingData as MakeupClassBooking | undefined;
  const isCancelled = Boolean((session as any).isCancelledThisWeek);
  const cancelledData = (session as any).cancelledData as CancelledClassSession | undefined;

  const isMonitorOrAdmin =
    !isStudentMode ||
    currentUserProfile?.role === 'monitor' ||
    currentUserProfile?.role === 'admin';

  const canDeleteMakeup = makeupData ? canDeleteMakeupBooking(makeupData, currentUserProfile) : false;
  const canRestoreCancelled = cancelledData ? canManageCancelledClass(cancelledData, currentUserProfile) : false;

  const handleConfirmCancelRegularClass = () => {
    if (!onSaveCancelledClass || !session.groupId) return;
    const targetDate = weekBounds.dayDatesMap[session.day];
    const monitorName = currentUserProfile?.displayName
      ? currentUserProfile.displayName
      : currentUserProfile?.email
      ? currentUserProfile.email.split('@')[0]
      : 'Class Monitor';

    const newCancel: CancelledClassSession = {
      id: `cancel-${session.groupId}-${targetDate}-${session.time.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
      groupId: session.groupId,
      cohort: session.cohort || session.groupId.split('-')[0] || 'I2',
      day: session.day,
      date: targetDate,
      time: session.time,
      course: session.course,
      type: session.type,
      lecturer: session.lecturer,
      room: session.room,
      cancelledBy: monitorName,
      cancelledByUid: currentUserProfile?.uid || '',
      cancelledByEmail: currentUserProfile?.email || '',
      reason: cancelReason.trim() || 'Cancelled for current week',
      createdAt: new Date().toISOString()
    };

    onSaveCancelledClass(newCancel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {isCancelled ? (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 flex items-center gap-1">
                  <Ban className="w-3 h-3" />
                  <span>Cancelled This Week</span>
                </span>
              ) : isMakeup ? (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Make-up Class
                </span>
              ) : session.isTemporaryRoom ? (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/70 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Temporary Room</span>
                </span>
              ) : null}

              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${style.badge}`}>
                {session.type}
              </span>
              {session.groupId && (
                <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded">
                  {session.groupId}
                </span>
              )}
            </div>
            <h3 className={`text-lg font-semibold leading-snug ${
              isCancelled ? 'text-slate-300 line-through decoration-rose-400' : 'text-slate-100'
            }`}>
              {session.course.replace(' [Make-up]', '')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-5 space-y-4 text-sm">
          {/* Status Banner for Cancelled Class */}
          {isCancelled && cancelledData && (
            <div className="p-3.5 rounded-lg bg-rose-950/35 border border-rose-800/80 space-y-1.5 text-xs">
              <div className="font-bold text-rose-200 flex items-center justify-between">
                <span>Class Cancelled for Current Week ({cancelledData.date})</span>
                <span className="font-mono text-[11px] text-emerald-300">Resets Sunday</span>
              </div>
              <div className="text-slate-300">
                Marked by <strong className="text-white">{cancelledData.cancelledBy}</strong> · Classroom <strong className="text-emerald-300">{session.room || 'TBD'}</strong> is released for this slot.
              </div>
              {cancelledData.reason && (
                <div className="text-rose-200/90 italic">
                  Reason: "{cancelledData.reason}"
                </div>
              )}
            </div>
          )}

          {/* Status Banner for Make-up Class */}
          {isMakeup && makeupData && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/80 space-y-1.5 text-xs">
              <div className="font-bold text-amber-200 flex items-center justify-between">
                <span>Scheduled Make-up {makeupData.sessionType || 'Lecture'} ({makeupData.date})</span>
                <span className="font-mono text-[11px] text-emerald-300">Resets Sunday</span>
              </div>
              <div className="text-slate-300">
                Booked by <strong className="text-white">{makeupData.bookedBy}</strong> in <strong className="text-amber-300 font-mono">{makeupData.room}</strong>
              </div>
              {makeupData.note && (
                <div className="text-slate-300 italic">
                  Note: "{makeupData.note}"
                </div>
              )}
            </div>
          )}

          {/* Status Banner for Temporary Room Relocation */}
          {session.isTemporaryRoom && (
            <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-500/70 space-y-1.5 text-xs animate-in fade-in">
              <div className="font-bold text-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Temporary Classroom Notice</span>
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-600/70">
                  Temporary Relocation
                </span>
              </div>
              <div className="text-amber-100/90 leading-relaxed">
                {session.temporaryRoomNote || "This class has been temporarily relocated to Room A-402 to resolve a lab conflict in Room J-602."}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Day & Date
              </span>
              <p className="font-medium text-slate-200">
                {session.day} <span className="font-mono text-xs text-slate-400">({weekBounds.dayDatesMap[session.day]})</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time Slot
              </span>
              <p className="font-mono tabular-nums font-medium text-slate-200">
                {session.time}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {isMakeup ? 'Booked By' : 'Lecturer'}
                </span>
                <p className="font-medium text-slate-100">
                  {session.lecturer}
                </p>
              </div>
              {onSelectLecturer && !isMakeup && (
                <button
                  onClick={() => {
                    onSelectLecturer(session.lecturer);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  View Instructor <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </span>
                <p className="font-medium text-slate-100 flex items-center gap-2 flex-wrap">
                  <span className={session.isTemporaryRoom ? "text-amber-300 font-bold" : ""}>
                    {session.room || "Room TBD (Unassigned)"}
                  </span>
                  {session.isTemporaryRoom && (
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/60">
                      Temporary Room
                    </span>
                  )}
                  {isCancelled && (
                    <span className="text-xs text-emerald-400 font-semibold">
                      (Room Released This Week)
                    </span>
                  )}
                </p>
              </div>
              {onSelectRoom && session.room && (
                <button
                  onClick={() => {
                    onSelectRoom(session.room);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Check Room <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {session.groupName && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" /> Cohort & Program
                </span>
                <p className="mt-0.5 font-medium text-slate-200">
                  {session.groupName}
                </p>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* ACTION 1: MARK REGULAR CLASS AS CANCELLED FOR THIS WEEK           */}
          {/* ================================================================= */}
          {!isMakeup && !isCancelled && isMonitorOrAdmin && onSaveCancelledClass && session.groupId && (
            <div className="pt-3 border-t border-slate-800">
              {!showCancelPrompt ? (
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="w-full py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Ban className="w-4 h-4 text-rose-400" />
                  <span>Mark Class as Cancelled for This Week ({weekBounds.dayDatesMap[session.day]})</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800 space-y-2.5 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Confirm Cancel Class for This Week?</span>
                    <span className="font-mono text-[11px] text-slate-400">Resets Sunday</span>
                  </div>
                  <p className="text-slate-300">
                    Students in <strong>{session.groupId}</strong> will see this class marked as cancelled on the calendar, and <strong>{session.room || 'the room'}</strong> will be shown as free for this slot.
                  </p>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Optional reason (e.g. Lecturer on mission / rescheduled)"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white placeholder:text-slate-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCancelRegularClass}
                      className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Confirm Class Cancelled</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ACTION 2: RESTORE CANCELLED CLASS (Creator Monitor or Admin Only) */}
          {/* ================================================================= */}
          {isCancelled && cancelledData && onDeleteCancelledClass && (
            <div className="pt-3 border-t border-slate-800">
              {canRestoreCancelled ? (
                !showRestoreConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowRestoreConfirm(true)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>Restore Class to Active Schedule</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-950 border border-emerald-800 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-200 font-medium">Restore this class back to normal?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRestoreConfirm(false)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCancelledClass(cancelledData.id);
                          onClose();
                        }}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        Confirm Restore
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 py-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Only {cancelledData.cancelledBy} or Admin can restore this cancelled class.</span>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* ACTION 3: DELETE MAKE-UP CLASS (Creator Monitor or Admin Only)    */}
          {/* ================================================================= */}
          {isMakeup && makeupData && onDeleteMakeupBooking && (
            <div className="pt-3 border-t border-slate-800">
              {canDeleteMakeup ? (
                !showDeleteMakeupConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteMakeupConfirm(true)}
                    className="w-full py-2 px-3 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Delete Make-up Class</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-rose-200 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Confirm Delete Make-up Class?</span>
                    </div>
                    <p className="text-slate-300">
                      Are you sure you want to delete <strong>{makeupData.course}</strong> ({makeupData.groupId}) in <strong>{makeupData.room}</strong> on {makeupData.date}?
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowDeleteMakeupConfirm(false)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteMakeupBooking(makeupData.id);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Delete</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 py-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Only {makeupData.bookedBy} or Admin can delete this make-up booking.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
