import { useState, useMemo } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Calendar,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  SCHEDULE_DATA, 
  ALL_SESSIONS, 
  ALL_ROOMS, 
  FREE_STUDY_ROOMS,
  getCambodiaTime, 
  getCurrentOrClosestSlot, 
  parseSlotMinutes,
  isConfirmedRoom,
  isSharedRoom
} from '../data/scheduleData';
import { 
  isBookingInCurrentWeek, 
  isCancellationInCurrentWeek,
  MakeupClassBooking, 
  CancelledClassSession 
} from './MakeupClassBookingModal';

interface FreeStudyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom?: (roomName: string) => void;
  makeupBookings?: MakeupClassBooking[];
  cancelledClasses?: CancelledClassSession[];
}

export function FreeStudyRoomModal({
  isOpen,
  onClose,
  onSelectRoom,
  makeupBookings = [],
  cancelledClasses = []
}: FreeStudyRoomModalProps) {
  const cambodiaTime = getCambodiaTime();
  
  // Default to today and current slot
  const defaultDay = (cambodiaTime.dayName === 'Sunday' ? 'Monday' : cambodiaTime.dayName) as ScheduleSessionDay;
  const defaultSlot = getCurrentOrClosestSlot(cambodiaTime.totalMinutes);

  type ScheduleSessionDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

  const [selectedDay, setSelectedDay] = useState<ScheduleSessionDay>(defaultDay);
  const [selectedSlot, setSelectedSlot] = useState<string>(defaultSlot);
  const [buildingFilter, setBuildingFilter] = useState<'all' | 'A' | 'J'>('all');
  const [onlyFree, setOnlyFree] = useState<boolean>(true);

  // Reset to live "Right Now"
  const handleSnapToNow = () => {
    const freshTime = getCambodiaTime();
    const day = freshTime.dayName === 'Sunday' ? 'Monday' : freshTime.dayName;
    setSelectedDay(day as ScheduleSessionDay);
    setSelectedSlot(getCurrentOrClosestSlot(freshTime.totalMinutes));
  };

  // Compute room statuses for the selected day and time slot
  const roomStatuses = useMemo(() => {
    const timeSlots = SCHEDULE_DATA.meta.timeSlots;
    const currentSlotIndex = timeSlots.indexOf(selectedSlot);

    const activeMakeups = makeupBookings.filter(m => isBookingInCurrentWeek(m));
    const activeCancellations = cancelledClasses.filter(c => isCancellationInCurrentWeek(c));

    const isSessionActiveAt = (room: string, day: string, slot: string) => {
      return ALL_SESSIONS.find(s => {
        if (s.room.trim() !== room || s.day !== day || s.time !== slot) return false;
        const isCancelled = activeCancellations.some(
          c => c.groupId === s.groupId && c.day === s.day && c.time === s.time
        );
        return !isCancelled;
      });
    };

    return FREE_STUDY_ROOMS.map(room => {
      // Find active (non-cancelled) session in this room at this slot & day
      const currentSession = isSessionActiveAt(room, selectedDay, selectedSlot);
      const currentMakeup = activeMakeups.find(
        m => m.room.trim() === room && 
          m.day === selectedDay && 
          (m.timeSlots ? m.timeSlots.includes(selectedSlot) : (m.time === selectedSlot || m.time.includes(selectedSlot)))
      );

      const isFree = !currentSession && !currentMakeup;

      // Calculate how long it remains free if free
      let freeUntil: string | null = null;
      let consecutiveFreeSlots = 0;

      if (isFree && currentSlotIndex >= 0) {
        for (let i = currentSlotIndex; i < timeSlots.length; i++) {
          const slotToCheck = timeSlots[i];
          const hasClass = Boolean(isSessionActiveAt(room, selectedDay, slotToCheck));
          const hasMakeup = activeMakeups.some(
            m => m.room.trim() === room && 
              m.day === selectedDay && 
              (m.timeSlots ? m.timeSlots.includes(slotToCheck) : (m.time === slotToCheck || m.time.includes(slotToCheck)))
          );
          if (hasClass || hasMakeup) {
            freeUntil = slotToCheck.split('-')[0].trim();
            break;
          } else {
            consecutiveFreeSlots++;
          }
        }
      }

      const isBuildingA = room.includes('A-');
      const isConfirmedA = isConfirmedRoom(room);
      const isShared = isSharedRoom(room);
      const building = isBuildingA ? 'A' : 'J';

      return {
        room,
        building,
        isBuildingA,
        isConfirmedA,
        isShared,
        isFree,
        currentSession: currentSession || (currentMakeup ? {
          day: currentMakeup.day,
          time: currentMakeup.time,
          course: `${currentMakeup.course} [Make-up]`,
          type: (currentMakeup.sessionType || 'Lecture') as 'Lecture' | 'Tutorial' | 'Practical',
          lecturer: `Booked by ${currentMakeup.bookedBy}`,
          room: currentMakeup.room,
          groupId: currentMakeup.groupId,
          groupName: currentMakeup.groupId,
          cohort: currentMakeup.generation
        } : undefined),
        freeUntil,
        consecutiveFreeSlots,
        totalDaySessions: ALL_SESSIONS.filter(s => s.room.trim() === room && s.day === selectedDay).length +
          activeMakeups.filter(m => m.room.trim() === room && m.day === selectedDay).length
      };
    });
  }, [selectedDay, selectedSlot, makeupBookings, cancelledClasses]);

  // Filtered rooms based on user preferences
  const filteredRooms = roomStatuses.filter(item => {
    if (buildingFilter !== 'all' && item.building !== buildingFilter) return false;
    if (onlyFree && !item.isFree) return false;
    return true;
  });

  const freeCount = roomStatuses.filter(r => r.isFree).length;
  const confirmedBldgAFreeCount = roomStatuses.filter(r => r.isFree && r.isConfirmedA).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Find a Free Study Room Right Now
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                  {confirmedBldgAFreeCount} Confirmed (Bldg A)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Campus room occupancy tracker. Building A rooms are verified by the IP program.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar & Quick Jump */}
        <div className="px-4 sm:px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Cambodia Time:</span>
            <span className="font-mono font-semibold text-white">{cambodiaTime.timeString}</span>
            <span className="text-slate-400">({cambodiaTime.dayName})</span>
          </div>
          <button
            onClick={handleSnapToNow}
            className="text-[11px] font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-3 h-3" />
            <span>Snap to Right Now</span>
          </button>
        </div>

        {/* Controls: Day & Time Slot Selectors */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-3 bg-slate-900/50 shrink-0">
          
          {/* Day selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0">
              Day:
            </span>
            {SCHEDULE_DATA.meta.days.map((day) => {
              const isCurrentDay = cambodiaTime.dayName === day;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/80'
                  }`}
                >
                  <span>{day}</span>
                  {isCurrentDay && (
                    <span className={`text-[9px] px-1 rounded uppercase font-bold ${isSelected ? 'bg-slate-900 text-emerald-400' : 'bg-emerald-950 text-emerald-300'}`}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Slot selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 shrink-0">
              Slot:
            </span>
            {SCHEDULE_DATA.meta.timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-sky-500 text-white font-bold shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/80'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">
                Building:
              </span>
              <button
                onClick={() => setBuildingFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  buildingFilter === 'all'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({roomStatuses.length})
              </button>
              <button
                onClick={() => setBuildingFilter('A')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  buildingFilter === 'A'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Building A
              </button>
              <button
                onClick={() => setBuildingFilter('J')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  buildingFilter === 'J'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Building J (Shared Labs)
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyFree}
                onChange={(e) => setOnlyFree(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>Show available rooms only</span>
            </label>
          </div>

        </div>

        {/* Room List Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-800/80">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-semibold text-white">No available rooms match your criteria</p>
              <p className="text-xs text-slate-400">All classrooms in this building currently have scheduled lectures or lab sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredRooms.map((item) => {
                const isConfirmedA = item.isConfirmedA;

                return (
                  <div
                    key={item.room}
                    className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2.5 ${
                      item.isFree
                        ? isConfirmedA
                          ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-500'
                          : 'bg-slate-900 border-slate-700/80 hover:border-slate-500'
                        : 'bg-slate-900/60 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                          item.isFree && isConfirmedA
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {item.building}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white leading-tight">
                            {item.room}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {isConfirmedA ? 'Building A' : item.isBuildingA ? 'Building A (3rd Fl) · Shared Room' : 'Building J · Shared Lab'}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.isFree
                          ? isConfirmedA
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {item.isFree 
                          ? isConfirmedA ? 'Free' : 'Shared (Unconfirmed)' 
                          : 'Occupied'}
                      </span>
                    </div>

                    {/* Concise Status Line */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      {item.isFree ? (
                        <span className={isConfirmedA ? 'text-emerald-300 font-medium' : 'text-slate-300'}>
                          {item.freeUntil ? `Free until ${item.freeUntil}` : 'Free all day'}
                        </span>
                      ) : (
                        <span className="text-rose-300 truncate font-medium">
                          {item.currentSession?.course} ({item.currentSession?.groupId})
                        </span>
                      )}

                      {onSelectRoom && (
                        <button
                          onClick={() => {
                            onSelectRoom(item.room);
                            onClose();
                          }}
                          className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          <span>Schedule</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="text-[11px]">
            Note: Building A 3rd floor rooms (A-3xx) and Building J labs are shared across departments; availability is unconfirmed.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
