import { useState } from 'react';
import { 
  SCHEDULE_DATA, 
  ALL_SESSIONS, 
  ScheduleSession, 
  getSessionTypeStyle,
  getCambodiaTime,
  getSlotLiveStatus
} from '../data/scheduleData';
import { 
  isBookingInTargetWeek, 
  isCancellationInTargetWeek,
  isBookingInCurrentWeek, 
  isCancellationInCurrentWeek,
  MakeupClassBooking, 
  CancelledClassSession,
  getActiveWeekBounds
} from './MakeupClassBookingModal';
import { Clock, Ban, Calendar, CalendarDays, AlertTriangle } from 'lucide-react';

interface DailyAgendaProps {
  onSelectSession: (session: ScheduleSession) => void;
  searchQuery: string;
  isStudentMode?: boolean;
  activeGroupId?: string;
  makeupBookings?: MakeupClassBooking[];
  cancelledClasses?: CancelledClassSession[];
  weekOffset?: 0 | 1;
  onSelectWeekOffset?: (offset: 0 | 1) => void;
}

export function DailyAgenda({ 
  onSelectSession, 
  searchQuery, 
  isStudentMode = false, 
  activeGroupId,
  makeupBookings = [],
  cancelledClasses = [],
  weekOffset,
  onSelectWeekOffset
}: DailyAgendaProps) {
  const [localWeekOffset, setLocalWeekOffset] = useState<0 | 1>(0);
  const currentWeekOffset = weekOffset !== undefined ? weekOffset : localWeekOffset;
  const handleWeekChange = (offset: 0 | 1) => {
    if (onSelectWeekOffset) onSelectWeekOffset(offset);
    setLocalWeekOffset(offset);
  };

  const cambodiaTime = getCambodiaTime();
  const weekBounds = getActiveWeekBounds(currentWeekOffset);
  const thisWeekBounds = getActiveWeekBounds(0);
  const nextWeekBounds = getActiveWeekBounds(1);

  const defaultDay = (cambodiaTime.dayName === 'Sunday' ? 'Monday' : cambodiaTime.dayName) as ScheduleSession['day'];
  const [selectedDay, setSelectedDay] = useState<ScheduleSession['day']>(defaultDay);
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');

  const days = SCHEDULE_DATA.meta.days;
  const timeSlots = SCHEDULE_DATA.meta.timeSlots;

  // Filter active make-up bookings and cancelled classes for the selected week
  const activeMakeups = makeupBookings.filter(m => isBookingInTargetWeek(m, currentWeekOffset));
  const activeCancellations = cancelledClasses.filter(c => isCancellationInTargetWeek(c, currentWeekOffset));

  // Overwrite regular classes with make-up classes on the same day, time, and group,
  // and mark cancelled regular classes so students see them as Cancelled
  const regularProcessed: ScheduleSession[] = ALL_SESSIONS
    .filter(reg => {
      const isOverwritten = activeMakeups.some(m => 
        m.groupId === reg.groupId &&
        m.day === reg.day &&
        (m.timeSlots ? m.timeSlots.includes(reg.time) : (m.time === reg.time || m.time.includes(reg.time)))
      );
      return !isOverwritten;
    })
    .map(reg => {
      const cancelled = activeCancellations.find(
        c => c.groupId === reg.groupId && c.day === reg.day && c.time === reg.time
      );
      if (cancelled) {
        return {
          ...reg,
          isCancelledThisWeek: true,
          cancelledData: cancelled
        } as ScheduleSession;
      }
      return reg;
    });

  const makeupSessions: ScheduleSession[] = activeMakeups.flatMap(m => {
    const slots = (m.timeSlots && m.timeSlots.length > 0) ? m.timeSlots : [m.time];
    const chosenType = m.sessionType || 'Lecture';
    return slots.map(slot => ({
      day: m.day,
      time: slot,
      course: `${m.course} [Make-up]`,
      type: chosenType,
      lecturer: `Booked by ${m.bookedBy}${m.date ? ` (${m.date})` : ''}`,
      room: m.room,
      groupId: m.groupId,
      groupName: m.groupId,
      cohort: m.generation || (m.groupId.split('-')[0]),
      makeupBookingData: m
    } as ScheduleSession));
  });

  const combinedSessions: ScheduleSession[] = [...regularProcessed, ...makeupSessions];

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
      <div className="no-print bg-slate-900 border border-slate-800 rounded-md p-2.5 sm:p-3 space-y-2.5 shadow-xs">
        
        {/* Week Switcher Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Academic Week:
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => handleWeekChange(0)}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentWeekOffset === 0
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">This Week ({thisWeekBounds.formattedWeekRange})</span>
                <span className="sm:hidden">This Week</span>
              </button>
              <button
                type="button"
                onClick={() => handleWeekChange(1)}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentWeekOffset === 1
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Next Week ({nextWeekBounds.formattedWeekRange})</span>
                <span className="sm:hidden">Next Week</span>
              </button>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {weekBounds.formattedWeekRange}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Day selection buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Day:
            </span>
            {days.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = currentWeekOffset === 0 && cambodiaTime.dayName === day;
              const dayDate = weekBounds.dayDatesMap[day];
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span className="font-semibold">{day}</span>
                  {dayDate && (
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                      {dayDate.split('-').slice(1).join('/')}
                    </span>
                  )}
                  {isToday && (
                    <span className={`text-[9px] uppercase font-bold px-1 rounded ${
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
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Cohort:</span>
              {['ALL', 'I1', 'I2', 'I3', 'I4'].map((cohort) => (
                <button
                  key={cohort}
                  onClick={() => setSelectedCohort(cohort)}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors cursor-pointer ${
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

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
          <span>
            Schedule for <strong className="text-slate-200">{selectedDay} ({weekBounds.dayDatesMap[selectedDay]})</strong>
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
                    const isCancelled = Boolean((session as any).isCancelledThisWeek);
                    const isTemporary = Boolean(session.isTemporaryRoom);
                    const cancelledData = (session as any).cancelledData as CancelledClassSession | undefined;

                    return (
                      <div
                        key={idx}
                        onClick={() => onSelectSession(session)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          isCancelled
                            ? 'bg-rose-950/35 border-rose-800/80 text-rose-200'
                            : isMakeup 
                            ? 'bg-amber-950/40 border-amber-800 text-amber-200' 
                            : isTemporary
                            ? 'bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/50 shadow-xs'
                            : style.card
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          {isCancelled ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              <span>Cancelled</span>
                            </span>
                          ) : isMakeup ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                Make-up
                              </span>
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                                {session.type}
                              </span>
                            </div>
                          ) : isTemporary ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/70 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Temp Room</span>
                              </span>
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                                {session.type}
                              </span>
                            </div>
                          ) : (
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                              {session.type}
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-slate-400">
                            {session.groupId}
                          </span>
                        </div>
                        <h4 className={`font-semibold text-xs line-clamp-1 ${
                          isCancelled ? 'text-slate-300 line-through decoration-rose-400' : isTemporary ? 'text-amber-100 font-bold' : 'text-slate-100'
                        }`}>
                          {session.course.replace(' [Make-up]', '')}
                        </h4>
                        {isTemporary && (
                          <div className="mt-1 text-[10px] text-amber-300 font-medium truncate flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>Relocated to Room A-402</span>
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">
                            {isCancelled && cancelledData
                              ? `Cancelled by ${cancelledData.cancelledBy}`
                              : session.lecturer}
                          </span>
                          <span className={`font-mono shrink-0 ml-1 ${
                            isCancelled 
                              ? 'text-emerald-300' 
                              : isTemporary 
                              ? 'text-amber-300 font-bold' 
                              : ''
                          }`}>
                            {isCancelled ? `${session.room || 'TBD'} (Free)` : session.room || 'TBD'}
                            {isTemporary && ' (Temp)'}
                          </span>
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
