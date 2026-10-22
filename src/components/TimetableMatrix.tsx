import { useState } from 'react';
import { 
  SCHEDULE_DATA, 
  GroupSchedule, 
  ScheduleSession, 
  getSessionTypeStyle,
  getCambodiaTime,
  getSlotLiveStatus
} from '../data/scheduleData';
import { downloadCohortIcs } from '../utils/calendarExport';
import { MakeupClassBooking } from './MakeupClassBookingModal';
import { 
  Search, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  Download, 
  Calendar, 
  Printer, 
  Check,
  RefreshCw,
  Building2,
  ExternalLink
} from 'lucide-react';

interface TimetableMatrixProps {
  searchQuery: string;
  onSelectSession: (session: ScheduleSession) => void;
  selectedCohort: string;
  onSelectCohort: (cohort: string) => void;
  selectedGroup: string;
  onSelectGroup: (groupId: string) => void;
  myCohort?: string;
  onSetMyCohort?: (groupId: string) => void;
  isStudentMode?: boolean;
  onChangeClass?: () => void;
  onOpenFreeRooms?: () => void;
  makeupBookings?: MakeupClassBooking[];
}

export function TimetableMatrix({
  searchQuery,
  onSelectSession,
  selectedCohort,
  onSelectCohort,
  selectedGroup,
  onSelectGroup,
  myCohort,
  onSetMyCohort,
  isStudentMode = false,
  onChangeClass,
  onOpenFreeRooms,
  makeupBookings = []
}: TimetableMatrixProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cambodiaTime = getCambodiaTime();
  const days = SCHEDULE_DATA.meta.days;
  const timeSlots = SCHEDULE_DATA.meta.timeSlots;

  // Filter available groups based on selected cohort (for class monitor view)
  const filteredGroups = selectedCohort === 'ALL'
    ? SCHEDULE_DATA.groups
    : SCHEDULE_DATA.groups.filter(g => g.cohort === selectedCohort);

  // Active group object
  const activeGroup = SCHEDULE_DATA.groups.find(g => g.id === selectedGroup) || SCHEDULE_DATA.groups[0];

  const isMyCohort = myCohort === activeGroup.id;

  // Helper to find session for day and time slot (including booked make-up sessions)
  const getSessionForSlot = (day: string, slot: string): ScheduleSession | undefined => {
    const regular = activeGroup.schedule.find(s => s.day === day && s.time === slot);
    if (regular) return regular;

    const makeup = makeupBookings.find(m => m.groupId === activeGroup.id && m.day === day && m.time === slot);
    if (makeup) {
      return {
        day: makeup.day,
        time: makeup.time,
        course: `${makeup.course} [Make-up]`,
        type: 'Lecture',
        lecturer: `Reserved by ${makeup.bookedBy}${makeup.date ? ` (${makeup.date})` : ''}`,
        room: makeup.room,
        groupId: makeup.groupId,
        groupName: activeGroup.name,
        cohort: activeGroup.cohort
      };
    }

    return undefined;
  };

  const isMatchedBySearch = (session: ScheduleSession): boolean => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      session.course.toLowerCase().includes(query) ||
      session.lecturer.toLowerCase().includes(query) ||
      session.room.toLowerCase().includes(query) ||
      session.type.toLowerCase().includes(query)
    );
  };

  const handleExportIcs = () => {
    downloadCohortIcs(activeGroup);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Controls Strip (No-print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-md p-4 space-y-3">
        
        {/* If Student Mode: Only show their class, with a clean "Change Class" option (no other cohorts/generations) */}
        {isStudentMode ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                My Class:
              </span>
              <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-800 px-3 py-1 rounded-md">
                <span className="text-xs font-bold font-mono text-sky-300">{activeGroup.id}</span>
              </div>
              {onChangeClass && (
                <button
                  onClick={onChangeClass}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Change</span>
                </button>
              )}
            </div>

            {/* Right Actions: Find Free Room, Moodle, Export .ics & Print */}
            <div className="flex items-center gap-2 flex-wrap">
              {onOpenFreeRooms && (
                <button
                  onClick={onOpenFreeRooms}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Find Free Room</span>
                </button>
              )}

              <a
                href="https://moodle.ccun.edu.kh/login/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 hover:text-white transition-colors"
              >
                <span>Moodle</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>

              <button
                onClick={handleExportIcs}
                title="Download iCalendar (.ics) for Google/Apple Calendar"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 hover:text-white transition-colors"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">.ics saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export .ics</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                title="Print Schedule / Export PDF"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Class Monitor Mode: Full administrative cohort switcher and group selector */
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">
                  Cohort:
                </span>
                {['ALL', 'I2', 'I3', 'I4'].map((cohort) => (
                  <button
                    key={cohort}
                    onClick={() => {
                      onSelectCohort(cohort);
                      if (cohort !== 'ALL') {
                        const firstGroup = SCHEDULE_DATA.groups.find(g => g.cohort === cohort);
                        if (firstGroup) onSelectGroup(firstGroup.id);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      selectedCohort === cohort
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cohort === 'ALL' ? 'All' : cohort}
                  </button>
                ))}
              </div>

              {/* Right Actions: Export .ics & Print */}
              <div className="flex items-center gap-2 flex-wrap">
                {onSetMyCohort && (
                  <button
                    onClick={() => onSetMyCohort(activeGroup.id)}
                    title={isMyCohort ? "Currently pinned as your default cohort" : "Pin this group as your default cohort"}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors ${
                      isMyCohort
                        ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isMyCohort ? 'fill-sky-400 text-sky-400' : ''}`} />
                    <span>{isMyCohort ? 'Pinned' : 'Pin Group'}</span>
                  </button>
                )}

                <button
                  onClick={handleExportIcs}
                  title="Download iCalendar (.ics) for Google/Apple Calendar"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 hover:text-white transition-colors"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Downloaded .ics!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Export Calendar (.ics)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  title="Print Schedule / Export PDF"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 rounded transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Group Selector Bar (Only in Class Monitor Mode) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider shrink-0">
                Group:
              </span>
              {filteredGroups.map((group) => {
                const isSelected = group.id === activeGroup.id;
                const isGroupMyCohort = myCohort === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{group.id}</span>
                    {isGroupMyCohort && (
                      <Bookmark className="w-3 h-3 fill-sky-400 text-sky-400 shrink-0" />
                    )}
                    <span className="text-[10px] opacity-75 hidden sm:inline">
                      ({group.schedule.length} slots)
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* Printable Title Block */}
      <div className="print-only mb-4 text-center">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
          Institute of Technology of Cambodia
        </h1>
        <h2 className="text-sm font-medium text-slate-700">
          International Engineering School · {SCHEDULE_DATA.meta.academicYear} · {SCHEDULE_DATA.meta.semester}
        </h2>
        <p className="text-xs font-bold mt-1 text-slate-800">
          Weekly Timetable: {activeGroup.name} ({activeGroup.id})
        </p>
      </div>

      {/* Weekly Timetable Matrix Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden shadow-xs print-card">
        
        {/* Mobile horizontal scroll hint */}
        <div className="no-print sm:hidden flex items-center justify-between px-3 py-2 bg-slate-850 border-b border-slate-800 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <span>Scroll horizontally for all days</span>
            <span className="text-sky-400 font-bold">→</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">6 Days (Mon–Sat)</span>
        </div>

        {/* Table container for responsive horizontal scrolling on small screens */}
        <div className="overflow-x-auto w-full overscroll-x-contain">
          <table className="w-full min-w-[760px] md:min-w-full border-collapse text-left print-table">
            <thead>
              <tr className="bg-slate-800/95 border-b border-slate-700">
                <th className="sticky left-0 z-20 bg-slate-800 p-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 w-28 text-center shrink-0 border-r border-slate-700 shadow-[2px_0_6px_rgba(0,0,0,0.4)]">
                  Time Slot
                </th>
                {days.map((day) => {
                  const isToday = cambodiaTime.dayName === day;
                  return (
                    <th 
                      key={day}
                      className={`p-2.5 text-xs font-semibold text-center border-r border-slate-700 last:border-r-0 ${
                        isToday 
                          ? 'bg-slate-700 text-slate-100 font-bold' 
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{day}</span>
                        {isToday && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-800">
                            Today
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {timeSlots.map((slot, index) => {
                const isAfternoonBreak = index === 4; // Slot 13h00 starts afternoon
                return (
                  <tr 
                    key={slot}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isAfternoonBreak ? 'border-t-2 border-slate-700' : ''
                    }`}
                  >
                    {/* Time slot sticky column */}
                    <td className="sticky left-0 z-10 p-2 font-mono tabular-nums text-xs text-slate-300 font-medium bg-slate-900 text-center border-r border-slate-800 whitespace-nowrap shadow-[2px_0_6px_rgba(0,0,0,0.35)]">
                      <div className="font-bold text-slate-200">{slot}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {index < 4 ? 'Morning' : 'Afternoon'}
                      </div>
                    </td>

                    {/* Day cells */}
                    {days.map((day) => {
                      const session = getSessionForSlot(day, slot);
                      const isToday = cambodiaTime.dayName === day;
                      const status = session ? getSlotLiveStatus(slot, day, cambodiaTime) : null;
                      const matched = session ? isMatchedBySearch(session) : false;

                      if (!session) {
                        return (
                          <td 
                            key={day}
                            className={`p-2 text-center text-slate-700 border-r border-slate-800 last:border-r-0 ${
                              isToday ? 'bg-slate-900/40' : ''
                            }`}
                          >
                            <span className="select-none font-mono text-[11px]">—</span>
                          </td>
                        );
                      }

                      const isMakeup = session.course.includes('[Make-up]');
                      const typeStyle = getSessionTypeStyle(session.type);

                      return (
                        <td 
                          key={day}
                          className={`p-1.5 border-r border-slate-800 last:border-r-0 align-top ${
                            isToday ? 'bg-slate-900/30' : ''
                          }`}
                        >
                          <div
                            onClick={() => onSelectSession({
                              ...session,
                              groupId: activeGroup.id,
                              groupName: activeGroup.name,
                              cohort: activeGroup.cohort
                            })}
                            className={`p-2 rounded border cursor-pointer transition-all duration-150 ${
                              isMakeup
                                ? 'bg-amber-950/40 border-amber-800 text-amber-200 hover:border-amber-500'
                                : typeStyle.card
                            } ${
                              matched 
                                ? 'ring-2 ring-slate-100 shadow-sm' 
                                : ''
                            } ${
                              status?.isCurrent 
                                ? 'ring-2 ring-emerald-400 shadow-sm' 
                                : ''
                            }`}
                          >
                            {/* Type and live status */}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isMakeup ? 'bg-amber-950 text-amber-300 border border-amber-800' : typeStyle.badge
                              }`}>
                                {isMakeup ? 'Make-up' : session.type}
                              </span>
                              {status?.isCurrent && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  NOW
                                </span>
                              )}
                            </div>

                            {/* Course Title */}
                            <h4 className="font-semibold text-slate-100 leading-snug line-clamp-2">
                              {session.course}
                            </h4>

                            {/* Lecturer & Room details */}
                            <div className="mt-2 pt-1.5 border-t border-slate-700/60 space-y-1 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-300 truncate" title={session.lecturer}>
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{session.lecturer}</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{session.room}</span>
                              </div>
                            </div>

                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className="no-print p-3 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">
              Type Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
              <span>Lecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Practical / TP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Tutorial / Make-up</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Exported .ics calendar works seamlessly with Google Calendar, iOS Calendar, and Outlook.
          </div>
        </div>

      </div>
    </div>
  );
}
