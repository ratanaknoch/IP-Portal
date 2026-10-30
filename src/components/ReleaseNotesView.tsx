import { useState } from 'react';
import { ArrowLeft, Copy, Check, Mail } from 'lucide-react';

interface ReleaseNotesViewProps {
  onBack: () => void;
}

export function ReleaseNotesView({ onBack }: ReleaseNotesViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('ratanaknochmunny@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            IP-Portal Changelog
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
        
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Release Notes
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800">
              v1.2.0 · Latest
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Platform updates, schedule refinements, and changelog for IP-Portal.
          </p>
        </div>

        {/* Feedback & Bug Report Box */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-5 space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-semibold text-white">
              Feature Suggestions & Bug Reports
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              If you want to suggest new features, request functions, or report a bug, feel free to reach out directly:
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-200">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="select-all">ratanaknochmunny@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <a
                href="mailto:ratanaknochmunny@gmail.com?subject=IP-Portal%20Feedback%20%2F%20Bug%20Report"
                className="py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Version 1.2.0 Section */}
        <section className="space-y-4 rounded-xl bg-slate-900/60 border border-sky-900/60 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-white">v1.2.0</h2>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Current Release
              </span>
              <span className="text-xs text-slate-400">— Mobile Experience, Role Security & Schedule Refinements</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">October 2026</span>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-300 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">Role-Based Front Page Pathways:</strong> Student accounts now see a dedicated 2-column layout featuring only the <strong className="text-sky-300">Student Portal</strong> and <strong className="text-slate-100">Student Club</strong> tabs, keeping the <strong className="text-amber-300">Class Monitor Portal</strong> exclusive to verified Class Monitors.
            </li>
            <li>
              <strong className="text-white">Authenticated Notification Privacy:</strong> The Notification Bell, unread badge, and real-time announcement subscriptions are now strictly restricted to signed-in users and hidden from unauthenticated guests.
            </li>
            <li>
              <strong className="text-white">Unified Profile Dropdown Menu:</strong> Consolidated the top navigation bar across the front page and schedule views into a single Profile button that opens a dropdown menu containing account badges, <strong className="text-sky-300">Academic Status & Promotion</strong>, and <strong className="text-rose-300">Sign Out</strong>.
            </li>
            <li>
              <strong className="text-white">Mobile-First Responsive Optimization:</strong>
              <ul className="pl-5 mt-1.5 space-y-1.5 text-xs sm:text-sm text-slate-300 list-[circle] list-inside">
                <li>Streamlined mobile front-page header branding to <strong className="text-white">IES</strong> on narrow screens while preserving full institutional titles on tablet and desktop.</li>
                <li>Refined mobile Hero typography and stacking layers (<code className="text-xs font-mono text-sky-300">z-index</code>) so dropdown menus and interactive controls never overlap with the Metallic ITC Emblem or animated title.</li>
                <li>Converted the <strong className="text-white">Academic Overview</strong> bar into a compact horizontally scrollable badge strip and optimized filter buttons and room codes (defaulting to short format like <code className="text-xs font-mono text-emerald-300">A-420</code> on mobile).</li>
              </ul>
            </li>
            <li>
              <strong className="text-white">Schedule & Room Assignment Updates:</strong> Ongoing fixes and refinements to resolve room and timetable scheduling issues across cohorts.
            </li>
          </ul>
        </section>

        {/* Version 1.1.0 Section */}
        <section className="space-y-4 rounded-xl bg-slate-900/35 border border-slate-800/90 p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">v1.1.0</h2>
              <span className="text-xs text-slate-400">— Advance Weekly Planning, Make-up Hub & Room Verification</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">October 2026</span>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-300 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">This Week & Next Week Switcher:</strong> Added multi-week scheduling support across the Timetable Matrix, Room Availability View, Daily Agenda, and Make-up Booking modal so Class Monitors and students can plan and inspect schedules up to one week ahead with automatic Sunday weekly resets.
            </li>
            <li>
              <strong className="text-white">Make-up Classes & Class Cancellations Hub (<code className="text-xs font-mono text-sky-300">/makeup-classes</code>):</strong> Added a dedicated tab to track active make-up bookings and cancelled sessions, supporting multi-hour bookings, automatic slot replacement when a make-up session overlaps a regular class, and 1-click class cancellation for Class Monitors.
            </li>
            <li>
              <strong className="text-white">Confirmed IP Classrooms vs. Shared Venues:</strong> Color-coded and prioritized confirmed International Program classrooms in Building A (<strong className="text-emerald-400">green</strong>) above shared Building J computer labs and Building A 3rd-floor rooms (<strong className="text-slate-400">gray</strong>).
            </li>
            <li>
              <strong className="text-white">Temporary Room Relocation Badges:</strong> Added visual indicators for temporary classroom relocations directly inside timetable session cards and detail views.
            </li>
          </ul>
        </section>

        {/* Version 1.0.0 Section */}
        <section className="space-y-4 rounded-xl bg-slate-900/20 border border-slate-800/60 p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">v1.0.0</h2>
              <span className="text-xs text-slate-400">— First Official Publish</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Academic Year 2026–2027</span>
          </div>

          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">Timetable Matrix:</strong> Complete weekly schedules for Foundation Years (I1, I2) and Engineering Specializations (I3, I4: SE, AIECS, CMIE).
            </li>
            <li>
              <strong className="text-white">Make-up Class Booking:</strong> Room reservation system in Building A & J with schedule conflict prevention and monitor notifications.
            </li>
            <li>
              <strong className="text-white">Academic Status Progression:</strong> Students can advance their cohort annually (I1 → I2 → I3 → I4 → I5 → Alumni) with synced profile state.
            </li>
            <li>
              <strong className="text-white">Free Room Scanner:</strong> Real-time discovery of vacant classrooms across Building A & J for self-study and group sessions.
            </li>
            <li>
              <strong className="text-white">Lecturer Directory:</strong> Searchable instructor schedules and weekly teaching matrices.
            </li>
            <li>
              <strong className="text-white">Direct URLs:</strong> Unique routes for each section (<code className="text-xs font-mono text-sky-300">/schedule</code>, <code className="text-xs font-mono text-sky-300">/rooms</code>, <code className="text-xs font-mono text-sky-300">/lecturers</code>, <code className="text-xs font-mono text-sky-300">/agenda</code>, <code className="text-xs font-mono text-sky-300">/makeup-classes</code>, <code className="text-xs font-mono text-sky-300">/release-notes</code>).
            </li>
          </ul>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        <p>Institute of Technology of Cambodia (ITC) · International Engineering School</p>
      </footer>
    </div>
  );
}
