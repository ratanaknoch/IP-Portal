import { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Check, 
  Plus, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  ListFilter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SCHEDULE_DATA, ALL_ROOMS, BOOKABLE_ROOMS, ALL_SESSIONS, getCambodiaTime } from '../data/scheduleData';
import { UserProfile } from '../lib/firebase';

export type ScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface MakeupClassBooking {
  id: string;
  course: string;
  room: string;
  generation?: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  day: ScheduleDay;
  time: string;
  timeSlots?: string[];
  bookedBy: string;
  note?: string;
  createdAt: string;
}

interface MakeupClassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (booking: MakeupClassBooking) => void;
  onDeleteBooking?: (id: string) => void;
  activeMonitorGen?: string;
  existingBookings?: MakeupClassBooking[];
  currentUserProfile?: UserProfile | null;
}

// Helper: Calculate the earliest bookable date in Cambodia (UTC+7)
// If Sunday -> advances to Monday
// If today is past 2:00 PM -> cannot book today, advances to tomorrow (or Monday if tomorrow is Sunday)
export function getEarliestBookableDate(): {
  earliestDate: string;
  isTodayPast2Pm: boolean;
  rawToday: string;
} {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kh = new Date(utc + (3600000 * 7));

  const rawY = kh.getFullYear();
  const rawM = String(kh.getMonth() + 1).padStart(2, '0');
  const rawD = String(kh.getDate()).padStart(2, '0');
  const rawToday = `${rawY}-${rawM}-${rawD}`;

  const totalMinutes = kh.getHours() * 60 + kh.getMinutes();
  const isTodayPast2Pm = totalMinutes >= 14 * 60; // 14:00 (2:00 PM)

  let target = new Date(kh);

  // If today is Sunday (day 0), advance to Monday (+1 day)
  if (target.getDay() === 0) {
    target.setDate(target.getDate() + 1);
  } else if (isTodayPast2Pm) {
    // Past 2pm today: advance to tomorrow
    target.setDate(target.getDate() + 1);
    // If tomorrow is Sunday, advance to Monday (+1 day)
    if (target.getDay() === 0) {
      target.setDate(target.getDate() + 1);
    }
  }

  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');

  return {
    earliestDate: `${y}-${m}-${d}`,
    isTodayPast2Pm,
    rawToday
  };
}

