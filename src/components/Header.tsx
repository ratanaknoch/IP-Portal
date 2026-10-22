import { useEffect, useState } from 'react';
import { 
  Clock, 
  Printer, 
  ArrowLeft, 
  Building2, 
  Download, 
  Check, 
  Bookmark, 
  Lock, 
  GraduationCap,
  Users,
  Plus,
  ExternalLink
} from 'lucide-react';
import { getCambodiaTime, ALL_SESSIONS, parseSlotMinutes, GroupSchedule } from '../data/scheduleData';
import { downloadCohortIcs } from '../utils/calendarExport';

interface HeaderProps {
  activeMode: 'matrix' | 'lecturer' | 'room' | 'agenda' | 'clubs';
  onSelectMode: (mode: 'matrix' | 'lecturer' | 'room' | 'agenda' | 'clubs') => void;
  onReturnHome?: () => void;
  onOpenFreeRooms?: () => void;
  onOpenBookingModal?: () => void;
  onOpenClubModal?: () => void;
  onChangeClass?: () => void;
  activeGroup?: GroupSchedule;
  portalRole?: 'student' | 'class-monitor';
}

export function Header({
  activeMode,
  onSelectMode,
  onReturnHome,
  onOpenFreeRooms,
  onOpenBookingModal,
  onOpenClubModal,
  onChangeClass,
  activeGroup,
  portalRole = 'student'
}: HeaderProps) {
  const [timeInfo, setTimeInfo] = useState(getCambodiaTime());
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getCambodiaTime());
    }, 10000); // refresh every 10s
    return () => clearInterval(timer);
  }, []);

  // Determine if any session across the school is active right now
  const activeSessionsCount = ALL_SESSIONS.filter(s => {
    if (s.day !== timeInfo.dayName) return false;
    const [start, end] = parseSlotMinutes(s.time);
    return timeInfo.totalMinutes >= start && timeInfo.totalMinutes <= end;
  }).length;

  const handleExportIcs = () => {
    if (activeGroup) {
      downloadCohortIcs(activeGroup);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const isStudent = portalRole === 'student';

  return (
    <header className="border-b border-slate-800 bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone with Official School Logo & Return to Portal Home */}
          <div className="flex items-center gap-3 shrink-0">
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                title="Return to ITC International Program Portal"
                className="no-print p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden lg:inline">Portal Home</span>
              </button>
            )}

            <div 
              onClick={onReturnHome} 
              className={`flex items-center gap-2.5 ${onReturnHome ? 'cursor-pointer group' : ''}`}
              title={onReturnHome ? "Go to Main Portal" : undefined}
            >
              <div className="w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm p-0.5 shadow-md shadow-black/40 border border-white/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/assets/cropped-itc_tight.png"
                  alt="ITC School Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-100 text-sm sm:text-base leading-tight tracking-tight group-hover:text-sky-400 transition-colors">
                    {isStudent ? 'Student Portal' : 'Class Monitor Portal'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    isStudent
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {isStudent ? 'Student' : 'Monitor'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-normal">
                    International Engineering School
                  </span>
                  {isStudent && activeGroup && (
                    <span className="text-[10px] font-mono text-sky-400 hidden sm:inline">
                      · {activeGroup.id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Modes */}
          {/* If Student: ONLY Timetable Matrix, Today's Agenda, and Clubs (per user request!) */}
          {/* If Monitor: Timetable Matrix, By Lecturer, Room Occupancy, Today's Agenda, Book Room */}
          <nav className="no-print hidden md:flex items-center gap-1 p-1 bg-slate-800 rounded-md border border-slate-700/60">
            <button
              onClick={() => onSelectMode('matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeMode === 'matrix'
                  ? 'bg-slate-700 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Timetable Matrix
            </button>

            {!isStudent && (
              <>
                <button
                  onClick={() => onSelectMode('lecturer')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    activeMode === 'lecturer'
                      ? 'bg-slate-700 text-slate-100 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  By Lecturer
                </button>
                <button
                  onClick={() => onSelectMode('room')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    activeMode === 'room'
                      ? 'bg-slate-700 text-slate-100 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Room Occupancy
                </button>
              </>
            )}

            <button
              onClick={() => onSelectMode('agenda')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeMode === 'agenda'
                  ? 'bg-slate-700 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Today's Agenda
            </button>

            {/* Clubs button in Student Portal - triggers under dev popup per user instruction */}
            {isStudent && (
              <button
                onClick={() => (onOpenClubModal ? onOpenClubModal() : onSelectMode('clubs'))}
                className="px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1 text-slate-400 hover:text-slate-100"
              >
                <span>Clubs</span>
                <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Dev
                </span>
              </button>
            )}
          </nav>

          {/* Action Zone: Class Switcher (for students), Free Room Shortcut, Live Clock, Export & Print */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Student Class Switcher */}
            {isStudent && onChangeClass && activeGroup && (
              <button
                onClick={onChangeClass}
                title="Change active class / group"
                className="no-print hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span className="text-[10px] text-slate-400">Class:</span>
                <span className="font-mono font-bold text-sky-400">{activeGroup.id}</span>
              </button>
            )}

            {/* Official Moodle LMS link inside Student Portal */}
            {isStudent && (
              <a
                href="https://moodle.ccun.edu.kh/login/index.php"
                target="_blank"
                rel="noopener noreferrer"
                title="Moodle"
                className="no-print hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 hover:text-white rounded-md text-xs font-semibold transition-colors"
              >
                <span>Moodle</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
            )}

            {/* Monitor Make-up Booking trigger */}
            {!isStudent && onOpenBookingModal && (
              <button
                onClick={onOpenBookingModal}
                title="Book Room for Make-up Class"
                className="no-print hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 rounded-md text-xs font-semibold text-emerald-300 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Book Make-up Class</span>
                <span className="xl:hidden">Book Room</span>
              </button>
            )}

            {/* Find Free Study Room button in Header (Building2 icon, NO AI star) */}
            {onOpenFreeRooms && (
              <button
                onClick={onOpenFreeRooms}
                title="Find a Free Study Room Right Now in Building A & J"
                className="no-print hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden lg:inline">Free Rooms</span>
              </button>
            )}

            {/* Cambodia Time Status */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-mono tabular-nums font-medium text-slate-200">
                  {timeInfo.timeString}
                </span>
                <span className="text-slate-400">UTC+7</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className={`text-[11px] font-medium ${
                activeSessionsCount > 0 
                  ? 'text-emerald-400' 
                  : 'text-slate-400'
              }`}>
                {activeSessionsCount > 0 ? `${activeSessionsCount} in session` : 'No live classes'}
              </span>
            </div>

            {/* Calendar Export Button (.ics) */}
            {activeGroup && (
              <button
                onClick={handleExportIcs}
                title={`Export ${activeGroup.id} schedule to Google/Apple Calendar (.ics)`}
                className="no-print hidden sm:flex items-center gap-1.5 p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md text-xs font-medium transition-colors"
              >
                {downloadSuccess ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-4 h-4 text-sky-400" />
                )}
                <span className="hidden xl:inline">Export .ics</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              aria-label="Print Schedule"
              title="Print Schedule / Export PDF"
              className="no-print p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="no-print md:hidden flex items-center py-2 border-t border-slate-800 overflow-x-auto gap-1.5 scrollbar-none">
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-800 text-slate-200 hover:text-white whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}

          <button
            onClick={() => onSelectMode('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
              activeMode === 'matrix'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-850/60'
            }`}
          >
            Matrix
          </button>

          {!isStudent && (
            <>
              <button
                onClick={() => onSelectMode('lecturer')}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                  activeMode === 'lecturer'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-850/60'
                }`}
              >
                Lecturers
              </button>
              <button
                onClick={() => onSelectMode('room')}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                  activeMode === 'room'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-850/60'
                }`}
              >
                Rooms
              </button>
            </>
          )}

          <button
            onClick={() => onSelectMode('agenda')}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
              activeMode === 'agenda'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-850/60'
            }`}
          >
            Agenda
          </button>

          {isStudent && (
            <button
              onClick={() => (onOpenClubModal ? onOpenClubModal() : onSelectMode('clubs'))}
              className="px-2.5 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 text-slate-400 bg-slate-850/60 flex items-center gap-1"
            >
              <span>Clubs</span>
              <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Dev
              </span>
            </button>
          )}

          {/* Student Class Switcher on Mobile */}
          {isStudent && onChangeClass && activeGroup && (
            <button
              onClick={onChangeClass}
              className="px-2.5 py-1.5 text-xs font-medium rounded bg-sky-950/80 border border-sky-800 text-sky-300 whitespace-nowrap flex items-center gap-1 shrink-0"
              title="Change your class"
            >
              <span className="text-[10px] text-slate-400">Class:</span>
              <span className="font-mono font-bold text-sky-300">{activeGroup.id}</span>
            </button>
          )}

          {/* Monitor Make-up Booking trigger on Mobile */}
          {!isStudent && onOpenBookingModal && (
            <button
              onClick={onOpenBookingModal}
              className="px-2.5 py-1.5 text-xs font-medium rounded bg-emerald-950 border border-emerald-700 text-emerald-300 whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>
          )}

          {onOpenFreeRooms && (
            <button
              onClick={onOpenFreeRooms}
              className="px-2.5 py-1.5 text-xs font-medium rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap flex items-center gap-1 shrink-0 hover:text-white"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Rooms</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
