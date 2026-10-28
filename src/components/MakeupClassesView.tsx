import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lock,
  BookOpen,
  X,
  Ban,
  CalendarDays
} from 'lucide-react';
import { SCHEDULE_DATA, ALL_SESSIONS, ScheduleSession } from '../data/scheduleData';
import {
  MakeupClassBooking,
  CancelledClassSession,
  MakeupSessionType,
  ScheduleDay,
  isBookingExpired,
  isCancellationExpired,
  isBookingInTargetWeek,
  isCancellationInTargetWeek,
  canDeleteMakeupBooking,
  canManageCancelledClass,
  getActiveWeekBounds
} from './MakeupClassBookingModal';
import { UserProfile } from '../lib/firebase';

interface MakeupClassesViewProps {
  makeupBookings: MakeupClassBooking[];
  cancelledClasses: CancelledClassSession[];
  currentUserProfile?: UserProfile | null;
  isStudentMode?: boolean;
  activeGroupId?: string;
  searchQuery?: string;
  weekOffset?: 0 | 1;
  onSelectWeekOffset?: (offset: 0 | 1) => void;
  onOpenBookingModal?: () => void;
  onDeleteMakeupBooking?: (id: string) => void;
  onSaveCancelledClass?: (item: CancelledClassSession) => void;
  onDeleteCancelledClass?: (id: string) => void;
  onSelectSession?: (session: ScheduleSession) => void;
}

