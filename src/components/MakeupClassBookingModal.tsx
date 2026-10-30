import { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Plus, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { SCHEDULE_DATA, BOOKABLE_ROOMS, ALL_SESSIONS, parseSlotMinutes, SessionType, isSharedRoom } from '../data/scheduleData';
import { UserProfile } from '../lib/firebase';

export type ScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type MakeupSessionType = 'Lecture' | 'Tutorial' | 'Practical';

export interface MakeupClassBooking {
  id: string;
  course: string;
  sessionType?: MakeupSessionType;
  room: string;
  generation?: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  day: ScheduleDay;
  time: string;
  timeSlots?: string[];
  bookedBy: string;
  bookedByUid?: string;
  note?: string;
  createdAt: string;
}

export interface CancelledClassSession {
  id: string;
  groupId: string;
  cohort: string;
  day: ScheduleDay;
  date: string; // YYYY-MM-DD in the current week
  time: string;
  course: string;
  type: SessionType;
  lecturer: string;
  room: string;
  cancelledBy: string;
  cancelledByUid?: string;
  reason?: string;
  createdAt: string;
}

interface MakeupClassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (booking: MakeupClassBooking) => void;
  onDeleteBooking?: (id: string) => void;
  activeMonitorGen?: string;
  existingBookings?: MakeupClassBooking[];
  cancelledClasses?: CancelledClassSession[];
  currentUserProfile?: UserProfile | null;
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Computes the active Monday–Saturday academic week in Cambodia Time (UTC+7).
 * Supports weekOffset (0 = This/Current Week, 1 = Next Week).
 * Every Sunday (day 0), the previous week's make-up classes and cancelled classes
 * expire and reset to the normal schedule for the new week starting Monday.
 */
export function getActiveWeekBounds(weekOffset: number = 0): {
  weekStartMonday: string;
  weekEndSaturday: string;
  nextSundayReset: string;
  rawToday: string;
  isSundayToday: boolean;
  dayDatesMap: Record<ScheduleDay, string>;
  formattedWeekRange: string;
  weekLabel: string;
} {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kh = new Date(utc + 3600000 * 7); // UTC+7 Phnom Penh

  const rawToday = formatYMD(kh);
  const dayOfWeek = kh.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const isSundayToday = dayOfWeek === 0;

  const mondayDate = new Date(kh.getFullYear(), kh.getMonth(), kh.getDate());
  if (isSundayToday) {
    // On Sunday, the finished week resets and the active schedule window is the upcoming Mon–Sat week
    mondayDate.setDate(mondayDate.getDate() + 1 + (weekOffset * 7));
  } else {
    mondayDate.setDate(mondayDate.getDate() - (dayOfWeek - 1) + (weekOffset * 7));
  }

  const saturdayDate = new Date(mondayDate);
  saturdayDate.setDate(mondayDate.getDate() + 5);

  const sundayResetDate = new Date(mondayDate);
  sundayResetDate.setDate(mondayDate.getDate() + 6);

  const dayNames: ScheduleDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayDatesMap = {} as Record<ScheduleDay, string>;
  dayNames.forEach((dName, idx) => {
    const dObj = new Date(mondayDate);
    dObj.setDate(mondayDate.getDate() + idx);
    dayDatesMap[dName] = formatYMD(dObj);
  });

  const fmtOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const formattedWeekRange = `${mondayDate.toLocaleDateString('en-US', fmtOptions)} – ${saturdayDate.toLocaleDateString('en-US', { ...fmtOptions, year: 'numeric' })}`;
  const weekLabel = weekOffset === 0 
    ? (isSundayToday ? 'Current Week' : 'This Week') 
    : (weekOffset === 1 ? 'Next Week' : `Week +${weekOffset}`);

  return {
    weekStartMonday: formatYMD(mondayDate),
    weekEndSaturday: formatYMD(saturdayDate),
    nextSundayReset: formatYMD(sundayResetDate),
    rawToday,
    isSundayToday,
    dayDatesMap,
    formattedWeekRange,
    weekLabel
  };
}

/**
 * Make-up bookings remain visible on the calendar throughout the entire current week
 * and only expire / reset to the normal schedule on Sunday.
 */
export function isBookingExpired(booking: MakeupClassBooking): boolean {
  if (!booking || !booking.date) return false;
  const { weekStartMonday } = getActiveWeekBounds(0);
  return booking.date < weekStartMonday;
}

export function isBookingInTargetWeek(booking: MakeupClassBooking, weekOffset: number = 0): boolean {
  if (!booking || !booking.date) return false;
  const { weekStartMonday, weekEndSaturday } = getActiveWeekBounds(weekOffset);
  return booking.date >= weekStartMonday && booking.date <= weekEndSaturday;
}

export function isBookingInCurrentWeek(booking: MakeupClassBooking): boolean {
  return isBookingInTargetWeek(booking, 0);
}

/**
 * Cancelled classes remain visible on the calendar throughout the entire current week
 * and automatically expire / reset to the normal schedule on Sunday.
 */
export function isCancellationExpired(item: CancelledClassSession): boolean {
  if (!item || !item.date) return false;
  const { weekStartMonday } = getActiveWeekBounds(0);
  return item.date < weekStartMonday;
}

export function isCancellationInTargetWeek(item: CancelledClassSession, weekOffset: number = 0): boolean {
  if (!item || !item.date) return false;
  const { weekStartMonday, weekEndSaturday } = getActiveWeekBounds(weekOffset);
  return item.date >= weekStartMonday && item.date <= weekEndSaturday;
}

export function isCancellationInCurrentWeek(item: CancelledClassSession): boolean {
  return isCancellationInTargetWeek(item, 0);
}

/**
 * Permission check: Only the Class Monitor who created the make-up booking (for their assigned group) or an Admin can delete it.
 */
export function canDeleteMakeupBooking(
  booking: MakeupClassBooking,
  userProfile?: UserProfile | null
): boolean {
  if (!userProfile) return false;
  if (userProfile.role === 'admin') return true;
  if (userProfile.role !== 'monitor') return false;
  if (userProfile.groupId && booking.groupId && userProfile.groupId !== booking.groupId) {
    return false;
  }
  return Boolean(booking.bookedByUid && userProfile.uid && booking.bookedByUid === userProfile.uid);
}

/**
 * Permission check: Only the Class Monitor who marked a class cancelled (for their assigned group) or an Admin can restore/delete it.
 */
export function canManageCancelledClass(
  item: CancelledClassSession,
  userProfile?: UserProfile | null
): boolean {
  if (!userProfile) return false;
  if (userProfile.role === 'admin') return true;
  if (userProfile.role !== 'monitor') return false;
  if (userProfile.groupId && item.groupId && userProfile.groupId !== item.groupId) {
    return false;
  }
  return Boolean(item.cancelledByUid && userProfile.uid && item.cancelledByUid === userProfile.uid);
}

// Helper: Calculate the earliest bookable date in Cambodia (UTC+7)
export function getEarliestBookableDate(): {
  earliestDate: string;
  isTodayAllSlotsPassed: boolean;
  rawToday: string;
} {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kh = new Date(utc + 3600000 * 7);

  const rawToday = formatYMD(kh);
  const totalMinutes = kh.getHours() * 60 + kh.getMinutes();
  const isTodayAllSlotsPassed = totalMinutes >= 16 * 60 + 10;

  const target = new Date(kh);
  if (target.getDay() === 0) {
    target.setDate(target.getDate() + 1);
  } else if (isTodayAllSlotsPassed) {
    target.setDate(target.getDate() + 1);
    if (target.getDay() === 0) {
      target.setDate(target.getDate() + 1);
    }
  }

  return {
    earliestDate: formatYMD(target),
    isTodayAllSlotsPassed,
    rawToday
  };
}

export function MakeupClassBookingModal({
  isOpen,
  onClose,
  onSaveBooking,
  onDeleteBooking,
  existingBookings = [],
  cancelledClasses = [],
  currentUserProfile
}: MakeupClassBookingModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  const { earliestDate, isTodayAllSlotsPassed, rawToday } = useMemo(() => getEarliestBookableDate(), [isOpen]);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>(earliestDate);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [room, setRoom] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [sessionType, setSessionType] = useState<MakeupSessionType>('Lecture');
  const [groupId, setGroupId] = useState<string>(
    currentUserProfile?.groupId && currentUserProfile.groupId !== 'Alumni' && currentUserProfile.groupId !== 'I5'
      ? currentUserProfile.groupId
      : 'I2-SE'
  );
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Delete confirmation state for Active Bookings tab
  const [bookingPendingDelete, setBookingPendingDelete] = useState<MakeupClassBooking | null>(null);

  // Building filter for available rooms: Building A vs Building J
  const [buildingFilter, setBuildingFilter] = useState<'ALL' | 'A' | 'J'>('ALL');
  const [showOccupiedList, setShowOccupiedList] = useState<boolean>(false);

  // Calendar month navigator state
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => {
    const [y, m] = earliestDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  // Calculate current Cambodia minutes to disable passed slots if selectedDate === rawToday
  const currentKhMinutes = useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const kh = new Date(utc + 3600000 * 7);
    return kh.getHours() * 60 + kh.getMinutes();
  }, [isOpen, selectedDate]);

  const isSlotPassed = (slot: string) => {
    if (selectedDate !== rawToday) return false;
    const [startMin] = parseSlotMinutes(slot);
    return currentKhMinutes >= startMin;
  };

  // Filter out any expired bookings from active list
  const activeExistingBookings = useMemo(() => {
    return existingBookings.filter(b => !isBookingExpired(b));
  }, [existingBookings]);

  const activeCancelledClasses = useMemo(() => {
    return cancelledClasses.filter(c => !isCancellationExpired(c));
  }, [cancelledClasses]);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(earliestDate);
      setSelectedSlots([]);
      setRoom('');
      setCourse('');
      setSessionType('Lecture');
      setNote('');
      setError('');
      setBookingPendingDelete(null);
      setBuildingFilter('ALL');
      setShowOccupiedList(false);
      const [y, m] = earliestDate.split('-').map(Number);
      setCalendarViewDate(new Date(y, m - 1, 1));
      setActiveTab('create');
      if (currentUserProfile?.groupId && currentUserProfile.groupId !== 'Alumni' && currentUserProfile.groupId !== 'I5') {
        setGroupId(currentUserProfile.groupId);
      }
    }
  }, [isOpen, earliestDate, currentUserProfile]);

  useEffect(() => {
    if (selectedDate === rawToday && selectedSlots.length > 0) {
      setSelectedSlots(prev => prev.filter(slot => !isSlotPassed(slot)));
    }
  }, [selectedDate, rawToday, currentKhMinutes]);

  const derivedDay = useMemo<ScheduleDay>(() => {
    if (!selectedDate) return 'Monday';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const dayIndex = target.getDay();
    const map: Record<number, ScheduleDay> = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    };
    return map[dayIndex] || 'Monday';
  }, [selectedDate]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const target = new Date(y, m - 1, d);
      return target.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const isPastMonth = useMemo(() => {
    const [currentY, currentM] = rawToday.split('-').map(Number);
    const viewY = calendarViewDate.getFullYear();
    const viewM = calendarViewDate.getMonth() + 1;
    return viewY < currentY || (viewY === currentY && viewM <= currentM);
  }, [calendarViewDate, rawToday]);

  const handleToggleSlot = (slot: string) => {
    if (isSlotPassed(slot)) return;
    setError('');
    setSelectedSlots(prev => {
      let updated: string[];
      if (prev.includes(slot)) {
        updated = prev.filter(s => s !== slot);
      } else {
        updated = [...prev, slot];
      }
      return updated.sort((a, b) => 
        SCHEDULE_DATA.meta.timeSlots.indexOf(a) - SCHEDULE_DATA.meta.timeSlots.indexOf(b)
      );
    });
  };

  // DYNAMIC ROOM AVAILABILITY: Evaluates all Building A and Building J rooms for selectedDate + selectedSlots
  // Accounts for classes marked as CANCELLED on selectedDate so freed rooms can be booked!
  const roomAvailability = useMemo(() => {
    if (selectedSlots.length === 0 || !selectedDate) {
      return { availableRooms: [], occupiedRooms: [] };
    }

    const available: string[] = [];
    const occupied: Array<{ room: string; reason: string }> = [];

    BOOKABLE_ROOMS.forEach(r => {
      let isBusy = false;
      let busyReason = '';

      for (const slot of selectedSlots) {
        // Check regular class sessions on this day of week that are NOT cancelled for this date
        const regularClassesInRoom = ALL_SESSIONS.filter(
          s => s.room.trim() === r.trim() && s.day === derivedDay && s.time === slot
        );

        const activeRegularClass = regularClassesInRoom.find(reg => {
          const isCancelled = activeCancelledClasses.some(
            c =>
              c.groupId === reg.groupId &&
              c.day === reg.day &&
              c.time === reg.time &&
              c.date === selectedDate
          );
          return !isCancelled;
        });

        if (activeRegularClass) {
          isBusy = true;
          busyReason = `Occupied by regular class "${activeRegularClass.course}" (${activeRegularClass.groupId || 'Class'}) at ${slot}`;
          break;
        }

        // Check against active make-up bookings on this specific date
        const makeupClass = activeExistingBookings.find(b => {
          if (b.room.trim() !== r.trim() || b.date !== selectedDate) return false;
          if (b.timeSlots && b.timeSlots.length > 0) {
            return b.timeSlots.includes(slot);
          }
          return b.time === slot || b.time.includes(slot);
        });

        if (makeupClass) {
          isBusy = true;
          busyReason = `Booked by ${makeupClass.bookedBy} for "${makeupClass.course}" (${makeupClass.groupId}) at ${slot}`;
          break;
        }
      }

      if (isBusy) {
        occupied.push({ room: r, reason: busyReason });
      } else {
        available.push(r);
      }
    });

    return { availableRooms: available, occupiedRooms: occupied };
  }, [selectedSlots, selectedDate, derivedDay, activeExistingBookings, activeCancelledClasses]);

  useEffect(() => {
    if (room && selectedSlots.length > 0 && !roomAvailability.availableRooms.includes(room)) {
      setRoom('');
    }
  }, [roomAvailability.availableRooms, room, selectedSlots.length]);

  const filteredAvailableRooms = useMemo(() => {
    if (buildingFilter === 'ALL') return roomAvailability.availableRooms;
    if (buildingFilter === 'A') return roomAvailability.availableRooms.filter(r => r.includes('A-'));
    if (buildingFilter === 'J') return roomAvailability.availableRooms.filter(r => r.includes('J-'));
    return roomAvailability.availableRooms;
  }, [roomAvailability.availableRooms, buildingFilter]);

  if (!isOpen) return null;

  const calendarDays = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const startOffset = (firstDayIndex + 6) % 7;

    const days: Array<{ 
      dayNumber: number; 
      dateString: string; 
      isCurrentMonth: boolean; 
      isSunday: boolean; 
      isDisabled: boolean; 
      isToday: boolean; 
    }> = [];

    for (let i = 0; i < startOffset; i++) {
      days.push({ 
        dayNumber: 0, 
        dateString: '', 
        isCurrentMonth: false, 
        isSunday: false, 
        isDisabled: true, 
        isToday: false 
      });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;
      const dayOfWeek = new Date(year, month, d).getDay();
      const isSunday = dayOfWeek === 0;
      const isDisabled = dateString < earliestDate || isSunday;

      days.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isSunday,
        isDisabled,
        isToday: dateString === rawToday
      });
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (isPastMonth) return;
    setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError('Please select a valid date on the calendar.');
      return;
    }

    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.');
      return;
    }

    if (selectedDate === rawToday && selectedSlots.some(s => isSlotPassed(s))) {
      setError('One or more selected slots have already passed today. Please select an upcoming slot.');
      return;
    }

    if (!room.trim()) {
      setError('Please choose an available classroom.');
      return;
    }

    if (!roomAvailability.availableRooms.includes(room)) {
      setError(`Cannot confirm: ${room} is occupied during one of your selected time slots.`);
      return;
    }

    if (!course.trim()) {
      setError('Please enter the course / subject name for this make-up session.');
      return;
    }

    const monitorName = currentUserProfile?.displayName 
      ? currentUserProfile.displayName
      : currentUserProfile?.email 
      ? currentUserProfile.email.split('@')[0]
      : 'Class Monitor';

    const enforcedGroupId =
      currentUserProfile?.role === 'monitor' && currentUserProfile.groupId
        ? currentUserProfile.groupId
        : groupId;
    const matchedGroup = SCHEDULE_DATA.groups.find(g => g.id === enforcedGroupId);

    const newBooking: MakeupClassBooking = {
      id: `makeup-${Date.now()}`,
      course: course.trim(),
      sessionType,
      room: room.trim(),
      generation: matchedGroup?.cohort || enforcedGroupId.split('-')[0] || 'I2',
      groupId: enforcedGroupId,
      date: selectedDate,
      day: derivedDay,
      time: selectedSlots.join(', '),
      timeSlots: selectedSlots,
      bookedBy: monitorName,
      bookedByUid: currentUserProfile?.uid || '',
      note: note.trim() || '',
      createdAt: new Date().toISOString()
    };

    onSaveBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Make-up Class Booking</span>
                {currentUserProfile && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {currentUserProfile.displayName || currentUserProfile.email.split('@')[0]}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Book Building A & Building J classrooms · Visible on calendar all week, resets every Sunday
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Create vs Active Bookings */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'manage'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Active Bookings</span>
            {activeExistingBookings.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                {activeExistingBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Interactive Calendar Date Selection */}
            <div className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-[11px] flex items-center justify-center font-mono">
                    1
                  </span>
                  <span>Select Date *</span>
                </label>
                {isTodayAllSlotsPassed && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded font-medium">
                    Same-day booking closed (All classes ended today)
                  </span>
                )}
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1 pt-1 pb-1 text-slate-300">
                <span className="font-semibold text-xs text-white">
                  {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isPastMonth}
                    className={`p-1 rounded transition-colors ${
                      isPastMonth
                        ? 'text-slate-600 cursor-not-allowed opacity-30'
                        : 'hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer'
                    }`}
                    title={isPastMonth ? 'Cannot navigate to past months' : 'Previous month'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                  <div key={d} className="font-semibold text-slate-400 py-1 text-[10px]">
                    {d}
                  </div>
                ))}
                {calendarDays().map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return <div key={`empty-${idx}`} className="p-1" />;
                  }
                  const isSelected = cell.dateString === selectedDate;
                  const isDisabled = cell.isDisabled;

                  return (
                    <button
                      key={cell.dateString}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDisabled) return;
                        setSelectedDate(cell.dateString);
                        setError('');
                      }}
                      title={
                        isDisabled
                          ? cell.isSunday 
                            ? 'Sunday closed (Weekly schedule reset day)' 
                            : 'Date not available for booking'
                          : cell.dateString
                      }
                      className={`py-1.5 rounded-md font-mono transition-colors text-xs relative ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-xs z-1'
                          : isDisabled
                          ? 'text-slate-600 bg-slate-950/20 cursor-not-allowed opacity-35 line-through'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer'
                      }`}
                    >
                      <span>{cell.dayNumber}</span>
                      {cell.isToday && !isSelected && !isDisabled && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Summary Banner */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Selected Date: <strong>{formattedSelectedDate}</strong></span>
                </div>
                <span className="font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold">
                  {derivedDay}
                </span>
              </div>
            </div>

            {/* STEP 2: Time Slot Selection */}
            <div className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-[11px] flex items-center justify-center font-mono">
                    2
                  </span>
                  <span>Select Time Slot(s) *</span>
                </label>
                {selectedSlots.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSlots([])}
                      className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Click time slot(s) to select
                  </span>
                )}
              </div>

              {/* Slots Grid */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Morning (7:00 – 11:05)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SCHEDULE_DATA.meta.timeSlots.slice(0, 4).map(slot => {
                      const isSelected = selectedSlots.includes(slot);
                      const isPassed = isSlotPassed(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isPassed}
                          onClick={() => !isPassed && handleToggleSlot(slot)}
                          className={`px-2 py-2 rounded-md text-xs font-mono transition-all border text-center ${
                            isPassed
                              ? 'bg-slate-950/40 border-slate-900 text-slate-600 line-through cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-xs ring-1 ring-emerald-300 cursor-pointer'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white cursor-pointer'
                          }`}
                        >
                          <div className="font-semibold">{slot}</div>
                          <div className={`text-[10px] mt-0.5 ${
                            isPassed 
                              ? 'text-slate-600 font-medium' 
                              : isSelected 
                              ? 'text-emerald-100 font-bold' 
                              : 'text-slate-500'
                          }`}>
                            {isPassed ? 'Passed' : isSelected ? '✓ Selected' : 'Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Afternoon (13:00 – 17:05)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SCHEDULE_DATA.meta.timeSlots.slice(4, 8).map(slot => {
                      const isSelected = selectedSlots.includes(slot);
                      const isPassed = isSlotPassed(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isPassed}
                          onClick={() => !isPassed && handleToggleSlot(slot)}
                          className={`px-2 py-2 rounded-md text-xs font-mono transition-all border text-center ${
                            isPassed
                              ? 'bg-slate-950/40 border-slate-900 text-slate-600 line-through cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-xs ring-1 ring-emerald-300 cursor-pointer'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white cursor-pointer'
                          }`}
                        >
                          <div className="font-semibold">{slot}</div>
                          <div className={`text-[10px] mt-0.5 ${
                            isPassed 
                              ? 'text-slate-600 font-medium' 
                              : isSelected 
                              ? 'text-emerald-100 font-bold' 
                              : 'text-slate-500'
                          }`}>
                            {isPassed ? 'Passed' : isSelected ? '✓ Selected' : 'Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Available Rooms for Date & Time Selected */}
            <div className="space-y-2.5 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-slate-200 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-[11px] flex items-center justify-center font-mono">
                    3
                  </span>
                  <span>Available Classrooms *</span>
                </label>

                {selectedSlots.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                    <strong>{roomAvailability.availableRooms.length}</strong> free for selected slot(s)
                  </span>
                )}
              </div>

              {selectedSlots.length === 0 ? (
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-center text-slate-400 space-y-1">
                  <Clock className="w-5 h-5 mx-auto text-sky-400/80 mb-1" />
                  <p className="font-semibold text-slate-300 text-xs">
                    Select your time slot(s) above to view free classrooms.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-slate-400 font-medium mr-1 shrink-0">Filter Building:</span>
                    <button
                      type="button"
                      onClick={() => setBuildingFilter('ALL')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0 ${
                        buildingFilter === 'ALL'
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      All Buildings ({roomAvailability.availableRooms.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildingFilter('A')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0 ${
                        buildingFilter === 'A'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Building A ({roomAvailability.availableRooms.filter(r => r.includes('A-')).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildingFilter('J')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0 ${
                        buildingFilter === 'J'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Building J Shared Labs ({roomAvailability.availableRooms.filter(r => r.includes('J-')).length})
                    </button>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-950/25 border border-amber-800/50 text-amber-300 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Shared Rooms Note:</strong> Building A 3rd-floor rooms (A-3xx) and Building J computer labs are shared across departments; availability is unconfirmed.
                    </span>
                  </div>

                  {filteredAvailableRooms.length === 0 ? (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-200 text-xs">
                      No classrooms in this building are free during the selected slot. Try selecting a different building or time slot.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                      {filteredAvailableRooms.map(r => {
                        const isSelected = room === r;
                        const isBldgA = r.includes('A-');
                        const isShared = isSharedRoom(r);

                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setRoom(r);
                              setError('');
                            }}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-emerald-950/90 border-emerald-400 text-white ring-2 ring-emerald-400 shadow-md'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="font-mono font-bold text-sm text-white">{r}</span>
                              {isSelected ? (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center justify-between">
                              <span className={!isShared ? 'text-slate-400' : 'text-amber-400/90 font-medium'}>
                                {!isShared ? 'Building A' : isBldgA ? 'Building A (Shared)' : 'Building J (Shared)'}
                              </span>
                              <span className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                                {isSelected ? 'Selected' : isShared ? 'Shared' : 'Free'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {room && (
                    <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Selected: <strong className="text-white font-mono">{room}</strong> ({!isSharedRoom(room) ? 'Building A' : room.includes('A-') ? 'Building A 3rd Floor · Shared Room' : 'Building J · Shared Lab'})
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-900 border border-emerald-700 font-bold uppercase">
                        Ready
                      </span>
                    </div>
                  )}

                  {roomAvailability.occupiedRooms.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOccupiedList(prev => !prev)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showOccupiedList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>
                          {showOccupiedList ? 'Hide' : 'View'} occupied rooms ({roomAvailability.occupiedRooms.length})
                        </span>
                      </button>

                      {showOccupiedList && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-[11px] max-h-40 overflow-y-auto">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                            Occupied Classrooms:
                          </span>
                          {roomAvailability.occupiedRooms.map(o => (
                            <div key={o.room} className="flex items-start justify-between gap-2 py-0.5 border-b border-slate-800/60 last:border-0 text-slate-300">
                              <span className="font-mono font-bold text-slate-200 shrink-0">{o.room}:</span>
                              <span className="text-slate-400 text-right truncate text-[10px]">{o.reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 4: Class Details (Course, Class Option/Type Dropdown, Cohort/Group, Note) */}
            <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <label className="text-slate-200 font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-[11px] flex items-center justify-center font-mono">
                  4
                </span>
                <span>Class / Subject Details *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Course / Subject Name *
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => {
                      setCourse(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. Fundamental Concept of Data Security"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-400 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Make-up Option *
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as MakeupSessionType)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-semibold focus:outline-hidden focus:border-sky-400 text-xs cursor-pointer"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cohort / Group *
                  </label>
                  <select
                    value={currentUserProfile?.role === 'monitor' && currentUserProfile.groupId ? currentUserProfile.groupId : groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    disabled={currentUserProfile?.role === 'monitor'}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono focus:outline-hidden focus:border-sky-400 text-xs cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {SCHEDULE_DATA.groups.map(g => (
                      <option key={g.id} value={g.id}>{g.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Booking Reason / Note (Optional) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Booking Note / Lecturer Info (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Replaces cancelled lecture · Instructor: Mr. PICH Reatrey"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-400 text-xs"
                />
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!room || selectedSlots.length === 0 || !course.trim()}
                className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {room ? `Confirm ${sessionType}: ${room} (${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''})` : 'Select a Classroom Above'}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* Active Bookings Tab */
          <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[75vh]">
            {activeExistingBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No active make-up bookings found for this week.</p>
                <p className="text-[11px] text-slate-600">
                  (Make-up bookings remain on the calendar all week and reset automatically every Sunday)
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Active Reservations ({activeExistingBookings.length}):</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Resets to normal schedule every Sunday
                  </span>
                </div>

                {activeExistingBookings.map((b) => {
                  const canDelete = canDeleteMakeupBooking(b, currentUserProfile);
                  const isConfirmingThis = bookingPendingDelete?.id === b.id;

                  return (
                    <div 
                      key={b.id} 
                      className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Course, Session Type & Group */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{b.course}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold uppercase tracking-wider">
                              {b.sessionType || 'Lecture'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                              {b.groupId}
                            </span>
                          </div>

                          {/* Explicit Details: Booked by, Date, Room, Time */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-slate-300 text-xs pt-0.5">
                            <div>
                              <span className="text-slate-400">Booked by: </span>
                              <span className="font-semibold text-white">{b.bookedBy}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Date: </span>
                              <span className="font-mono font-semibold text-sky-300">{b.date} ({b.day})</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Room: </span>
                              <span className="font-mono font-semibold text-amber-300">{b.room}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Time: </span>
                              <span className="font-mono font-semibold text-slate-200">{b.time}</span>
                            </div>
                          </div>

                          {b.note && (
                            <div className="text-[11px] text-slate-400 pt-0.5">
                              <span className="text-slate-400">Note: </span>
                              <span className="italic text-slate-300">{b.note}</span>
                            </div>
                          )}
                        </div>

                        {onDeleteBooking && canDelete ? (
                          <button
                            type="button"
                            onClick={() => setBookingPendingDelete(isConfirmingThis ? null : b)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer shrink-0"
                            title="Delete this make-up session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-[10px] text-slate-500 px-2 py-1 rounded bg-slate-900 border border-slate-800 shrink-0"
                            title="Only the Class Monitor who created this booking or Admin can delete it"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Protected</span>
                          </span>
                        )}
                      </div>

                      {/* Delete Confirmation Prompt */}
                      {isConfirmingThis && onDeleteBooking && (
                        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                          <div className="text-rose-200">
                            <span className="font-bold text-white block">Confirm Delete Make-up Class?</span>
                            <span>Remove {b.course} ({b.groupId}) in {b.room} on {b.date}?</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setBookingPendingDelete(null)}
                              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteBooking(b.id);
                                setBookingPendingDelete(null);
                              }}
                              className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Confirm Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
