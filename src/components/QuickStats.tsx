import { SCHEDULE_DATA, ALL_LECTURERS, ALL_ROOMS, ALL_SESSIONS } from '../data/scheduleData';
import { Layers } from 'lucide-react';

export function QuickStats() {
  const totalGroups = SCHEDULE_DATA.groups.length;
  const cohortsCount = new Set(SCHEDULE_DATA.groups.map(g => g.cohort)).size;
  const lecturersCount = ALL_LECTURERS.length;
  const roomsCount = ALL_ROOMS.length;
  const totalSessions = ALL_SESSIONS.length;

  return (
    <div className="no-print bg-slate-900/80 border border-slate-800 rounded-lg px-3.5 py-2 mb-3 flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-400 gap-2.5 shadow-xs">
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
        <span className="font-semibold text-slate-200 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Academic Overview:</span>
        </span>
        
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400">Cohorts:</span>
          <span className="font-mono font-bold text-slate-100">{cohortsCount}</span>
          <span className="text-slate-500 text-xs hidden sm:inline">(I1–I5 · Alumni)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400">Groups:</span>
          <span className="font-mono font-bold text-slate-100">{totalGroups}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400">Faculty:</span>
          <span className="font-mono font-bold text-slate-100">{lecturersCount}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400">Venues:</span>
          <span className="font-mono font-bold text-slate-100">{roomsCount}</span>
          <span className="text-slate-500 text-xs hidden md:inline">(Building A & J)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-400">Weekly:</span>
          <span className="font-mono font-bold text-slate-100">{totalSessions}</span>
          <span className="text-slate-500 text-xs hidden sm:inline">sessions</span>
        </div>
      </div>

      <div className="text-xs font-mono text-slate-400 hidden lg:inline">
        Sem 1 · 2026–2027
      </div>
    </div>
  );
}
