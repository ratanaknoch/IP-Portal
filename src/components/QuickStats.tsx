import { SCHEDULE_DATA, ALL_LECTURERS, ALL_ROOMS, ALL_SESSIONS } from '../data/scheduleData';
import { Layers } from 'lucide-react';

export function QuickStats() {
  const totalGroups = SCHEDULE_DATA.groups.length;
  const cohortsCount = new Set(SCHEDULE_DATA.groups.map(g => g.cohort)).size;
  const lecturersCount = ALL_LECTURERS.length;
  const roomsCount = ALL_ROOMS.length;
  const totalSessions = ALL_SESSIONS.length;

  return (
    <div className="no-print bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 mb-3 shadow-xs">
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] text-xs sm:text-sm text-slate-400">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="font-bold text-slate-200 text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
            <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden xs:inline sm:inline">Academic Overview</span>
            <span className="xs:hidden">Overview</span>
          </span>
          
          <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Cohorts:</span>
            <span className="font-mono font-bold text-slate-100">{cohortsCount}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Groups:</span>
            <span className="font-mono font-bold text-slate-100">{totalGroups}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Faculty:</span>
            <span className="font-mono font-bold text-slate-100">{lecturersCount}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Venues:</span>
            <span className="font-mono font-bold text-slate-100">{roomsCount}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-400">Weekly:</span>
            <span className="font-mono font-bold text-slate-100">{totalSessions}</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden md:inline shrink-0">
          Sem 1 · 2026–2027
        </div>
      </div>
    </div>
  );
}
