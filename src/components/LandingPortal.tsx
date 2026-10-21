import { useState } from 'react';
import TechText from './TechText';
import DotGrid from './DotGrid';
import { 
  CalendarDays, 
  Users, 
  ArrowRight, 
  Clock, 
  X,
  ExternalLink,
  Info,
  GraduationCap,
  Building2,
  Lock,
  Bookmark,
  ShieldCheck,
  Check
} from 'lucide-react';
import { getCambodiaTime, SCHEDULE_DATA } from '../data/scheduleData';

interface LandingPortalProps {
  onEnterClassMonitor: (genPassword?: string) => void;
  onEnterStudentSchedule: (groupId: string) => void;
  onOpenFreeRooms: () => void;
  myCohort: string;
  onSelectMyCohort: (groupId: string) => void;
  isMonitorAuthorized: boolean;
  onAuthorizeMonitor: (genPassword: string) => void;
}

export function LandingPortal({
  onEnterClassMonitor,
  onEnterStudentSchedule,
  onOpenFreeRooms,
  myCohort,
  onSelectMyCohort,
  isMonitorAuthorized,
  onAuthorizeMonitor
}: LandingPortalProps) {
  const [showClubModal, setShowClubModal] = useState(false);
  const [showMonitorAuthModal, setShowMonitorAuthModal] = useState(false);
  const [showClassSelectModal, setShowClassSelectModal] = useState(false);
  const [monitorPinInput, setMonitorPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const cambodiaTime = getCambodiaTime();

  // Strict user specification: All letters are pure white except PORTAL which is blue
  const letterColor = '#ffffff';
  const portalBlueColor = '#38bdf8';
  const accentHighlight = '#38bdf8';

  // Allowed class monitor passwords: "IPGEN1", "IPGEN2", "IPGEN3"
  const VALID_MONITOR_PASSWORDS = ['IPGEN1', 'IPGEN2', 'IPGEN3'];

  const handleClassMonitorClick = () => {
    if (isMonitorAuthorized) {
      onEnterClassMonitor();
    } else {
      setPinError('');
      setMonitorPinInput('');
      setShowMonitorAuthModal(true);
    }
  };

  const handleVerifyMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = monitorPinInput.trim().toUpperCase();
    if (VALID_MONITOR_PASSWORDS.includes(clean)) {
      onAuthorizeMonitor(clean);
      setShowMonitorAuthModal(false);
      onEnterClassMonitor(clean);
    } else {
      setPinError('Invalid password. Access restricted to class monitors.');
    }
  };

  const hasSavedClass = () => {
    try {
      return localStorage.getItem('itc_student_class_picked') === 'true' && Boolean(localStorage.getItem('itc_my_cohort'));
    } catch {
      return false;
    }
  };

  const handleStudentPortalClick = () => {
    // Only ask once natively; if already saved, enter directly
    if (hasSavedClass()) {
      onEnterStudentSchedule(myCohort);
    } else {
      setShowClassSelectModal(true);
    }
  };

  const handleSelectClassAndEnter = (groupId: string) => {
    try {
      localStorage.setItem('itc_student_class_picked', 'true');
    } catch {
      // ignore
    }
    onSelectMyCohort(groupId);
    setShowClassSelectModal(false);
    onEnterStudentSchedule(groupId);
  };

  return (
    <div className="relative min-h-screen bg-[#060a16] text-white flex flex-col justify-between overflow-hidden selection:bg-sky-900 selection:text-white">
      
      {/* Background DotGrid with dynamic shockwaves & mouse tracking */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-auto">
        <DotGrid
          baseColor="#223049"
          activeColor="#38bdf8"
          dotSize={4}
          gap={22}
          proximity={160}
          strength={1.2}
          bounce={0.5}
          tension={0.3}
          shockRadius={320}
          shockStrength={4.5}
          mouseInteraction={true}
          clickShock={true}
          fade={0.12}
        />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm p-0.5 shadow-md shadow-black/40 border border-white/25 flex items-center justify-center shrink-0">
            <img
              src="/assets/cropped-itc_tight.png"
              alt="ITC School Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
              Institute of Technology of Cambodia
            </h1>
            <p className="text-[11px] text-slate-300">
              International Engineering School
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href="https://discord.gg/QH3rwPbwRm"
            target="_blank"
            rel="noopener noreferrer"
            title="Join Community Discord Server"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-indigo-200 hover:text-white border border-[#5865F2]/40 rounded-md text-xs font-medium transition-colors"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            <span className="hidden sm:inline">Community Discord</span>
          </a>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-md text-xs text-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono tabular-nums font-semibold text-white">{cambodiaTime.timeString}</span>
            <span className="text-slate-400">Phnom Penh (UTC+7)</span>
          </div>
        </div>
      </nav>

      {/* Hero Body */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* School Logo */}
        <div className="mb-2 sm:mb-2.5 inline-flex items-center justify-center transition-transform duration-200 hover:scale-105">
          <img
            src="/assets/itc_front_tight.png"
            alt="ITC School Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-30 md:h-30 object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* 3-Line Centered Hero Title */}
        <div className="flex flex-col items-center justify-center my-0.5 text-center w-full">
          <div className="w-full max-w-sm h-16 sm:h-20 flex items-center justify-center text-white" style={{ color: '#ffffff' }}>
            <TechText
              text="ITC"
              fontWeight={900}
              fontSize={76}
              letterSpacing={0.06}
              color={letterColor}
              accentColor={accentHighlight}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={12}
              intro="assemble"
              introDuration={1.3}
              clickKick={true}
              guides={false}
            />
          </div>

          <div className="w-full max-w-4xl h-12 sm:h-15 -mt-1.5 sm:-mt-2 flex items-center justify-center text-white" style={{ color: '#ffffff' }}>
            <TechText
              text="INTERNATIONAL ENGINEERING SCHOOL"
              fontWeight={800}
              fontSize={30}
              letterSpacing={0.03}
              color={letterColor}
              accentColor={accentHighlight}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={14}
              intro="assemble"
              introDuration={1.6}
              clickKick={true}
              guides={false}
            />
          </div>

          <div className="w-full max-w-xs h-12 sm:h-15 -mt-1 sm:-mt-1.5 flex items-center justify-center text-sky-400" style={{ color: portalBlueColor }}>
            <TechText
              text="PORTAL"
              fontWeight={900}
              fontSize={42}
              letterSpacing={0.16}
              color={portalBlueColor}
              accentColor="#93c5fd"
              reveal="letter"
              dashLength={3}
              dashGap={2}
              specks={8}
              intro="assemble"
              introDuration={1.8}
              clickKick={true}
              guides={false}
            />
          </div>
        </div>

        {/* Student-Made Educational Disclaimer */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-md bg-slate-900/90 border border-slate-700/80 text-[11px] sm:text-xs text-slate-300 shadow-xs backdrop-blur-xs max-w-2xl text-center">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            This is not an official website from the school, but a student-made project for learning and documentation purposes.
          </span>
        </div>

        {/* 3 Primary Pathways - Concise & Clean (NO wordy descriptions per user instruction) */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          
          {/* Card 1: Class Monitor Portal */}
          <div 
            onClick={handleClassMonitorClick}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-sky-400 rounded-lg p-5 shadow-lg hover:shadow-sky-950/40 transition-all duration-200 flex flex-col justify-between backdrop-blur-xs"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-md bg-white text-slate-900 flex items-center justify-center shadow-xs">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Monitor Only
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                  Class Monitor Portal
                </h3>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-white">
              <span className="group-hover:translate-x-0.5 transition-transform text-slate-200 group-hover:text-white">
                Enter as Class Monitor
              </span>
              <div className="w-7 h-7 rounded bg-slate-800 group-hover:bg-white group-hover:text-slate-900 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Student Club */}
          <div 
            onClick={() => setShowClubModal(true)}
            className="group cursor-pointer bg-slate-900/70 hover:bg-slate-900/85 border border-slate-800 hover:border-slate-700 rounded-lg p-5 shadow-sm transition-all duration-200 flex flex-col justify-between backdrop-blur-xs"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                  Under Dev
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Student Club
                </h3>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300">
              <span>View Club Overview</span>
              <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Card 3: Student Portal (Under Dev per user request, but clickable to select class & enter) */}
          <div 
            onClick={handleStudentPortalClick}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-sky-900/70 hover:border-sky-400/80 rounded-lg p-5 shadow-lg transition-all duration-200 flex flex-col justify-between backdrop-blur-xs ring-1 ring-sky-500/20"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center shadow-xs font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                  Under Dev
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  Student Portal
                </h3>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              <span className="group-hover:translate-x-0.5 transition-transform">
                {hasSavedClass() ? `Enter Student Portal (${myCohort})` : 'Select Class & Enter'}
              </span>
              <div className="w-7 h-7 rounded bg-sky-950 text-sky-300 group-hover:bg-sky-500 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

        {/* Community Discord Banner */}
        <a
          href="https://discord.gg/QH3rwPbwRm"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-4xl mt-3 p-3.5 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 hover:border-[#5865F2]/60 transition-all duration-200 flex items-center justify-between group backdrop-blur-xs text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#5865F2] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                  Community Discord
                </h4>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-1.5 py-0.2 rounded">
                  Community
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 group-hover:text-white transition-colors shrink-0 ml-3">
            <span className="hidden sm:inline">Join Server</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="text-slate-300">
            Institute of Technology of Cambodia (ITC) · International Engineering School
          </p>
          <p className="text-[11px] text-slate-400">
            Student-made portal for learning and documentation purposes · Not an official institution site
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
          <a
            href="https://discord.gg/QH3rwPbwRm"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300 transition-colors"
          >
            Community Discord
          </a>
          <span>·</span>
          <span>Phnom Penh, Cambodia</span>
        </div>
      </footer>

      {/* Class Monitor Authorization Modal with IPGEN1 / IPGEN2 / IPGEN3 */}
      {showMonitorAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-300">
                <Lock className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowMonitorAuthModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Access Restricted
                </span>
                <span className="text-xs text-slate-400">Class Monitor Portal</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Class Monitor Verification
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your designated monitor password to access administrative controls and make-up class booking.
              </p>
            </div>

            <form onSubmit={handleVerifyMonitor} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monitor Password
                </label>
                <input
                  type="password"
                  value={monitorPinInput}
                  onChange={(e) => {
                    setMonitorPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter monitor password"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-sky-400 font-mono tracking-wider"
                  autoFocus
                />
                {pinError && (
                  <p className="text-[11px] text-rose-400 mt-1">{pinError}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowMonitorAuthModal(false);
                    setShowClassSelectModal(true);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  I am a regular student
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMonitorAuthModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Authorize & Enter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Class Selection Modal (Per user request: ask user to select their class so they only see their schedule) */}
      {showClassSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowClassSelectModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 mb-1.5 inline-block">
                Under Development
              </span>
              <h3 className="text-base font-bold text-white">
                Select Your Class
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose your group to display only your personal class timetable. You can change it anytime inside your portal.
              </p>
            </div>

            {/* List of 7 Classes */}
            <div className="space-y-2 max-h-64 overflow-y-auto pt-1 pr-1">
              {SCHEDULE_DATA.groups.map((group) => {
                const isSelected = myCohort === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectClassAndEnter(group.id)}
                    className={`w-full p-2.5 rounded-md text-left text-xs transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 text-white font-bold'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="font-mono font-bold text-sm text-slate-100">{group.id}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowClassSelectModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Under Development Modal for Student Club */}
      {showClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-300">
                <Users className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowClubModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 mb-2">
                Under Development
              </span>
              <h3 className="text-base font-bold text-white">
                Student Club Portal
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                The Student Club portal is currently under active development. It will soon provide club registrations, executive committee contacts, event calendars, and workshop announcements for all engineering chapters.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowClubModal(false)}
                className="px-4 py-2 text-xs font-medium bg-white text-slate-900 rounded-md hover:bg-slate-100 transition-colors font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
