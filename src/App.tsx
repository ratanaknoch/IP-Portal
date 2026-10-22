import { useState, useEffect } from 'react';
import { LandingPortal } from './components/LandingPortal';
import { Header } from './components/Header';
import { QuickStats } from './components/QuickStats';
import { TimetableMatrix } from './components/TimetableMatrix';
import { LecturerView } from './components/LecturerView';
import { RoomView } from './components/RoomView';
import { DailyAgenda } from './components/DailyAgenda';
import { ClubsView } from './components/ClubsView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { FreeStudyRoomModal } from './components/FreeStudyRoomModal';
import { MakeupClassBookingModal, MakeupClassBooking } from './components/MakeupClassBookingModal';
import { 
  subscribeToMakeupBookings, 
  saveMakeupBooking, 
  deleteMakeupBooking, 
  testFirestoreConnection 
} from './lib/firebase';
import { ScheduleSession, ALL_SESSIONS, SCHEDULE_DATA } from './data/scheduleData';
import { Search, X, GraduationCap, Check, Users } from 'lucide-react';

export default function App() {
  // Enforce consistent academic dark mode throughout the application
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Top level views: 'landing' or 'schedule'
  const [currentView, setCurrentView] = useState<'landing' | 'schedule'>('landing');
  const [portalRole, setPortalRole] = useState<'student' | 'class-monitor'>('student');
  const [activeMonitorGen, setActiveMonitorGen] = useState<string>('IPGEN1');

  // Monitor authorization state (persisted in sessionStorage)
  const [isMonitorAuthorized, setIsMonitorAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('itc_monitor_authorized') === 'true';
    } catch {
      return false;
    }
  });

  const handleAuthorizeMonitor = (genPassword: string) => {
    setIsMonitorAuthorized(true);
    setActiveMonitorGen(genPassword);
    try {
      sessionStorage.setItem('itc_monitor_authorized', 'true');
      sessionStorage.setItem('itc_monitor_gen', genPassword);
    } catch {
      // ignore
    }
  };

  // "My Cohort / Class" persistence in localStorage
  const [myCohort, setMyCohort] = useState<string>(() => {
    try {
      return localStorage.getItem('itc_my_cohort') || 'I2-SE';
    } catch {
      return 'I2-SE';
    }
  });

  const handleSetMyCohort = (groupId: string) => {
    setMyCohort(groupId);
    setSelectedGroup(groupId);
    const targetGroup = SCHEDULE_DATA.groups.find(g => g.id === groupId);
    if (targetGroup) {
      setSelectedCohort(targetGroup.cohort);
    }
    try {
      localStorage.setItem('itc_my_cohort', groupId);
    } catch {
      // ignore
    }
  };

  // Booked Make-up Sessions state (synced with Firestore + localStorage cache)
  const [makeupBookings, setMakeupBookings] = useState<MakeupClassBooking[]>(() => {
    try {
      const stored = localStorage.getItem('itc_makeup_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Subscribe to real-time updates from Firebase Firestore across all devices
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = subscribeToMakeupBookings((remoteBookings) => {
      setMakeupBookings(remoteBookings);
      try {
        localStorage.setItem('itc_makeup_bookings', JSON.stringify(remoteBookings));
      } catch {
        // ignore
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSaveMakeupBooking = async (booking: MakeupClassBooking) => {
    // Optimistic local update
    setMakeupBookings(prev => {
      const updated = [booking, ...prev.filter(b => b.id !== booking.id)];
      try {
        localStorage.setItem('itc_makeup_bookings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Sync to cloud Firestore
    try {
      await saveMakeupBooking(booking);
    } catch (err) {
      console.warn('Booking saved in local cache, cloud sync deferred:', err);
    }
  };

  const handleDeleteMakeupBooking = async (id: string) => {
    // Optimistic local update
    setMakeupBookings(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('itc_makeup_bookings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Delete from cloud Firestore
    try {
      await deleteMakeupBooking(id);
    } catch (err) {
      console.warn('Booking removed locally, cloud sync deferred:', err);
    }
  };

  const [activeMode, setActiveMode] = useState<'matrix' | 'lecturer' | 'room' | 'agenda' | 'clubs'>('matrix');
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>(myCohort);
  const [selectedLecturer, setSelectedLecturer] = useState<string>('Mr. PICH Reatrey');
  const [selectedRoom, setSelectedRoom] = useState<string>('Room A-109');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalSession, setActiveModalSession] = useState<ScheduleSession | null>(null);

  // Modals state
  const [isFreeRoomsOpen, setIsFreeRoomsOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [showClassChangeModal, setShowClassChangeModal] = useState<boolean>(false);
  const [showClubModal, setShowClubModal] = useState<boolean>(false);

  // Compute search match count across all sessions
  const searchMatchCount = searchQuery.trim()
    ? ALL_SESSIONS.filter(s => {
        const q = searchQuery.toLowerCase();
        return (
          s.course.toLowerCase().includes(q) ||
          s.lecturer.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          (s.groupId && s.groupId.toLowerCase().includes(q))
        );
      }).length
    : 0;

  // Active group object
  const activeGroupObj = SCHEDULE_DATA.groups.find(g => g.id === selectedGroup) || SCHEDULE_DATA.groups[0];

  // Handler to enter Student Portal directly into the timetable
  const handleEnterStudentSchedule = (targetGroupId?: string) => {
    const groupToSelect = targetGroupId || myCohort;
    setSelectedGroup(groupToSelect);
    const grp = SCHEDULE_DATA.groups.find(g => g.id === groupToSelect);
    if (grp) setSelectedCohort(grp.cohort);
    setPortalRole('student');
    setActiveMode('matrix');
    setCurrentView('schedule');
  };

  // Handler to enter Class Monitor Portal
  const handleEnterClassMonitor = (genPassword?: string) => {
    if (genPassword) setActiveMonitorGen(genPassword);
    setPortalRole('class-monitor');
    setActiveMode('matrix');
    setCurrentView('schedule');
  };

  // Front Page Landing View
  if (currentView === 'landing') {
    return (
      <>
        <LandingPortal
          onEnterClassMonitor={handleEnterClassMonitor}
          onEnterStudentSchedule={handleEnterStudentSchedule}
          onOpenFreeRooms={() => setIsFreeRoomsOpen(true)}
          myCohort={myCohort}
          onSelectMyCohort={handleSetMyCohort}
          isMonitorAuthorized={isMonitorAuthorized}
          onAuthorizeMonitor={handleAuthorizeMonitor}
        />

        {/* Free Study Room Modal accessible directly from Landing */}
        <FreeStudyRoomModal
          isOpen={isFreeRoomsOpen}
          onClose={() => setIsFreeRoomsOpen(false)}
          onSelectRoom={(roomName) => {
            setSelectedRoom(roomName);
            setActiveMode('room');
            setCurrentView('schedule');
          }}
          makeupBookings={makeupBookings}
        />
      </>
    );
  }

  // Active Schedule & Matrix Portal View (Student or Class Monitor)
  const isStudent = portalRole === 'student';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar with School Logo and Return to Portal Home button */}
      <Header
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        onReturnHome={() => setCurrentView('landing')}
        onOpenFreeRooms={() => setIsFreeRoomsOpen(true)}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
        onOpenClubModal={() => setShowClubModal(true)}
        onChangeClass={() => setShowClassChangeModal(true)}
        activeGroup={activeGroupObj}
        portalRole={portalRole}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Authentic Academic Quick Stats */}
        <QuickStats />

        {/* Global Instant Search Bar (Only shown in Matrix/Lecturer/Room/Agenda) */}
        {activeMode !== 'clubs' && (
          <div className="no-print mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, instructors (e.g. Dr. KUY Movsun), rooms (e.g. A-420), or cohorts..."
                className="w-full text-xs sm:text-sm pl-10 pr-24 py-2.5 bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-100 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-[11px] font-mono tabular-nums text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {searchMatchCount} match{searchMatchCount !== 1 ? 'es' : ''}
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active View Router */}
        {activeMode === 'matrix' && (
          <TimetableMatrix
            searchQuery={searchQuery}
            onSelectSession={setActiveModalSession}
            selectedCohort={selectedCohort}
            onSelectCohort={setSelectedCohort}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            myCohort={myCohort}
            onSetMyCohort={handleSetMyCohort}
            isStudentMode={isStudent}
            onChangeClass={() => setShowClassChangeModal(true)}
            onOpenFreeRooms={() => setIsFreeRoomsOpen(true)}
            makeupBookings={makeupBookings}
          />
        )}

        {!isStudent && activeMode === 'lecturer' && (
          <LecturerView
            selectedLecturer={selectedLecturer}
            onSelectLecturer={setSelectedLecturer}
            onSelectSession={setActiveModalSession}
          />
        )}

        {!isStudent && activeMode === 'room' && (
          <RoomView
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            onSelectSession={setActiveModalSession}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            makeupBookings={makeupBookings}
          />
        )}

        {activeMode === 'agenda' && (
          <DailyAgenda
            onSelectSession={setActiveModalSession}
            searchQuery={searchQuery}
            isStudentMode={isStudent}
            activeGroupId={selectedGroup}
            makeupBookings={makeupBookings}
          />
        )}

        {/* Clubs Page View inside Student Portal */}
        {activeMode === 'clubs' && (
          <ClubsView />
        )}

      </main>

      {/* Free Study Room Right Now Modal */}
      <FreeStudyRoomModal
        isOpen={isFreeRoomsOpen}
        onClose={() => setIsFreeRoomsOpen(false)}
        onSelectRoom={(roomName) => {
          setSelectedRoom(roomName);
          if (!isStudent) {
            setActiveMode('room');
          }
        }}
        makeupBookings={makeupBookings}
      />

      {/* Make-up Class Room Booking Modal */}
      <MakeupClassBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSaveBooking={handleSaveMakeupBooking}
        onDeleteBooking={handleDeleteMakeupBooking}
        activeMonitorGen={activeMonitorGen}
        existingBookings={makeupBookings}
      />

      {/* Student Change Class Modal (if miss-clicked) */}
      {showClassChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-md bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowClassChangeModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Change Your Class
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your class to switch your personalized schedule.
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pt-1 pr-1">
              {SCHEDULE_DATA.groups.map((group) => {
                const isSelected = selectedGroup === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      handleSetMyCohort(group.id);
                      setShowClassChangeModal(false);
                    }}
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
                onClick={() => setShowClassChangeModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Club Under Development Modal */}
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
                The Student Club feature is currently under active development. It will feature club announcements, tech community workshops, hackathons, and event schedules for international engineering students.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowClubModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-md transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      <SessionDetailModal
        session={activeModalSession}
        onClose={() => setActiveModalSession(null)}
        onSelectLecturer={(lecturer) => {
          if (!isStudent) {
            setSelectedLecturer(lecturer);
            setActiveMode('lecturer');
          }
        }}
        onSelectRoom={(room) => {
          if (!isStudent) {
            setSelectedRoom(room);
            setActiveMode('room');
          }
        }}
      />

      {/* Institutional Academic Footer */}
      <footer className="no-print mt-auto border-t border-slate-800 bg-slate-900 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="font-semibold text-slate-300">
              Institute of Technology of Cambodia (ITC) · International Engineering School
            </p>
            <p className="text-[11px] text-slate-400">
              Disclaimer: This is not an official website from the school, but a student-made project for learning and documentation purposes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://discord.gg/QH3rwPbwRm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Community Discord
            </a>
            <span>·</span>
            <a
              href="https://moodle.ccun.edu.kh/login/index.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Moodle
            </a>
            <span>·</span>
            <span>Academic Year 2026–2027</span>
            <span>·</span>
            <span className="font-mono">Timezone: UTC+7</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
