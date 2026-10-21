import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Check, Plus, AlertCircle, Building2 } from 'lucide-react';
import { SCHEDULE_DATA, ALL_ROOMS, ScheduleSession } from '../data/scheduleData';

export interface MakeupClassBooking {
  id: string;
  course: string;
  room: string;
  generation: string;
  groupId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  bookedBy: string;
  note?: string;
  createdAt: string;
}

interface MakeupClassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBooking: (booking: MakeupClassBooking) => void;
  activeMonitorGen?: string;
}

export function MakeupClassBookingModal({
  isOpen,
  onClose,
  onSaveBooking,
  activeMonitorGen = 'IPGEN1'
}: MakeupClassBookingModalProps) {
  const [course, setCourse] = useState('');
  const [room, setRoom] = useState('Room A-109');
  const [generation, setGeneration] = useState<'I2' | 'I3' | 'I4'>('I2');
  const [groupId, setGroupId] = useState('I2-SE');
  const [day, setDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [time, setTime] = useState(SCHEDULE_DATA.meta.timeSlots[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Filter groups for selected generation
  const availableGroups = SCHEDULE_DATA.groups.filter(g => g.cohort === generation);

  const handleGenerationChange = (gen: 'I2' | 'I3' | 'I4') => {
    setGeneration(gen);
    const firstGroup = SCHEDULE_DATA.groups.find(g => g.cohort === gen);
    if (firstGroup) setGroupId(firstGroup.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.trim()) {
      setError('Please enter the class / course name.');
      return;
    }

    const newBooking: MakeupClassBooking = {
      id: `makeup-${Date.now()}`,
      course: course.trim(),
      room,
      generation,
      groupId,
      day,
      time,
      bookedBy: activeMonitorGen,
      note: note.trim() || 'Make-up Session',
      createdAt: new Date().toISOString()
    };

    onSaveBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Book Room for Make-up Class
              </h3>
              <p className="text-xs text-slate-400">
                Class Monitor Reservation · {activeMonitorGen}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
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

          {/* 2. Room Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Classroom / Venue *</span>
              <span className="text-[10px] text-emerald-400 font-normal">Bldg A confirmed by IP</span>
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

          {/* 3. Generation & Group Selection */}
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

          {/* 4. Day & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Day *
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-hidden focus:border-sky-400"
              >
                {SCHEDULE_DATA.meta.days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
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
      </div>
    </div>
  );
}
