import { useEffect } from 'react';
import { X, User, MapPin, Clock, Calendar, Bookmark, ArrowRight } from 'lucide-react';
import { ScheduleSession, getSessionTypeStyle } from '../data/scheduleData';

interface SessionDetailModalProps {
  session: ScheduleSession | null;
  onClose: () => void;
  onSelectLecturer?: (lecturerName: string) => void;
  onSelectRoom?: (roomName: string) => void;
}

export function SessionDetailModal({
  session,
  onClose,
  onSelectLecturer,
  onSelectRoom
}: SessionDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!session) return null;

  const style = getSessionTypeStyle(session.type);

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
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${style.badge}`}>
                {session.type}
              </span>
              {session.groupId && (
                <span className="text-xs font-mono font-medium text-slate-400">
                  {session.groupId}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-100 leading-snug">
              {session.course}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Day
              </span>
              <p className="font-medium text-slate-200">
                {session.day}
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
                  <User className="w-3.5 h-3.5" /> Lecturer
                </span>
                <p className="font-medium text-slate-100">
                  {session.lecturer}
                </p>
              </div>
              {onSelectLecturer && (
                <button
                  onClick={() => {
                    onSelectLecturer(session.lecturer);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 transition-colors"
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
                <p className="font-medium text-slate-100">
                  {session.room || "Room TBD (Unassigned)"}
                </p>
              </div>
              {onSelectRoom && session.room && (
                <button
                  onClick={() => {
                    onSelectRoom(session.room);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 transition-colors"
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
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
