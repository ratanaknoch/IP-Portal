import { SCHEDULE_DATA, ALL_LECTURERS, ALL_ROOMS, ALL_SESSIONS } from '../data/scheduleData';

export function QuickStats() {
  const totalGroups = SCHEDULE_DATA.groups.length;
  const cohortsCount = new Set(SCHEDULE_DATA.groups.map(g => g.cohort)).size;
  const lecturersCount = ALL_LECTURERS.length;
  const roomsCount = ALL_ROOMS.length;
  const totalSessions = ALL_SESSIONS.length;

  return (
    <div className="no-print grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Cohorts
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {cohortsCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            I2 · I3 · I4
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total Groups
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalGroups}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            SE · AIECS · CMIE
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Faculty Lecturers
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {lecturersCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Instructors
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Classrooms & Labs
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {roomsCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Buildings A & J
          </span>
        </div>
      </div>

      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Weekly Sessions
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalSessions}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Mon to Sat
          </span>
        </div>
      </div>
    </div>
  );
}
