import { useState, useMemo } from 'react';
import { 
  ALL_LECTURERS, 
  ALL_SESSIONS, 
  ScheduleSession,
  getSessionTypeStyle,
  SCHEDULE_DATA 
} from '../data/scheduleData';
import { User, BookOpen, Clock, MapPin, Users, Calendar, Filter } from 'lucide-react';

interface LecturerViewProps {
  selectedLecturer: string;
  onSelectLecturer: (lecturer: string) => void;
  onSelectSession: (session: ScheduleSession) => void;
}

export function LecturerView({
  selectedLecturer,
  onSelectLecturer,
  onSelectSession
}: LecturerViewProps) {
  const [filterDay, setFilterDay] = useState<string>('ALL');

  // Ensure an active lecturer is selected
  const activeLecturer = selectedLecturer || ALL_LECTURERS[0];

  // Sessions taught by this lecturer
  const lecturerSessions = useMemo(() => {
    return ALL_SESSIONS.filter(s => s.lecturer === activeLecturer);
  }, [activeLecturer]);

  // Unique courses taught by this lecturer
  const coursesTaught = useMemo(() => {
    return Array.from(new Set(lecturerSessions.map(s => s.course)));
  }, [lecturerSessions]);

  // Groups taught
  const groupsTaught = useMemo(() => {
    return Array.from(new Set(lecturerSessions.map(s => s.groupId).filter(Boolean)));
  }, [lecturerSessions]);

  // Rooms used
  const roomsUsed = useMemo(() => {
    return Array.from(new Set(lecturerSessions.map(s => s.room)));
  }, [lecturerSessions]);

  // Grouped by day
  const days = SCHEDULE_DATA.meta.days;
  const filteredSessions = filterDay === 'ALL'
    ? lecturerSessions
    : lecturerSessions.filter(s => s.day === filterDay);

  return (
    <div className="space-y-4">
      {/* Selector & Instructor Stats Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-md p-3 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" />
            <label htmlFor="lecturer-select" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Instructor:
            </label>
          </div>
          <div className="w-full sm:w-72">
            <select
              id="lecturer-select"
              value={activeLecturer}
              onChange={(e) => onSelectLecturer(e.target.value)}
              className="w-full text-sm font-medium bg-slate-800 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-slate-100"
            >
              {ALL_LECTURERS.map((lecturer) => (
                <option key={lecturer} value={lecturer}>
                  {lecturer}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Instructor Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Weekly Load</span>
            <span className="font-mono tabular-nums font-bold text-base text-slate-100">
              {lecturerSessions.length} slots
            </span>
            <span className="text-slate-400 block text-[11px]">(~{lecturerSessions.length * 55} mins)</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Courses Taught</span>
            <span className="font-bold text-base text-slate-100">
              {coursesTaught.length}
            </span>
            <span className="text-slate-400 block text-[11px] truncate" title={coursesTaught.join(', ')}>
              {coursesTaught[0]}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Assigned Groups</span>
            <span className="font-bold text-base text-slate-100">
              {groupsTaught.join(', ')}
            </span>
            <span className="text-slate-400 block text-[11px]">{groupsTaught.length} cohorts</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Allocated Rooms</span>
            <span className="font-bold text-base text-slate-100">
              {roomsUsed.length} venues
            </span>
            <span className="text-slate-400 block text-[11px] truncate">
              {roomsUsed.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Day Filter bar (No-print) */}
      <div className="no-print flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Day:</span>
          {['ALL', ...days].map((day) => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filterDay === day
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-400">
          Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Printable Heading */}
      <div className="print-only text-center mb-4">
        <h2 className="text-lg font-bold uppercase text-slate-900">
          Faculty Teaching Schedule: {activeLecturer}
        </h2>
        <p className="text-xs text-slate-600">
          Institute of Technology of Cambodia · Semester 1 (2026–2027)
        </p>
      </div>

      {/* Grouped Chronological Schedule Cards */}
      <div className="space-y-4">
        {days
          .filter(day => filterDay === 'ALL' || filterDay === day)
          .map((day) => {
            const sessionsOnDay = lecturerSessions.filter(s => s.day === day);
            if (sessionsOnDay.length === 0) {
              if (filterDay !== 'ALL') {
                return (
                  <div key={day} className="bg-slate-900 border border-slate-800 rounded-md p-6 text-center text-slate-400 text-xs">
                    No scheduled teaching commitments on {day}.
                  </div>
                );
              }
              return null;
            }

            return (
              <div 
                key={day} 
                className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden shadow-xs print-card"
              >
                <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-sm text-slate-100">{day}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {sessionsOnDay.length} class{sessionsOnDay.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                <div className="divide-y divide-slate-800 p-2 sm:p-3 space-y-2">
                  {sessionsOnDay.map((session, sIdx) => {
                    const style = getSessionTypeStyle(session.type);
                    return (
                      <div
                        key={sIdx}
                        onClick={() => onSelectSession(session)}
                        className={`p-3 rounded border cursor-pointer transition-colors ${style.card} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${style.badge}`}>
                              {session.type}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-300">
                              {session.groupId}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs font-mono tabular-nums text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {session.time}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-100 text-sm">
                            {session.course}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{session.room || "Room TBD"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
