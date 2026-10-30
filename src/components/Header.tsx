import { useState, useRef, useEffect } from 'react';
import { 
  CalendarDays, 
  Users, 
  Building2, 
  Calendar, 
  ArrowLeft,
  Plus,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Bell,
  LogIn,
  GraduationCap,
  Award,
  CalendarPlus
} from 'lucide-react';
import { GroupSchedule } from '../data/scheduleData';
import { UserProfile } from '../lib/firebase';

export type NavMode = 'matrix' | 'lecturer' | 'room' | 'agenda' | 'makeup' | 'clubs';

interface HeaderProps {
  activeMode: NavMode;
  onSelectMode: (mode: NavMode) => void;
  onReturnHome?: () => void;
  onOpenFreeRooms?: () => void;
  onOpenBookingModal?: () => void;
  onOpenClubModal?: () => void;
  onChangeClass?: () => void;
  activeGroup?: GroupSchedule;
  portalRole?: 'student' | 'class-monitor';
  onTogglePortalRole?: () => void;
  isMonitorAuthorized?: boolean;
  userProfile?: UserProfile | null;
  unreadNotificationsCount?: number;
  activeMakeupCount?: number;
  onOpenInbox?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAdminDashboard?: () => void;
  onLogout?: () => void;
}

export function Header({
  activeMode,
  onSelectMode,
  onReturnHome,
  onOpenBookingModal,
  onOpenClubModal,
  onChangeClass,
  portalRole = 'student',
  onTogglePortalRole,
  isMonitorAuthorized = false,
  userProfile,
  unreadNotificationsCount = 0,
  activeMakeupCount = 0,
  onOpenInbox,
  onOpenAuthModal,
  onOpenAdminDashboard,
  onLogout
}: HeaderProps) {
  const isStudent = portalRole === 'student';
  const canToggleRole = Boolean(
    onTogglePortalRole &&
    (userProfile?.role === 'monitor' || userProfile?.role === 'admin' || isMonitorAuthorized)
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          
          {/* Left: Brand & Portal Back */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                title="Return to Main Portal"
                className="no-print p-1.5 sm:px-2.5 sm:py-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Home</span>
              </button>
            )}

            <div 
              onClick={onReturnHome} 
              className={`flex items-center gap-2 min-w-0 ${onReturnHome ? 'cursor-pointer group' : ''}`}
              title={onReturnHome ? "Go to Main Portal" : undefined}
            >
              <div className="w-8 h-8 rounded-lg bg-white/95 p-1 shadow-md border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/assets/cropped-itc_tight.png"
                  alt="ITC Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-slate-100 text-xs sm:text-sm lg:text-base tracking-tight group-hover:text-sky-400 transition-colors whitespace-nowrap truncate">
                  {isStudent ? 'Student Timetable' : 'Class Monitor'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    if (canToggleRole && onTogglePortalRole) {
                      e.stopPropagation();
                      onTogglePortalRole();
                    }
                  }}
                  title={canToggleRole ? `Click to switch to ${isStudent ? 'Class Monitor' : 'Student'} Portal` : undefined}
                  className={`hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                    isStudent
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  } ${canToggleRole ? 'cursor-pointer hover:scale-105 hover:border-sky-400' : ''}`}
                >
                  <span>{isStudent ? 'Student' : 'Monitor'}</span>
                  {canToggleRole && <span className="text-[9px] opacity-70">⇄</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Center: Clean Single-Line Nav Tabs (Visible on xl+ desktop screens where full width fits without wrapping) */}
          <nav className="no-print hidden xl:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => onSelectMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'matrix'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>Timetable</span>
            </button>

            <button
              onClick={() => onSelectMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'agenda'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Daily Agenda</span>
            </button>

            <button
              onClick={() => onSelectMode('makeup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'makeup'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <CalendarPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Make-up Classes</span>
              {activeMakeupCount > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {activeMakeupCount}
                </span>
              )}
            </button>

            {!isStudent && (
              <>
                <button
                  onClick={() => onSelectMode('room')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeMode === 'room'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Rooms</span>
                </button>

                <button
                  onClick={() => onSelectMode('lecturer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeMode === 'lecturer'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Lecturers</span>
                </button>
              </>
            )}

            {isStudent && onOpenClubModal && (
              <button
                onClick={onOpenClubModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeMode === 'clubs'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Clubs</span>
              </button>
            )}
          </nav>

          {/* Right: Actions & User Settings Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Class Monitor: Book Class button */}
            {!isStudent && onOpenBookingModal && (
              <button
                onClick={onOpenBookingModal}
                title="Book Room for Make-up Class"
                className="no-print flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/80 rounded-lg text-xs font-bold text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Book Class</span>
                <span className="sm:hidden">Book</span>
              </button>
            )}

            {/* Notification Bell */}
            {onOpenInbox && (
              <button
                onClick={onOpenInbox}
                title="Notification Inbox"
                className="no-print relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 rounded-lg text-sm transition-colors cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4 text-slate-200" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Pill with Settings Menu */}
            {userProfile ? (
              <div className="relative no-print shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
                  title="Account & Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left max-w-[95px] md:max-w-[125px] truncate font-semibold text-white text-xs">
                    {userProfile.displayName || userProfile.email.split('@')[0]}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Settings Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-sm">
                    
                    {/* User Info Header */}
                    <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-2">
                      <div className="font-bold text-white text-base truncate">
                        {userProfile.displayName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate">
                        {userProfile.email}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          userProfile.role === 'admin'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : userProfile.role === 'monitor'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {userProfile.role === 'admin' ? 'Bongthom' : userProfile.role}
                        </span>
                        {userProfile.year && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1 ${
                            userProfile.year === 'Alumni'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                          }`}>
                            {userProfile.year === 'Alumni' && <Award className="w-3 h-3 text-amber-400" />}
                            <span>{userProfile.year}</span>
                          </span>
                        )}
                        {userProfile.groupId && userProfile.year !== 'Alumni' && (
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-850 border border-slate-700 text-slate-200">
                            {userProfile.groupId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1">
                      {userProfile.role === 'admin' && onOpenAdminDashboard && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenAdminDashboard();
                          }}
                          className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-amber-300 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-sm"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          <span>Bongthom Dashboard</span>
                        </button>
                      )}

                      {onChangeClass && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onChangeClass();
                          }}
                          className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer text-sm font-medium"
                        >
                          <GraduationCap className="w-4 h-4 text-sky-400" />
                          <span>Academic Status & Promotion</span>
                        </button>
                      )}

                      {canToggleRole && onTogglePortalRole && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onTogglePortalRole();
                          }}
                          className="w-full px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-sky-300 font-semibold flex items-center justify-between transition-colors cursor-pointer text-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <Users className="w-4 h-4 text-sky-400" />
                            <span>{isStudent ? 'Switch to Class Monitor' : 'Switch to Student View'}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                            {isStudent ? 'Monitor' : 'Student'}
                          </span>
                        </button>
                      )}

                      {onLogout && (
                        <div className="pt-1 mt-1 border-t border-slate-800">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onLogout();
                            }}
                            className="w-full px-3 py-2 rounded-lg hover:bg-red-950/60 text-left text-red-300 hover:text-red-200 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-sm"
                          >
                            <LogOut className="w-4 h-4 text-red-400" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>

        </div>

        {/* Responsive Sub-Bar Navigation Tabs (Visible on < xl screens: mobile, tablet, compact laptops) */}
        <div className="no-print xl:hidden flex items-center gap-1.5 py-2 border-t border-slate-800/70 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
          <button
            onClick={() => onSelectMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeMode === 'matrix'
                ? 'text-sky-300 bg-sky-950/90 border border-sky-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => onSelectMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeMode === 'agenda'
                ? 'text-sky-300 bg-sky-950/90 border border-sky-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Daily Agenda</span>
          </button>

          <button
            onClick={() => onSelectMode('makeup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              activeMode === 'makeup'
                ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <CalendarPlus className="w-3.5 h-3.5 shrink-0" />
            <span>Make-up Classes</span>
            {activeMakeupCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {activeMakeupCount}
              </span>
            )}
          </button>

          {!isStudent && (
            <>
              <button
                onClick={() => onSelectMode('room')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeMode === 'room'
                    ? 'text-sky-300 bg-sky-950/90 border border-sky-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Rooms</span>
              </button>

              <button
                onClick={() => onSelectMode('lecturer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeMode === 'lecturer'
                    ? 'text-sky-300 bg-sky-950/90 border border-sky-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Lecturers</span>
              </button>
            </>
          )}

          {isStudent && onOpenClubModal && (
            <button
              onClick={onOpenClubModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeMode === 'clubs'
                  ? 'text-sky-300 bg-sky-950/90 border border-sky-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Clubs</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
