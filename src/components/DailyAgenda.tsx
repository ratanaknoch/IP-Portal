import { useState } from 'react';
import { 
  SCHEDULE_DATA, 
  ALL_SESSIONS, 
  ScheduleSession, 
  getSessionTypeStyle,
  getCambodiaTime,
  getSlotLiveStatus
} from '../data/scheduleData';
import { MakeupClassBooking } from './MakeupClassBookingModal';
import { Calendar, Clock, MapPin, User, Bookmark, CheckCircle2 } from 'lucide-react';

interface DailyAgendaProps {
  onSelectSession: (session: ScheduleSession) => void;
  searchQuery: string;
  isStudentMode?: boolean;
  activeGroupId?: string;
  makeupBookings?: MakeupClassBooking[];
}

export function DailyAgenda({ 
  onSelectSession, 
  searchQuery, 
  isStudentMode = false, 
  activeGroupId,
  makeupBookings = []
}: DailyAgendaProps) {
  const cambodiaTime = getCambodiaTime();
  const defaultDay = (cambodiaTime.dayName === 'Sunday' ? 'Monday' : cambodiaTime.dayName) as ScheduleSession['day'];
  const [selectedDay, setSelectedDay] = useState<ScheduleSession['day']>(defaultDay);
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');

  const days = SCHEDULE_DATA.meta.days;
  const timeSlots = SCHEDULE_DATA.meta.timeSlots;

  // Compile regular + make-up sessions
  const combinedSessions: ScheduleSession[] = [
    ...ALL_SESSIONS,
    ...makeupBookings.map(m => ({
      day: m.day,
      time: m.time,
      course: `${m.course} [Make-up]`,
      type: 'Lecture' as const,
      lecturer: `Reserved by ${m.bookedBy}${m.date ? ` (${m.date})` : ''}`,
      room: m.room,
      groupId: m.groupId,
      groupName: m.groupId,
      cohort: m.generation
    }))
  ];

  // Filter sessions for the selected day
  const sessionsOnDay = combinedSessions.filter(s => {
    if (s.day !== selectedDay) return false;
    if (isStudentMode && activeGroupId && s.groupId !== activeGroupId) return false;
    if (!isStudentMode && selectedCohort !== 'ALL' && s.cohort !== selectedCohort) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.course.toLowerCase().includes(q) ||
        s.lecturer.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        (s.groupId && s.groupId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Day Selector & Filters Strip (No-print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-md p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Day selection buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Select Day:
            </span>
            {days.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = cambodiaTime.dayName === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className={`text-[10px] uppercase font-bold px-1 rounded ${
                      isSelected ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cohort filter (only in Class Monitor mode) */}
          {!isStudentMode ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cohort:</span>
              {['ALL', 'I2', 'I3', 'I4'].map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    selectedCohort === cohort
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cohort}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Class:</span>
              <span className="font-mono font-bold text-sky-400">{activeGroupId}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
          <span>
            Displaying schedule for <strong className="text-slate-200">{selectedDay}</strong>
          </span>
          <span className="font-mono">{sessionsOnDay.length} sessions listed</span>
        </div>
      </div>

      {/* Hourly Timeline */}
      <div className="space-y-4">
        {timeSlots.map((slot) => {
          const sessionsInSlot = sessionsOnDay.filter(s => s.time === slot);
          const liveStatus = getSlotLiveStatus(slot, selectedDay, cambodiaTime);

          return (
            <div
              key={slot}
              className={`bg-slate-900 border rounded-md p-4 transition-all ${
                liveStatus.isCurrent
                  ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-800'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-bold text-sm text-slate-200">{slot}</span>
                  {liveStatus.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Live Now
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {sessionsInSlot.length} class{sessionsInSlot.length !== 1 ? 'es' : ''}
                </span>
              </div>

              {/* Sessions Grid */}
              {sessionsInSlot.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-1">
                  No classes scheduled for this period.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sessionsInSlot.map((session, idx) => {
                    const style = getSessionTypeStyle(session.type);
                    const isMakeup = session.course.includes('[Make-up]');

                    return (
                      <div
                        key={idx}
                        onClick={() => onSelectSession(session)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          isMakeup 
                            ? 'bg-amber-950/40 border-amber-800 text-amber-200' 
                            : style.card
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isMakeup ? 'bg-amber-950 text-amber-300 border border-amber-800' : style.badge
                          }`}>
                            {isMakeup ? 'Make-up' : session.type}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {session.groupId}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-100 line-clamp-1">
                          {session.course}
                        </h4>
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">{session.lecturer}</span>
                          <span className="font-mono shrink-0 ml-1">{session.room}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