export function MakeupClassesView({
  makeupBookings = [],
  cancelledClasses = [],
  currentUserProfile,
  isStudentMode = false,
  activeGroupId,
  searchQuery = '',
  weekOffset,
  onSelectWeekOffset,
  onOpenBookingModal,
  onDeleteMakeupBooking,
  onSaveCancelledClass,
  onDeleteCancelledClass
}: MakeupClassesViewProps) {
  const [localWeekOffset, setLocalWeekOffset] = useState<0 | 1>(0);
  const currentWeekOffset = weekOffset !== undefined ? weekOffset : localWeekOffset;
  const handleWeekChange = (offset: 0 | 1) => {
    if (onSelectWeekOffset) onSelectWeekOffset(offset);
    setLocalWeekOffset(offset);
  };

  const weekBounds = useMemo(() => getActiveWeekBounds(currentWeekOffset), [currentWeekOffset]);
  const thisWeekBounds = useMemo(() => getActiveWeekBounds(0), []);
  const nextWeekBounds = useMemo(() => getActiveWeekBounds(1), []);

  // Week scope filter: 'selected' (filters to active currentWeekOffset) | 'all' (all upcoming)
  const [weekScope, setWeekScope] = useState<'selected' | 'all'>('selected');

  // View filter: 'makeup' | 'cancelled' | 'all'
  const [sectionTab, setSectionTab] = useState<'all' | 'makeup' | 'cancelled'>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MakeupSessionType>('ALL');
  const [dayFilter, setDayFilter] = useState<string>('ALL');

  // Confirmation modal states
  const [bookingToDelete, setBookingToDelete] = useState<MakeupClassBooking | null>(null);
  const [cancellationToRestore, setCancellationToRestore] = useState<CancelledClassSession | null>(null);

  // Quick "Mark Class as Cancelled" modal state for Class Monitors / Admin
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelWeekOffset, setCancelWeekOffset] = useState<0 | 1>(0);
  const [cancelGroup, setCancelGroup] = useState<string>(
    currentUserProfile?.groupId && currentUserProfile.groupId !== 'Alumni' && currentUserProfile.groupId !== 'I5'
      ? currentUserProfile.groupId
      : activeGroupId || 'I2-SE'
  );
  const [cancelDay, setCancelDay] = useState<ScheduleDay>('Monday');
  const [selectedSessionKey, setSelectedSessionKey] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelError, setCancelError] = useState<string>('');

  const canMonitorOrAdmin =
    !isStudentMode ||
    currentUserProfile?.role === 'monitor' ||
    currentUserProfile?.role === 'admin';

  // Active non-expired make-up bookings & cancelled classes
  const activeMakeups = useMemo(
    () => makeupBookings.filter(b => !isBookingExpired(b)),
    [makeupBookings]
  );

  const activeCancellations = useMemo(
    () => cancelledClasses.filter(c => !isCancellationExpired(c)),
    [cancelledClasses]
  );

  // Next week count badges
  const nextWeekMakeupsCount = useMemo(
    () => activeMakeups.filter(b => isBookingInTargetWeek(b, 1)).length,
    [activeMakeups]
  );

  const thisWeekMakeupsCount = useMemo(
    () => activeMakeups.filter(b => isBookingInTargetWeek(b, 0)).length,
    [activeMakeups]
  );

  // Filtered Make-up Classes
  const filteredMakeups = useMemo(() => {
    return activeMakeups.filter(b => {
      if (weekScope === 'selected' && !isBookingInTargetWeek(b, currentWeekOffset)) {
        return false;
      }
      const bCohort = b.generation || (b.groupId ? b.groupId.split('-')[0] : '');
      if (cohortFilter !== 'ALL' && bCohort !== cohortFilter) return false;
      if (groupFilter !== 'ALL' && b.groupId !== groupFilter) return false;
      if (typeFilter !== 'ALL' && (b.sessionType || 'Lecture') !== typeFilter) return false;
      if (dayFilter !== 'ALL' && b.day !== dayFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.course.toLowerCase().includes(q) ||
          b.room.toLowerCase().includes(q) ||
          b.groupId.toLowerCase().includes(q) ||
          b.bookedBy.toLowerCase().includes(q) ||
          (b.sessionType || 'Lecture').toLowerCase().includes(q) ||
          (b.note && b.note.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [activeMakeups, weekScope, currentWeekOffset, cohortFilter, groupFilter, typeFilter, dayFilter, searchQuery]);

  // Filtered Cancelled Classes
  const filteredCancellations = useMemo(() => {
    return activeCancellations.filter(c => {
      if (weekScope === 'selected' && !isCancellationInTargetWeek(c, currentWeekOffset)) {
        return false;
      }
      const cCohort = c.cohort || (c.groupId ? c.groupId.split('-')[0] : '');
      if (cohortFilter !== 'ALL' && cCohort !== cohortFilter) return false;
      if (groupFilter !== 'ALL' && c.groupId !== groupFilter) return false;
      if (dayFilter !== 'ALL' && c.day !== dayFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.course.toLowerCase().includes(q) ||
          c.room.toLowerCase().includes(q) ||
          c.groupId.toLowerCase().includes(q) ||
          c.lecturer.toLowerCase().includes(q) ||
          c.cancelledBy.toLowerCase().includes(q) ||
          (c.reason && c.reason.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [activeCancellations, weekScope, currentWeekOffset, cohortFilter, groupFilter, dayFilter, searchQuery]);

  // Sessions available to cancel in the modal for selected group & day
  const sessionsForCancelModal = useMemo(() => {
    return ALL_SESSIONS.filter(s => s.groupId === cancelGroup && s.day === cancelDay);
  }, [cancelGroup, cancelDay]);

  const handleConfirmCancelClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveCancelledClass) return;

    const targetSession = sessionsForCancelModal.find(
      s => `${s.day}|${s.time}|${s.course}` === selectedSessionKey
    );

    if (!targetSession) {
      setCancelError('Please select a scheduled class session to mark as cancelled.');
      return;
    }

    const cancelBounds = getActiveWeekBounds(cancelWeekOffset);
    const targetDate = cancelBounds.dayDatesMap[targetSession.day];
    const alreadyCancelled = activeCancellations.some(
      c =>
        c.groupId === cancelGroup &&
        c.day === targetSession.day &&
        c.time === targetSession.time &&
        c.date === targetDate
    );

    if (alreadyCancelled) {
      setCancelError(`This class session is already marked as cancelled for ${cancelBounds.weekLabel.toLowerCase()} (${targetDate}).`);
      return;
    }

    const monitorName = currentUserProfile?.displayName
      ? currentUserProfile.displayName
      : currentUserProfile?.email
      ? currentUserProfile.email.split('@')[0]
      : 'Class Monitor';

    const matchedGroup = SCHEDULE_DATA.groups.find(g => g.id === cancelGroup);

    const newCancel: CancelledClassSession = {
      id: `cancel-${cancelGroup}-${targetDate}-${targetSession.time.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
      groupId: cancelGroup,
      cohort: matchedGroup?.cohort || cancelGroup.split('-')[0] || 'I2',
      day: targetSession.day,
      date: targetDate,
      time: targetSession.time,
      course: targetSession.course,
      type: targetSession.type,
      lecturer: targetSession.lecturer,
      room: targetSession.room,
      cancelledBy: monitorName,
      cancelledByUid: currentUserProfile?.uid || '',
      cancelledByEmail: currentUserProfile?.email || '',
      reason: cancelReason.trim() || `Cancelled for ${cancelBounds.weekLabel}`,
      createdAt: new Date().toISOString()
    };

    onSaveCancelledClass(newCancel);
    setIsCancelModalOpen(false);
    setSelectedSessionKey('');
    setCancelReason('');
    setCancelError('');
  };

  const getMakeupTypeBadge = (t?: MakeupSessionType) => {
    switch (t) {
      case 'Tutorial':
        return 'bg-amber-950 text-amber-300 border border-amber-800';
      case 'Practical':
        return 'bg-sky-950 text-sky-300 border border-sky-800';
      case 'Lecture':
      default:
        return 'bg-indigo-950 text-indigo-300 border border-indigo-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Overview & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-3 sm:p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Make-up Classes & Weekly Schedule Changes
              </h2>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded">
                Week: {weekBounds.formattedWeekRange}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              All scheduled make-up classes and cancelled classes remain visible on the calendar throughout the week and reset automatically every Sunday.
            </p>
          </div>

          {/* Actions for Class Monitors & Admin */}
          {canMonitorOrAdmin && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onSaveCancelledClass && (
                <button
                  type="button"
                  onClick={() => {
                    setCancelError('');
                    setSelectedSessionKey('');
                    setCancelReason('');
                    setIsCancelModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-700 text-rose-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mark Class Cancelled</span>
                </button>
              )}

              {onOpenBookingModal && (
                <button
                  type="button"
                  onClick={onOpenBookingModal}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Make-up Class</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Academic Week Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
              Academic Week:
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setWeekScope('selected');
                  handleWeekChange(0);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  weekScope === 'selected' && currentWeekOffset === 0
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>This Week</span>
                <span className="text-[10px] font-mono opacity-80">({thisWeekBounds.formattedWeekRange})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeekScope('selected');
                  handleWeekChange(1);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  weekScope === 'selected' && currentWeekOffset === 1
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Next Week</span>
                <span className="text-[10px] font-mono opacity-80">({nextWeekBounds.formattedWeekRange})</span>
                {nextWeekMakeupsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    +{nextWeekMakeupsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setWeekScope('all')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  weekScope === 'all'
                    ? 'bg-slate-800 text-white shadow-2xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>All Active Upcoming</span>
                <span className="text-[10px] font-mono opacity-80">({activeMakeups.length})</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Active: <span className="text-emerald-300 font-bold">{activeMakeups.length} make-up</span> · <span className="text-rose-300 font-bold">{activeCancellations.length} cancelled</span>
          </div>
        </div>

        {/* Next Week Info Banner */}
        {weekScope === 'selected' && currentWeekOffset === 1 && (
          <div className="p-3 rounded-lg bg-sky-950/70 border border-sky-800 text-xs text-sky-200 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                <strong>Viewing Next Week Schedule Changes ({nextWeekBounds.formattedWeekRange}).</strong> Make-up classes booked for next week are shown below and appear on the Next Week timetable matrix.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleWeekChange(0)}
              className="px-2.5 py-1 rounded bg-sky-900 hover:bg-sky-800 text-sky-100 font-bold text-xs cursor-pointer transition-colors"
            >
              Switch to This Week
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* View Mode Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSectionTab('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                sectionTab === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({filteredMakeups.length + filteredCancellations.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('makeup')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                sectionTab === 'makeup'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Make-up Classes ({filteredMakeups.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('cancelled')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                sectionTab === 'cancelled'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cancelled Classes ({filteredCancellations.length})
            </button>
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Option:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'ALL' | MakeupSessionType)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 font-medium cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="Lecture">Lecture</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Practical">Practical</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Cohort:</span>
              <select
                value={cohortFilter}
                onChange={(e) => {
                  setCohortFilter(e.target.value);
                  setGroupFilter('ALL');
                }}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 font-medium cursor-pointer"
              >
                <option value="ALL">All Cohorts</option>
                <option value="I1">I1</option>
                <option value="I2">I2</option>
                <option value="I3">I3</option>
                <option value="I4">I4</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Class:</span>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono font-medium cursor-pointer"
              >
                <option value="ALL">All Classes</option>
                {SCHEDULE_DATA.groups
                  .filter(g => cohortFilter === 'ALL' || g.cohort === cohortFilter)
                  .map(g => (
                    <option key={g.id} value={g.id}>
                      {g.id}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Day:</span>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 font-medium cursor-pointer"
              >
                <option value="ALL">All Days</option>
                {SCHEDULE_DATA.meta.days.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: SCHEDULED MAKE-UP CLASSES */}
      {(sectionTab === 'all' || sectionTab === 'makeup') && (
        <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-bold text-white">
                Scheduled Make-up Classes ({filteredMakeups.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Only the booking Class Monitor or Admin can delete a make-up session
            </span>
          </div>

          {filteredMakeups.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No make-up classes scheduled for this filter
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When a Class Monitor books a room for a Make-up Lecture, Tutorial, or Practical, it will appear here and on the weekly timetable until Sunday.
              </p>
              {canMonitorOrAdmin && onOpenBookingModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenBookingModal}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book First Make-up Class</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 sm:p-4">
              {filteredMakeups.map((booking) => {
                const canDelete = canDeleteMakeupBooking(booking, currentUserProfile);
                const sType = booking.sessionType || 'Lecture';

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-2.5">
                      {/* Header Row: Badges + Delete / Protected */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {booking.groupId}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${getMakeupTypeBadge(sType)}`}>
                            {sType}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isBookingInTargetWeek(booking, 0)
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}>
                            {isBookingInTargetWeek(booking, 0) ? 'This Week' : isBookingInTargetWeek(booking, 1) ? 'Next Week' : 'Upcoming'}
                          </span>
                          <span className="text-xs text-amber-300 font-semibold">
                            · Make-up Class
                          </span>
                        </div>

                        {canDelete && onDeleteMakeupBooking ? (
                          <button
                            type="button"
                            onClick={() => setBookingToDelete(booking)}
                            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            title="Delete this make-up class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-[11px] text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0"
                            title={`Only ${booking.bookedBy} or Admin can delete this booking`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>By {booking.bookedBy}</span>
                          </span>
                        )}
                      </div>

                      {/* Course Name */}
                      <h4 className="text-base font-bold text-white leading-snug">
                        {booking.course}
                      </h4>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="font-mono font-semibold text-sky-300">
                            {booking.day}, {booking.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono tabular-nums font-semibold text-slate-200">
                            {booking.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-mono font-bold text-amber-300">
                            {booking.room}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Booked by <strong className="text-white">{booking.bookedBy}</strong>
                          </span>
                        </div>
                      </div>

                      {booking.note && (
                        <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-xs text-slate-300">
                          <span className="text-slate-400 font-medium">Note: </span>
                          <span>{booking.note}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Visible on timetable calendar</span>
                      <span className="font-mono">Resets Sunday ({weekBounds.nextSundayReset})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CANCELLED CLASSES THIS WEEK */}
      {(sectionTab === 'all' || sectionTab === 'cancelled') && (
        <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <h3 className="text-sm font-bold text-white">
                Classes Marked as Cancelled This Week ({filteredCancellations.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Cancelled class rooms are released for study or make-up bookings this week
            </span>
          </div>

          {filteredCancellations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No classes marked as cancelled for this week
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Class Monitors can mark a class as cancelled for the current week either from here or by clicking any class directly on the Timetable Matrix.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 sm:p-4">
              {filteredCancellations.map((item) => {
                const canRestore = canManageCancelledClass(item, currentUserProfile);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/70 hover:border-rose-800 flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            {item.groupId}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-900/80 text-rose-100">
                            Cancelled Class
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isCancellationInTargetWeek(item, 0)
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}>
                            {isCancellationInTargetWeek(item, 0) ? 'This Week' : isCancellationInTargetWeek(item, 1) ? 'Next Week' : 'Upcoming'}
                          </span>
                          <span className="text-xs text-slate-400">
                            · {item.type}
                          </span>
                        </div>

                        {canRestore && onDeleteCancelledClass ? (
                          <button
                            type="button"
                            onClick={() => setCancellationToRestore(item)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            title="Restore this class back to the active weekly schedule"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Restore Class</span>
                          </button>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-[11px] text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0"
                            title={`Marked cancelled by ${item.cancelledBy}`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>By {item.cancelledBy}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-200 line-through decoration-rose-400/80 leading-snug">
                        {item.course}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="font-mono font-semibold text-rose-200">
                            {item.day}, {item.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono tabular-nums font-semibold text-slate-200">
                            {item.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono font-semibold text-emerald-300">
                            {item.room || 'Room TBD'} (Room Released)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.lecturer}</span>
                        </div>
                      </div>

                      {item.reason && (
                        <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                          <span className="text-slate-400 font-medium">Reason / Note: </span>
                          <span>{item.reason}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Marked by {item.cancelledBy}</span>
                      <span className="font-mono text-emerald-400">Resets Sunday ({weekBounds.nextSundayReset})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: DELETE MAKE-UP CLASS CONFIRMATION                            */}
      {/* ===================================================================== */}
      {bookingToDelete && onDeleteMakeupBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
          onClick={() => setBookingToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Delete Make-up Class?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Please confirm deletion of this scheduled make-up session.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{bookingToDelete.course}</span>
                <span className="font-mono font-bold text-emerald-400">{bookingToDelete.groupId}</span>
              </div>
              <div className="text-slate-300 font-mono">
                {bookingToDelete.sessionType || 'Lecture'} · {bookingToDelete.room}
              </div>
              <div className="text-slate-400 font-mono">
                {bookingToDelete.day}, {bookingToDelete.date} ({bookingToDelete.time})
              </div>
              <div className="text-slate-400">
                Booked by: <strong className="text-slate-200">{bookingToDelete.bookedBy}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMakeupBooking(bookingToDelete.id);
                  setBookingToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: RESTORE CANCELLED CLASS CONFIRMATION                         */}
      {/* ===================================================================== */}
      {cancellationToRestore && onDeleteCancelledClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
          onClick={() => setCancellationToRestore(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Restore Cancelled Class?
                  </h3>
                  <p className="text-xs text-slate-400">
                    This will restore the class back to the active weekly timetable.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellationToRestore(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{cancellationToRestore.course}</span>
                <span className="font-mono font-bold text-sky-400">{cancellationToRestore.groupId}</span>
              </div>
              <div className="text-slate-300 font-mono">
                {cancellationToRestore.day}, {cancellationToRestore.date} ({cancellationToRestore.time})
              </div>
              <div className="text-slate-400 font-mono">
                {cancellationToRestore.room} · {cancellationToRestore.lecturer}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCancellationToRestore(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCancelledClass(cancellationToRestore.id);
                  setCancellationToRestore(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: MARK CLASS AS CANCELLED FOR CURRENT WEEK                     */}
      {/* ===================================================================== */}
      {isCancelModalOpen && onSaveCancelledClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Mark Class as Cancelled ({getActiveWeekBounds(cancelWeekOffset).weekLabel})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Releases the classroom for {getActiveWeekBounds(cancelWeekOffset).weekLabel.toLowerCase()} ({getActiveWeekBounds(cancelWeekOffset).formattedWeekRange}) and resets on Sunday.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancelClass} className="space-y-3.5 text-xs">
              {cancelError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200">
                  {cancelError}
                </div>
              )}

              {/* Target Academic Week */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Academic Week *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCancelWeekOffset(0);
                      setSelectedSessionKey('');
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      cancelWeekOffset === 0
                        ? 'bg-rose-950/90 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div>This Week</div>
                    <div className="text-[10px] font-mono text-slate-400">{thisWeekBounds.formattedWeekRange}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCancelWeekOffset(1);
                      setSelectedSessionKey('');
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      cancelWeekOffset === 1
                        ? 'bg-rose-950/90 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div>Next Week</div>
                    <div className="text-[10px] font-mono text-slate-400">{nextWeekBounds.formattedWeekRange}</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Class / Group *
                  </label>
                  <select
                    value={cancelGroup}
                    onChange={(e) => {
                      setCancelGroup(e.target.value);
                      setSelectedSessionKey('');
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono cursor-pointer"
                  >
                    {SCHEDULE_DATA.groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.id} — {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Day of Week ({getActiveWeekBounds(cancelWeekOffset).weekLabel}) *
                  </label>
                  <select
                    value={cancelDay}
                    onChange={(e) => {
                      setCancelDay(e.target.value as ScheduleDay);
                      setSelectedSessionKey('');
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white cursor-pointer"
                  >
                    {SCHEDULE_DATA.meta.days.map(d => (
                      <option key={d} value={d}>
                        {d} ({getActiveWeekBounds(cancelWeekOffset).dayDatesMap[d]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Class Session on {cancelDay} ({getActiveWeekBounds(cancelWeekOffset).dayDatesMap[cancelDay]}) *
                </label>
                {sessionsForCancelModal.length === 0 ? (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                    No regular classes scheduled for {cancelGroup} on {cancelDay}.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {sessionsForCancelModal.map((s) => {
                      const key = `${s.day}|${s.time}|${s.course}`;
                      const isSelected = selectedSessionKey === key;
                      const cancelDate = getActiveWeekBounds(cancelWeekOffset).dayDatesMap[s.day];
                      const isAlreadyCancelled = activeCancellations.some(
                        c =>
                          c.groupId === cancelGroup &&
                          c.day === s.day &&
                          c.time === s.time &&
                          c.date === cancelDate
                      );

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isAlreadyCancelled}
                          onClick={() => {
                            setSelectedSessionKey(key);
                            setCancelError('');
                          }}
                          className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                            isAlreadyCancelled
                              ? 'bg-slate-950/40 border-slate-800/60 text-slate-500 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-rose-950/80 border-rose-500 text-white ring-1 ring-rose-400 cursor-pointer'
                              : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-200 cursor-pointer'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-white">
                              {s.course} <span className="text-slate-400 font-normal">({s.type})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {s.time} · {s.room || 'Room TBD'} · {s.lecturer}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 shrink-0">
                            {isAlreadyCancelled ? 'Already Cancelled' : isSelected ? 'Selected' : 'Select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cancellation Reason / Note (Optional)
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Instructor unavailable today · Make-up to be announced"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSessionKey}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Class Cancelled</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
