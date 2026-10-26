import { useState } from 'react';
import TechText from './TechText';
import DotGrid from './DotGrid';
import MetallicPaint from './MetallicPaint';
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
  Check,
  Bell,
  LogIn,
  LogOut,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { getCambodiaTime, SCHEDULE_DATA } from '../data/scheduleData';
import { UserProfile } from '../lib/firebase';

interface LandingPortalProps {
  onEnterClassMonitor: (genPassword?: string) => void;
  onEnterStudentSchedule: (groupId: string) => void;
  onOpenFreeRooms: () => void;
  myCohort: string;
  onSelectMyCohort: (groupId: string) => void;
  isMonitorAuthorized: boolean;
  onAuthorizeMonitor: (genPassword: string) => void;
  userProfile?: UserProfile | null;
  unreadNotificationsCount?: number;
  onOpenAuthModal: () => void;
  onOpenInbox: () => void;
  onOpenAdminDashboard?: () => void;
  onLogout: () => void;
  onUpgradeToMonitor?: (password: string) => Promise<boolean>;
  onOpenAcademicStatus?: () => void;
  onOpenReleaseNotes: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function LandingPortal({
  onEnterClassMonitor,
  onEnterStudentSchedule,
  onOpenFreeRooms,
  myCohort,
  onSelectMyCohort,
  isMonitorAuthorized,
  onAuthorizeMonitor,
  userProfile,
  unreadNotificationsCount = 0,
  onOpenAuthModal,
  onOpenInbox,
  onOpenAdminDashboard,
  onLogout,
  onUpgradeToMonitor,
  onOpenAcademicStatus,
  onOpenReleaseNotes,
  onOpenPrivacy,
  onOpenTerms
}: LandingPortalProps) {
  const [showClubModal, setShowClubModal] = useState(false);
  const [showMonitorAuthModal, setShowMonitorAuthModal] = useState(false);
  const [showClassSelectModal, setShowClassSelectModal] = useState(false);
  const [showRestrictedNotice, setShowRestrictedNotice] = useState(false);
  const [monitorPinInput, setMonitorPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const cambodiaTime = getCambodiaTime();

  // Strict user specification: All letters are pure white except PORTAL which is blue
  const letterColor = '#ffffff';
  const portalBlueColor = '#38bdf8';
  const accentHighlight = '#38bdf8';

  const isMonitorOrAdmin = userProfile?.role === 'monitor' || userProfile?.role === 'admin' || isMonitorAuthorized;

  const handleClassMonitorClick = () => {
    if (isMonitorOrAdmin) {
      onEnterClassMonitor();
      return;
    }

    // If user is not logged in, prompt to log in / register
    if (!userProfile) {
      onOpenAuthModal();
      return;
    }

    // If logged in as student, show the monitor verification modal with "Bigboss@67"
    setPinError('');
    setMonitorPinInput('');
    setShowMonitorAuthModal(true);
  };

  const handleVerifyMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = monitorPinInput.trim();
    
    // Strict password requirement: "Bigboss@67"
    if (clean === 'Bigboss@67') {
      if (onUpgradeToMonitor) {
        await onUpgradeToMonitor(clean);
      }
      onAuthorizeMonitor(clean);
      setShowMonitorAuthModal(false);
      onEnterClassMonitor(clean);
    } else {
      setPinError('Invalid password. Class Monitor password is required.');
    }
  };

  const hasSavedClass = () => {
    try {
      return (
        Boolean(userProfile?.groupId) ||
        (localStorage.getItem('itc_student_class_picked') === 'true' && Boolean(localStorage.getItem('itc_my_cohort')))
      );
    } catch {
      return false;
    }
  };

  const targetGroup = userProfile?.groupId || myCohort;

  const handleStudentPortalClick = () => {
    // Strictly require an account to access student timetable
    if (!userProfile) {
      onOpenAuthModal();
      return;
    }
    if (hasSavedClass()) {
      onEnterStudentSchedule(targetGroup);
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
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-xs">
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Inbox Bell */}
          <button
            onClick={onOpenInbox}
            title="Account Inbox & Announcements"
            className="relative p-2 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Account / Sign In Pill */}
          {userProfile ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onOpenAcademicStatus}
                title="Click to view academic status & year promotion"
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 rounded-lg text-xs cursor-pointer transition-all"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  userProfile.year === 'Alumni'
                    ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                    : 'bg-sky-500/20 border border-sky-400/40 text-sky-300'
                }`}>
                  {userProfile.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-white truncate max-w-[120px] text-[11px]">
                    {userProfile.displayName}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider">
                    {userProfile.role === 'admin' ? (
                      <span className="text-amber-400">Admin</span>
                    ) : userProfile.year === 'Alumni' ? (
                      <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
                        Alumni · Graduate
                      </span>
                    ) : userProfile.role === 'monitor' ? (
                      <span className="text-sky-400">Monitor ({userProfile.year || userProfile.groupId})</span>
                    ) : (
                      <span className="text-slate-400">
                        {userProfile.year ? `${userProfile.year} (${userProfile.groupId})` : userProfile.groupId}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Bongthom Dashboard shortcut button if admin */}
              {userProfile.role === 'admin' && onOpenAdminDashboard && (
                <button
                  onClick={onOpenAdminDashboard}
                  title="Open Bongthom Dashboard"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Bongthom</span>
                </button>
              )}

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Cambodia Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-md text-xs text-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono tabular-nums font-semibold text-white">{cambodiaTime.timeString}</span>
            <span className="text-slate-400">Phnom Penh</span>
          </div>
        </div>
      </nav>

      {/* Hero Body */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Interactive Metallic ITC Emblem Animation */}
        <div className="mb-2 sm:mb-3 inline-flex items-center justify-center transition-transform duration-200 hover:scale-105">
          <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 relative rounded-full overflow-hidden bg-slate-950/80 border border-slate-750 shadow-[0_12px_28px_rgba(0,0,0,0.7)] flex items-center justify-center">
            <MetallicPaint
              imageSrc="/assets/cropped-itc_tight.png"
              color="#f8fafc"
              edgeBend={0.82}
              softness={0.16}
              distortion={0.07}
              speed={1.0}
              mouseTilt={0.7}
              scale={0.8}
              className="w-full h-full"
            />
          </div>
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

        {/* 3 Primary Pathways */}
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
                {!userProfile ? 'Sign In Required' : isMonitorOrAdmin ? 'Enter Monitor Portal' : 'Enter as Monitor'}
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

          {/* Card 3: Student Portal */}
          <div 
            onClick={handleStudentPortalClick}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-sky-900/70 hover:border-sky-400/80 rounded-lg p-5 shadow-lg transition-all duration-200 flex flex-col justify-between backdrop-blur-xs ring-1 ring-sky-500/20"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-md bg-sky-500 text-slate-950 flex items-center justify-center shadow-xs font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-300 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded">
                  Personal Timetable
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
                {!userProfile ? 'Sign In to Access' : `Enter (${targetGroup})`}
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
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-3 text-[11px] text-slate-400 shrink-0">
          <button
            onClick={onOpenReleaseNotes}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Release Notes
          </button>
          <span>·</span>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>·</span>
          <button
            onClick={onOpenTerms}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <span>·</span>
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

      {/* Class Monitor Authorization Modal (Password: Bigboss@67) */}
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
                  Password Required
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Class Monitor Password
              </h3>
            </div>

            <form onSubmit={handleVerifyMonitor} className="space-y-3 pt-1">
              <div>
                <input
                  type="password"
                  value={monitorPinInput}
                  onChange={(e) => {
                    setMonitorPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter monitor password"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-mono tracking-wider"
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
                  Student Portal
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
                    className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Class Selection Modal */}
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
              <h3 className="text-base font-bold text-white">
                Choose Class / Major
              </h3>
            </div>

            {/* List of 12 Classes */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pt-1 pr-1">
              {SCHEDULE_DATA.groups.map((group) => {
                const isSelected = targetGroup === group.id;

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

      {/* Student Club Modal */}
      {showClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
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
              <h3 className="text-base font-bold text-white">
                Student Club
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Coming soon.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowClubModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
