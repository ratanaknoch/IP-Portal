import { useState, useMemo } from 'react';
import { 
  ALL_ROOMS, 
  ALL_SESSIONS, 
  ScheduleSession, 
  SCHEDULE_DATA,
  getCambodiaTime,
  getSlotLiveStatus,
  getCurrentOrClosestSlot,
  matchSlotFromInput,
  getSessionTypeStyle
} from '../data/scheduleData';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  Building2, 
  Layers, 
  Eye, 
  X,
  MapPin,
  XCircle,
  ArrowRight,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { MakeupClassBooking } from './MakeupClassBookingModal';

interface RoomViewProps {
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  onSelectSession: (session: ScheduleSession) => void;
  onOpenBookingModal?: () => void;
  makeupBookings?: MakeupClassBooking[];
}

export function RoomView({
  selectedRoom,
  onSelectRoom,
  onSelectSession,
  onOpenBookingModal,
  makeupBookings = []
}: RoomViewProps) {
  const cambodiaTime = getCambodiaTime();
  const days = SCHEDULE_DATA.meta.days;
  const timeSlots = SCHEDULE_DATA.meta.timeSlots;

  // View mode: 'weekly-matrix' (Default: Full week available rooms per hour) or 'today-inspector' (Day card view)
  const [viewMode, setViewMode] = useState<'weekly-matrix' | 'today-inspector'>('weekly-matrix');

  // Filters for weekly matrix
  const [buildingFilter, setBuildingFilter] = useState<'all' | 'A' | 'J'>('all');
  const [spotlightRoom, setSpotlightRoom] = useState<string>('ALL');
  const [dayFilter, setDayFilter] = useState<string>('ALL');
  const [roomFormat, setRoomFormat] = useState<'short' | 'full'>('short');

  // Today Inspector state
  const defaultDay = (cambodiaTime.dayName === 'Sunday' ? 'Monday' : cambodiaTime.dayName) as ScheduleSession['day'];
  const defaultSlot = getCurrentOrClosestSlot(cambodiaTime.totalMinutes);
  const [inspectorDay, setInspectorDay] = useState<ScheduleSession['day']>(defaultDay);
  const [inspectorSlot, setInspectorSlot] = useState<string>(defaultSlot);
  const [inspectorTimeQuery, setInspectorTimeQuery] = useState<string>('');

  // Shorten room name for high-density matrix display (e.g. "Room A-109" -> "A-109", "Lab A-109" -> "Lab A-109")
  const formatRoomLabel = (room: string, format: 'short' | 'full') => {
    if (format === 'full') return room;
    return room.replace(/^Room\s+/i, '');
  };

  // Helper: check if a room is occupied by a scheduled session or make-up booking
  const getOccupiedRoomsForSlot = (day: string, slot: string) => {
    const scheduled = ALL_SESSIONS
      .filter(s => s.day === day && s.time === slot)
      .map(s => s.room.trim());
    
    const makeups = makeupBookings
      .filter(m => m.day === day && m.time === slot)
      .map(m => m.room.trim());

    return Array.from(new Set([...scheduled, ...makeups]));
  };

  // Helper: for a given day and time slot, get the list of AVAILABLE rooms
  const getAvailableRoomsForSlot = (day: string, slot: string) => {
    const occupiedSet = new Set(getOccupiedRoomsForSlot(day, slot));

    return ALL_ROOMS.filter(r => {
      const trimmed = r.trim();
      const isOccupied = occupiedSet.has(trimmed);
      if (isOccupied) return false;
      if (buildingFilter === 'A' && !trimmed.includes('A-')) return false;
      if (buildingFilter === 'J' && !trimmed.includes('J-')) return false;
      return true;
    });
  };

  // Jump inspector to live hour
  const handleJumpToNow = () => {
    const liveTime = getCambodiaTime();
    const liveDay = liveTime.dayName === 'Sunday' ? 'Monday' : (liveTime.dayName as ScheduleSession['day']);
    const liveSlot = getCurrentOrClosestSlot(liveTime.totalMinutes);
    setInspectorDay(liveDay);
    setInspectorSlot(liveSlot);
    setInspectorTimeQuery('');
  };

  const handleInspectorTimeChange = (val: string) => {
    setInspectorTimeQuery(val);
    const matched = matchSlotFromInput(val);
    if (matched) {
      setInspectorSlot(matched);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Navigation & View Switcher */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-md p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Sub-view switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-md">
            <button
              onClick={() => setViewMode('weekly-matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'weekly-matrix'
                  ? 'bg-slate-700 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Week Available Rooms</span>
            </button>
            <button
              onClick={() => setViewMode('today-inspector')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'today-inspector'
                  ? 'bg-slate-700 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Hour Availability Inspector</span>
            </button>
          </div>

          {/* Make-up class booking trigger & Venue counts */}
          <div className="flex items-center gap-3">
            {onOpenBookingModal && (
              <button
                onClick={onOpenBookingModal}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Make-up Class</span>
              </button>
            )}

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>10 Venues (6 in Bldg A · 4 in Bldg J)</span>
            </div>
          </div>

        </div>

        {/* Filters Toolbar for Weekly Matrix */}
        {viewMode === 'weekly-matrix' && (
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Building Filter & Day Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                  Building:
                </span>
                <div className="flex items-center gap-1">
                  {(['all', 'A', 'J'] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBuildingFilter(b)}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                        buildingFilter === b
                          ? b === 'A' 
                            ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                            : 'bg-slate-100 text-slate-900 border-slate-100 font-bold'
                          : 'text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {b === 'all' ? 'All Buildings' : b === 'A' ? 'Building A (Confirmed)' : 'Building J (Shared)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                  Day:
                </span>
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 border border-slate-700 rounded text-slate-200"
                >
                  <option value="ALL">All Days (Mon - Sat)</option>
                  {days.map(d => (
                    <option key={d} value={d}>
                      {d} {cambodiaTime.dayName === d ? '(Today)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Spotlight & Label Format */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Highlight Room:
                </span>
                <select
                  value={spotlightRoom}
                  onChange={(e) => setSpotlightRoom(e.target.value)}
                  className="px-2 py-1 text-xs font-mono font-medium bg-slate-800 border border-slate-700 rounded text-slate-200"
                >
                  <option value="ALL">None (Show All Available)</option>
                  <optgroup label="Building A (Confirmed IP Classrooms)">
                    {ALL_ROOMS.filter(r => r.includes('A-')).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Building J (Shared Computer Labs)">
                    {ALL_ROOMS.filter(r => r.includes('J-')).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center gap-1 border border-slate-700 rounded p-0.5 bg-slate-800">
                <button
                  onClick={() => setRoomFormat('short')}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    roomFormat === 'short' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Short
                </button>
                <button
                  onClick={() => setRoomFormat('full')}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    roomFormat === 'full' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODE 1: WEEKLY AVAILABLE ROOMS MATRIX (DEFAULT)                            */}
      {/* ========================================================================= */}
      {viewMode === 'weekly-matrix' && (
        <div className="space-y-3">
          
          <div className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden shadow-xs">
            {/* Mobile horizontal scroll hint */}
            <div className="no-print sm:hidden flex items-center justify-between px-3 py-2 bg-slate-850 border-b border-slate-800 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <span>Scroll horizontally for all days</span>
                <span className="text-sky-400 font-bold">→</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Mon–Sat</span>
            </div>

            <div className="overflow-x-auto w-full overscroll-x-contain">
              <table className="w-full min-w-[760px] md:min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-800/95 border-b border-slate-700">
                    <th className="sticky left-0 z-20 bg-slate-800 p-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 w-28 text-center shrink-0 border-r border-slate-700 shadow-[2px_0_6px_rgba(0,0,0,0.4)]">
                      Time Slot
                    </th>
                    {days
                      .filter(d => dayFilter === 'ALL' || dayFilter === d)
                      .map((day) => {
                        const isToday = cambodiaTime.dayName === day;
                        return (
                          <th
                            key={day}
                            className={`p-2.5 text-xs font-semibold text-center border-r border-slate-700 last:border-r-0 ${
                              isToday ? 'bg-slate-700 text-slate-100 font-bold' : 'text-slate-300'
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
                  {timeSlots.map((slot, sIdx) => {
                    const isAfternoonSplit = sIdx === 4;

                    return (
                      <tr
                        key={slot}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          isAfternoonSplit ? 'border-t-2 border-slate-700' : ''
                        }`}
                      >
                        {/* Time slot sticky column */}
                        <td className="sticky left-0 z-10 p-2.5 font-mono tabular-nums text-xs text-slate-300 font-medium bg-slate-900 text-center border-r border-slate-800 whitespace-nowrap shadow-[2px_0_6px_rgba(0,0,0,0.35)]">
                          <div className="font-bold text-slate-200">{slot}</div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {sIdx < 4 ? `Morning Slot ${sIdx + 1}` : `Afternoon Slot ${sIdx - 3}`}
                          </div>
                        </td>

                        {/* Day cells with available rooms list */}
                        {days
                          .filter(d => dayFilter === 'ALL' || dayFilter === d)
                          .map((day) => {
                            const availableRooms = getAvailableRoomsForSlot(day, slot);
                            const isToday = cambodiaTime.dayName === day;
                            const liveStatus = getSlotLiveStatus(slot, day, cambodiaTime);

                            const totalMatchingRooms = buildingFilter === 'all' 
                              ? ALL_ROOMS.length 
                              : buildingFilter === 'A' ? 6 : 4;

                            return (
                              <td
                                key={day}
                                className={`p-2.5 border-r border-slate-800 last:border-r-0 align-top ${
                                  isToday ? 'bg-slate-900/40' : ''
                                } ${
                                  liveStatus.isCurrent ? 'ring-2 ring-emerald-500/30' : ''
                                }`}
                              >
                                <div className="space-y-1.5">
                                  
                                  {/* Availability header badge */}
                                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800">
                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span className="font-mono tabular-nums font-bold">
                                        {availableRooms.length}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-sans">
                                        / {totalMatchingRooms} free
                                      </span>
                                    </div>

                                    {liveStatus.isCurrent && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider px-1 rounded bg-emerald-600 text-white">
                                        Now
                                      </span>
                                    )}
                                  </div>

                                  {/* List of Available Rooms at this hour */}
                                  {availableRooms.length === 0 ? (
                                    <div className="py-2 text-center text-slate-500 text-[10px] italic">
                                      All venues occupied at this hour.
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1">
                                      {availableRooms.map((room) => {
                                        const isSpotlighted = spotlightRoom !== 'ALL' && spotlightRoom === room;
                                        const isBuildingJ = room.includes('J-');

                                        // Crucial user requirement:
                                        // Building A rooms are confirmed by IP -> colored GREEN!
                                        // Building J rooms are shared and unconfirmed -> colored GREY/neutral!
                                        return (
                                          <button
                                            key={room}
                                            onClick={() => onSelectRoom(room)}
                                            title={
                                              isBuildingJ 
                                                ? `${room} (Building J Computer Lab - Unconfirmed Availability)` 
                                                : `${room} (Building A - Confirmed IP Classroom Available)`
                                            }
                                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-medium transition-all text-left border ${
                                              isSpotlighted
                                                ? 'bg-sky-500 text-slate-950 font-bold ring-2 ring-sky-300 shadow-xs'
                                                : isBuildingJ
                                                ? 'bg-slate-900/90 text-slate-400 border-slate-750 hover:border-slate-500 hover:text-slate-200'
                                                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:border-emerald-500 font-semibold'
                                            }`}
                                          >
                                            {formatRoomLabel(room, roomFormat)}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

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

            {/* Footer Summary / Legend */}
            <div className="no-print p-3 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">
                  Venue Legend:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-500"></span>
                  <span className="text-emerald-300 font-medium">Building A (Confirmed Available: A-109, A-401, A-402, A-417, A-420, Lab A-109)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-850 border border-slate-700"></span>
                  <span className="text-slate-400">Building J (Shared Computer Labs - Unconfirmed by IP)</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                IP program has full control over Building A classrooms.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: HOUR AVAILABILITY INSPECTOR (SINGLE SLOT CARD VIEW)               */}
      {/* ========================================================================= */}
      {viewMode === 'today-inspector' && (
        <div className="space-y-4">
          
          {/* Hour & Day Filter Box */}
          <div className="no-print bg-slate-900 border border-slate-800 rounded-md p-4 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Day:
                </span>
                {days.map((d) => {
                  const isSelected = inspectorDay === d;
                  const isToday = cambodiaTime.dayName === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setInspectorDay(d)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{d}</span>
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

              <button
                onClick={handleJumpToNow}
                className="px-3 py-1 text-xs font-semibold rounded bg-slate-800 text-sky-400 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Jump to Current Hour</span>
              </button>
            </div>

            {/* Time slot picker */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Time Slot:
                </span>
                <select
                  value={inspectorSlot}
                  onChange={(e) => {
                    setInspectorSlot(e.target.value);
                    setInspectorTimeQuery('');
                  }}
                  className="text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-100 rounded-md px-3 py-1.5"
                >
                  {timeSlots.map((s, idx) => (
                    <option key={s} value={s}>
                      {s} ({idx < 4 ? 'Morning' : 'Afternoon'})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={inspectorTimeQuery}
                  onChange={(e) => handleInspectorTimeChange(e.target.value)}
                  placeholder="Type hour e.g. 9h10, 14:00..."
                  className="w-48 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="text-xs text-slate-400">
                {getAvailableRoomsForSlot(inspectorDay, inspectorSlot).length} of {ALL_ROOMS.length} venues free at this hour
              </div>
            </div>
          </div>

          {/* Cards for available rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_ROOMS.map(room => {
              const occupiedSession = ALL_SESSIONS.find(
                s => s.day === inspectorDay && s.time === inspectorSlot && s.room.trim() === room.trim()
              );
              const makeupSession = makeupBookings.find(
                m => m.day === inspectorDay && m.time === inspectorSlot && m.room.trim() === room.trim()
              );

              const isAvailable = !occupiedSession && !makeupSession;
              const isBldgJ = room.includes('J-');

              if (isAvailable) {
                return (
                  <div
                    key={room}
                    className={`border rounded-md p-4 shadow-xs space-y-2 ${
                      isBldgJ 
                        ? 'bg-slate-900 border-slate-800' 
                        : 'bg-emerald-950/20 border-emerald-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1 ${
                        isBldgJ 
                          ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {isBldgJ ? 'Unconfirmed (Shared Lab)' : 'Confirmed Available'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {isBldgJ ? 'Building J' : 'Building A'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {room}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isBldgJ || room.startsWith('Lab') ? 'Computer Laboratory' : 'Lecture Hall'} · Free at {inspectorSlot}
                    </p>
                  </div>
                );
              } else if (makeupSession) {
                return (
                  <div
                    key={room}
                    className="bg-amber-950/20 border border-amber-800/80 rounded-md p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Make-up Class
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {isBldgJ ? 'Building J' : 'Building A'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {room}
                    </h3>

                    <div className="p-2 rounded bg-amber-950/40 border border-amber-800 text-xs">
                      <div className="font-semibold text-amber-200 line-clamp-1">
                        {makeupSession.course}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        {makeupSession.groupId} · Booked by {makeupSession.bookedBy}{makeupSession.date ? ` (${makeupSession.date})` : ''}
                      </div>
                    </div>
                  </div>
                );
              } else if (occupiedSession) {
                const style = getSessionTypeStyle(occupiedSession.type);
                return (
                  <div
                    key={room}
                    className="bg-slate-900 border border-slate-800 rounded-md p-4 shadow-xs space-y-2 opacity-80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-slate-400" /> Occupied
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {isBldgJ ? 'Building J' : 'Building A'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {room}
                    </h3>

                    <div 
                      onClick={() => onSelectSession(occupiedSession)}
                      className={`p-2 rounded border cursor-pointer ${style.card} text-xs`}
                    >
                      <div className="font-semibold text-slate-100 line-clamp-1">
                        {occupiedSession.course}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {occupiedSession.groupId} · {occupiedSession.lecturer}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>

        </div>
      )}

    </div>
  );
}