export function MakeupClassBookingModal({
  isOpen,
  onClose,
  onSaveBooking,
  onDeleteBooking,
  existingBookings = [],
  currentUserProfile
}: MakeupClassBookingModalProps) {
  // Tabs: 'create' reservation vs 'manage' list
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Compute earliest bookable date
  const { earliestDate, isTodayPast2Pm, rawToday } = useMemo(() => getEarliestBookableDate(), [isOpen]);

  // Form State - strictly NOT auto-selected as requested
  const [course, setCourse] = useState('');
  const [room, setRoom] = useState('');
  const [groupId, setGroupId] = useState(
    currentUserProfile?.groupId || 'I1-G1'
  );
  
  // Timeslot selection - starts empty (not auto-selected)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Date state initialized strictly to the earliest valid bookable date
  const [selectedDate, setSelectedDate] = useState<string>(earliestDate);

  // Calendar month navigator state initialized to the month of the earliest date
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => {
    const [y, m] = earliestDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  // Reset form whenever modal opens so nothing is auto-selected
  useEffect(() => {
    if (isOpen) {
      setCourse('');
      setRoom('');
      setSelectedSlots([]);
      setNote('');
      setError('');
      setSelectedDate(earliestDate);
      const [y, m] = earliestDate.split('-').map(Number);
      setCalendarViewDate(new Date(y, m - 1, 1));
      setActiveTab('create');
    }
  }, [isOpen, earliestDate]);

  // Check if calendar view is at or before the current month
  const isPastMonth = useMemo(() => {
    const [currentY, currentM] = rawToday.split('-').map(Number);
    const viewY = calendarViewDate.getFullYear();
    const viewM = calendarViewDate.getMonth() + 1;
    return viewY < currentY || (viewY === currentY && viewM <= currentM);
  }, [calendarViewDate, rawToday]);

  // Derive day name from selectedDate
  const derivedDay = useMemo<ScheduleDay>(() => {
    if (!selectedDate) return 'Monday';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const dayIndex = target.getDay(); // 0 is Sun, 1 is Mon ... 6 is Sat
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

  // Formatted date string for UI display
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

  // Toggle time slot - allows unselecting all slots at will
  const handleToggleSlot = (slot: string) => {
    setError('');
    setSelectedSlots(prev => {
      let updated: string[];
      if (prev.includes(slot)) {
        updated = prev.filter(s => s !== slot);
      } else {
        updated = [...prev, slot];
      }
      // Keep sorted in chronological order of SCHEDULE_DATA.meta.timeSlots
      return updated.sort((a, b) => 
        SCHEDULE_DATA.meta.timeSlots.indexOf(a) - SCHEDULE_DATA.meta.timeSlots.indexOf(b)
      );
    });
  };

  // Conflict Detection across selected slots (only active when room is selected)
  const slotConflicts = useMemo(() => {
    if (!room.trim() || selectedSlots.length === 0) return [];
    const conflicts: Array<{ slot: string; reason: string }> = [];

    selectedSlots.forEach(slot => {
      // 1. Regular class conflict
      const regularConflict = ALL_SESSIONS.find(
        s => s.room.trim() === room.trim() && s.day === derivedDay && s.time === slot
      );
      if (regularConflict) {
        conflicts.push({
          slot,
          reason: `Occupied by regular class "${regularConflict.course}" (${regularConflict.groupId || 'Regular'})`
        });
        return;
      }

      // 2. Make-up class conflict
      const makeupConflict = existingBookings.find(b => {
        if (b.room.trim() !== room.trim() || b.date !== selectedDate) return false;
        if (b.timeSlots && b.timeSlots.length > 0) {
          return b.timeSlots.includes(slot);
        }
        return b.time === slot || b.time.includes(slot);
      });

      if (makeupConflict) {
        conflicts.push({
          slot,
          reason: `Already reserved by ${makeupConflict.bookedBy} for "${makeupConflict.course}" (${makeupConflict.groupId})`
        });
      }
    });

    return conflicts;
  }, [room, derivedDay, selectedSlots, selectedDate, existingBookings]);

  // Check if a specific slot has conflict (only evaluated if room is selected)
  const isSlotConflicted = (slot: string) => {
    if (!room.trim()) return false;
    const regular = ALL_SESSIONS.some(
      s => s.room.trim() === room.trim() && s.day === derivedDay && s.time === slot
    );
    if (regular) return true;

    return existingBookings.some(b => {
      if (b.room.trim() !== room.trim() || b.date !== selectedDate) return false;
      if (b.timeSlots && b.timeSlots.length > 0) {
        return b.timeSlots.includes(slot);
      }
      return b.time === slot || b.time.includes(slot);
    });
  };

  if (!isOpen) return null;

  // Calendar month days calculation
  const calendarDays = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Week starts on Monday (index 0) to Sunday (index 6)
    const startOffset = (firstDayIndex + 6) % 7;

    const days: Array<{ 
      dayNumber: number; 
      dateString: string; 
      isCurrentMonth: boolean; 
      isSunday: boolean;
      isDisabled: boolean;
      isToday: boolean;
    }> = [];

    // Empty lead slots
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

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;
      const dayOfWeek = new Date(year, month, d).getDay();
      const isSunday = dayOfWeek === 0;
      
      // Disabled if past or before earliest valid date or Sunday
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
    if (!course.trim()) {
      setError('Please enter the class / course name.');
      return;
    }

    if (!room.trim()) {
      setError('Please select a classroom in Building A.');
      return;
    }

    if (!selectedDate) {
      setError('Please select a valid date on the calendar.');
      return;
    }

    if (selectedDate < earliestDate) {
      setError('Selected date is not available. Please choose a valid upcoming date.');
      return;
    }

    // Disallow Sunday booking
    const [y, m, dNum] = selectedDate.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, dNum).getDay();
    if (dayOfWeek === 0) {
      setError('ITC campus is closed on Sundays. Please select a date from Monday to Saturday.');
      return;
    }

    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.');
      return;
    }

    if (slotConflicts.length > 0) {
      setError('Cannot confirm reservation: One or more selected time slots have a room conflict.');
      return;
    }

    // Name of the person who booked: strictly the class monitor's name/email, never password
    const monitorName = currentUserProfile?.displayName 
      ? currentUserProfile.displayName
      : currentUserProfile?.email 
      ? currentUserProfile.email.split('@')[0]
      : 'Class Monitor';

    const newBooking: MakeupClassBooking = {
      id: `makeup-${Date.now()}`,
      course: course.trim(),
      room,
      groupId,
      date: selectedDate,
      day: derivedDay,
      time: selectedSlots.join(', '),
      timeSlots: selectedSlots,
      bookedBy: monitorName,
      note: note.trim() || '',
      createdAt: new Date().toISOString()
    };

    onSaveBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
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
            {existingBookings.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                {existingBookings.length}
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

            {/* 1. Class / Course Name & Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Class / Course Name *
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
                  Class / Group *
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono focus:outline-hidden focus:border-sky-400 text-xs"
                >
                  {SCHEDULE_DATA.groups.map(g => (
                    <option key={g.id} value={g.id}>{g.id}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Interactive Calendar Date Picker (Auto-earliest date) */}
            <div className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-sky-400" />
                  <span>Select Date on Calendar *</span>
                </label>
                {isTodayPast2Pm && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded font-medium">
                    Same-day booking closed (After 2PM)
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
                            ? 'Sunday closed' 
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
                  <span>Selected: <strong>{formattedSelectedDate}</strong></span>
                </div>
                <span className="font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                  Day: {derivedDay}
                </span>
              </div>
            </div>

            {/* 3. Classroom Venue Selection (Building A only) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Classroom (Building A) *
              </label>
              <select
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-sky-400 font-mono text-xs cursor-pointer"
              >
                <option value="">-- Choose a Classroom (Building A) --</option>
                {BOOKABLE_ROOMS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* 4. Timeslot Selection */}
            <div className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Select Time Slots *</span>
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
                      Clear all
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">
                    None selected
                  </span>
                )}
              </div>

              {/* Slots Grid */}
              <div className="space-y-2 pt-1">
                {/* Morning Slots */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Morning (7:00 – 11:05)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SCHEDULE_DATA.meta.timeSlots.slice(0, 4).map(slot => {
                      const isSelected = selectedSlots.includes(slot);
                      const hasConflict = isSlotConflicted(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleSlot(slot)}
                          className={`px-2 py-1.5 rounded-md text-xs font-mono transition-all border text-center cursor-pointer ${
                            isSelected
                              ? hasConflict
                                ? 'bg-rose-950/80 border-rose-600 text-rose-200 ring-2 ring-rose-500 font-bold'
                                : 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-xs'
                              : hasConflict
                              ? 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          <div className="font-semibold">{slot}</div>
                          {hasConflict && (
                            <div className="text-[9px] text-rose-400 font-sans mt-0.5">
                              {isSelected ? 'Conflict' : 'Occupied'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Afternoon (13:00 – 17:05)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {SCHEDULE_DATA.meta.timeSlots.slice(4, 8).map(slot => {
                      const isSelected = selectedSlots.includes(slot);
                      const hasConflict = isSlotConflicted(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleSlot(slot)}
                          className={`px-2 py-1.5 rounded-md text-xs font-mono transition-all border text-center cursor-pointer ${
                            isSelected
                              ? hasConflict
                                ? 'bg-rose-950/80 border-rose-600 text-rose-200 ring-2 ring-rose-500 font-bold'
                                : 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-xs'
                              : hasConflict
                              ? 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          <div className="font-semibold">{slot}</div>
                          {hasConflict && (
                            <div className="text-[9px] text-rose-400 font-sans mt-0.5">
                              {isSelected ? 'Conflict' : 'Occupied'}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Conflict / Availability Feedback */}
              {slotConflicts.length > 0 ? (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Room Conflict Warning — Cannot Reserve Selected Slots:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-200 pt-0.5">
                    {slotConflicts.map(c => (
                      <li key={c.slot}>
                        <span className="font-mono font-bold text-white">{c.slot}</span>: {c.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-300 pt-1 font-medium">
                    Please deselect conflicting slots or change the classroom before confirming.
                  </p>
                </div>
              ) : selectedSlots.length > 0 && room ? (
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 flex items-center gap-2 text-[11px] mt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>{room}</strong> is free for all {selectedSlots.length} selected slot(s) on {derivedDay}.
                  </span>
                </div>
              ) : !room && selectedSlots.length > 0 ? (
                <div className="p-2 rounded bg-sky-950/40 border border-sky-850 text-sky-300 flex items-center gap-2 text-[11px] mt-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Please choose a classroom above to check room availability for your selected slots.</span>
                </div>
              ) : null}
            </div>

            {/* 5. Booking Reason / Note (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Booking Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Midterm make-up session"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-400 text-xs"
              />
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
                disabled={slotConflicts.length > 0 || selectedSlots.length === 0}
                className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {slotConflicts.length > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cannot Confirm (Slot Conflict)</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Reservation ({selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Active Bookings Tab */
          <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[75vh]">
            {existingBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No active make-up bookings found.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-slate-400 text-xs font-semibold">
                  Active Reservations ({existingBookings.length}):
                </div>

                {existingBookings.map((b) => (
                  <div 
                    key={b.id} 
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      {/* Course & Group */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{b.course}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                          Group: {b.groupId}
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

                    {onDeleteBooking && (
                      <button
                        type="button"
                        onClick={() => onDeleteBooking(b.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer shrink-0"
                        title="Cancel this make-up session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
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
