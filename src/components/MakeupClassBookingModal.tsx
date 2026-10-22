import { useState, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Check, 
  Plus, 
  AlertCircle, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  ListFilter,
  CheckCircle2
} from 'lucide-react';
import { SCHEDULE_DATA, ALL_ROOMS, ALL_SESSIONS } from '../data/scheduleData';

export type ScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface MakeupClassBooking {
  id: string;
  course: string;
  room: string;
  generation: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  day: ScheduleDay;
  time: string;
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
}

export function MakeupClassBookingModal({
  isOpen,
  onClose,
  onSaveBooking,
  onDeleteBooking,
  activeMonitorGen = 'IPGEN1',
  existingBookings = []
}: MakeupClassBookingModalProps) {
  // Tabs: 'new' reservation vs 'active' list
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Form State
  const [course, setCourse] = useState('');
  const [room, setRoom] = useState('Room A-109');
  const [generation, setGeneration] = useState<'I2' | 'I3' | 'I4'>('I2');
  const [groupId, setGroupId] = useState('I2-SE');
  const [time, setTime] = useState(SCHEDULE_DATA.meta.timeSlots[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Today's date in local/Cambodia time (YYYY-MM-DD)
  const todayString = useMemo(() => {
    const now = new Date();
    // UTC+7 for Cambodia
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const khDate = new Date(utc + (3600000 * 7));
    return khDate.toISOString().split('T')[0];
  }, []);

  // Date state initialized to today
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  // Calendar month navigator state (year & month index 0-11)
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => {
    const [y, m] = todayString.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  // Check if calendar view is at or before the current month (to disable prev month navigation)
  const isPastMonth = useMemo(() => {
    const [currentY, currentM] = todayString.split('-').map(Number);
    const viewY = calendarViewDate.getFullYear();
    const viewM = calendarViewDate.getMonth() + 1;
    return viewY < currentY || (viewY === currentY && viewM <= currentM);
  }, [calendarViewDate, todayString]);

  // Derive day name from selectedDate
  const derivedDay = useMemo<ScheduleDay>(() => {
    if (!selectedDate) return 'Monday';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const dayIndex = target.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
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

  // Formatted date string for UI display (e.g. "Saturday, 24 Oct 2026")
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

  // Conflict Detection: check if chosen room and time has regular class or makeup class
  const conflictInfo = useMemo(() => {
    // 1. Regular class conflict
    const regularConflict = ALL_SESSIONS.find(
      s => s.room.trim() === room && s.day === derivedDay && s.time === time
    );

    // 2. Make-up class conflict (matches exact date and time)
    const makeupConflict = existingBookings.find(
      b => b.room.trim() === room && b.date === selectedDate && b.time === time
    );

    return {
      isConflict: Boolean(regularConflict || makeupConflict),
      regular: regularConflict,
      makeup: makeupConflict
    };
  }, [room, derivedDay, time, selectedDate, existingBookings]);

  if (!isOpen) return null;

  // Filter groups for selected generation
  const availableGroups = SCHEDULE_DATA.groups.filter(g => g.cohort === generation);

  const handleGenerationChange = (gen: 'I2' | 'I3' | 'I4') => {
    setGeneration(gen);
    const firstGroup = SCHEDULE_DATA.groups.find(g => g.cohort === gen);
    if (firstGroup) setGroupId(firstGroup.id);
  };

  // Quick preset dates
  const handleQuickPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setCalendarViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // Quick Saturday preset
  const handleQuickSaturday = () => {
    const d = new Date();
    const currentDay = d.getDay(); // 0 is Sun, 6 is Sat
    const diff = (6 - currentDay + 7) % 7;
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    const dateStr = d.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setCalendarViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // Calendar month days calculation
  const calendarDays = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust so week starts on Monday (index 0) to Sunday (index 6)
    const startOffset = (firstDayIndex + 6) % 7;

    const days: Array<{ 
      dayNumber: number; 
      dateString: string; 
      isCurrentMonth: boolean; 
      isSunday: boolean;
      isPast: boolean;
      isToday: boolean;
    }> = [];

    // Empty lead slots
    for (let i = 0; i < startOffset; i++) {
      days.push({ dayNumber: 0, dateString: '', isCurrentMonth: false, isSunday: false, isPast: false, isToday: false });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;
      const dayOfWeek = new Date(year, month, d).getDay();
      days.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isSunday: dayOfWeek === 0,
        isPast: dateString < todayString,
        isToday: dateString === todayString
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

    if (!selectedDate) {
      setError('Please select a valid date on the calendar.');
      return;
    }

    if (selectedDate < todayString) {
      setError('Make-up class cannot be scheduled for a past date.');
      return;
    }

    const newBooking: MakeupClassBooking = {
      id: `makeup-${Date.now()}`,
      course: course.trim(),
      room,
      generation,
      groupId,
      date: selectedDate,
      day: derivedDay,
      time,
      bookedBy: activeMonitorGen,
      note: note.trim() || 'Make-up Session',
      createdAt: new Date().toISOString()
    };

    onSaveBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Make-up Class Booking</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
                  {activeMonitorGen}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Reserve classrooms for makeup sessions and extra seminars
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Create vs Active Bookings */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
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
            className={`py-2.5 px-4 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
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
              <div className="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Class / Course Name */}
            <div>
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-400"
                required
              />
            </div>

            {/* 2. Interactive Calendar Date Picker */}
            <div className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-sky-400" />
                  <span>Select Date on Calendar *</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(0)}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(1)}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickSaturday}
                    className="px-2 py-0.5 rounded text-[11px] bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 font-medium"
                  >
                    Saturday
                  </button>
                </div>
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
                  const isDisabled = cell.isPast || cell.isSunday;

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
                        cell.isPast 
                          ? 'Past date cannot be selected' 
                          : cell.isSunday 
                          ? 'No regular classes on Sunday' 
                          : cell.isToday 
                          ? 'Today' 
                          : undefined
                      }
                      className={`py-1.5 rounded-md font-mono transition-colors text-xs relative ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-xs z-1'
                          : cell.isPast
                          ? 'text-slate-600 bg-slate-950/40 cursor-not-allowed opacity-35 line-through'
                          : cell.isSunday
                          ? 'text-slate-600 cursor-not-allowed bg-slate-950/20 opacity-50'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer'
                      }`}
                    >
                      <span>{cell.dayNumber}</span>
                      {cell.isToday && !isSelected && (
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

            {/* 3. Room & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Classroom / Venue *</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Building A</span>
                </label>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-sky-400"
                >
                  <optgroup label="Building A (Confirmed IP Classrooms)">
                    <option value="Room A-109">Room A-109 (Confirmed)</option>
                    <option value="Room A-401">Room A-401 (Confirmed)</option>
                    <option value="Room A-402">Room A-402 (Confirmed)</option>
                    <option value="Room A-417">Room A-417 (Confirmed)</option>
                    <option value="Room A-420">Room A-420 (Confirmed)</option>
                    <option value="Lab A-109">Lab A-109 (Confirmed)</option>
                  </optgroup>
                  <optgroup label="Building J (Shared Computer Labs - Unconfirmed)">
                    <option value="Room J-601">Room J-601 (Shared Lab)</option>
                    <option value="Room J-602">Room J-602 (Shared Lab)</option>
                    <option value="Room J-603">Room J-603 (Shared Lab)</option>
                    <option value="Room J-609">Room J-609 (Shared Lab)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Time Slot *
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono focus:outline-hidden focus:border-sky-400"
                >
                  {SCHEDULE_DATA.meta.timeSlots.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real-time Room Availability / Conflict Notice */}
            {conflictInfo.isConflict ? (
              <div className="p-2.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-200">
                    Schedule Conflict Warning
                  </p>
                  {conflictInfo.regular && (
                    <p className="text-[11px] text-amber-300/90">
                      <strong>{room}</strong> is scheduled for regular class <strong>{conflictInfo.regular.course}</strong> ({conflictInfo.regular.groupId}) at this time.
                    </p>
                  )}
                  {conflictInfo.makeup && (
                    <p className="text-[11px] text-amber-300/90">
                      Already booked by <strong>{conflictInfo.makeup.bookedBy}</strong> for "{conflictInfo.makeup.course}" ({conflictInfo.makeup.groupId}) on {conflictInfo.makeup.date}.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 flex items-center gap-2 text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>{room}</strong> is currently free and available at {time} on {derivedDay}.</span>
              </div>
            )}

            {/* 4. Generation & Group Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cohort *
                </label>
                <select
                  value={generation}
                  onChange={(e) => handleGenerationChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono focus:outline-hidden focus:border-sky-400"
                >
                  <option value="I2">I2</option>
                  <option value="I3">I3</option>
                  <option value="I4">I4</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Group *
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono focus:outline-hidden focus:border-sky-400"
                >
                  {availableGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.id}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Note / Purpose (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Booking Reason / Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Week 4 Exam preparation / Project seminar"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-400"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Reservation</span>
              </button>
            </div>
          </form>
        ) : (
          /* Active Bookings Management Tab */
          <div className="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto">
            {existingBookings.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="font-medium text-slate-300">No active make-up bookings found</p>
                <p className="text-[11px] text-slate-500">
                  Switch to the "New Reservation" tab above to book a classroom.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-400 text-[11px] mb-2">
                  Showing {existingBookings.length} confirmed make-up session(s) active on this device:
                </p>
                {existingBookings.map((b) => (
                  <div 
                    key={b.id} 
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{b.course}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                          {b.groupId}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-[11px]">
                        <span className="flex items-center gap-1 text-sky-400 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {b.date ? `${b.day}, ${b.date}` : b.day}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {b.time}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.room}
                        </span>
                      </div>
                      {b.note && (
                        <p className="text-[10px] text-slate-400 italic">
                          Note: {b.note}
                        </p>
                      )}
                      <p className="text-[9px] text-slate-500 font-mono">
                        Booked by {b.bookedBy}
                      </p>
                    </div>

                    {onDeleteBooking && (
                      <button
                        type="button"
                        onClick={() => onDeleteBooking(b.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
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
                className="px-4 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white"
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
