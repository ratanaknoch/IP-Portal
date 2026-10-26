import { useState, useEffect, useCallback } from 'react';
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
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { NotificationInboxModal } from './components/NotificationInboxModal';
import { AcademicStatusModal } from './components/AcademicStatusModal';
import { FirstVisitLoader } from './components/FirstVisitLoader';
import { LogoutOverlay } from './components/LogoutOverlay';
import { ReleaseNotesView } from './components/ReleaseNotesView';
import { 
  subscribeToMakeupBookings, 
  saveMakeupBooking, 
  deleteMakeupBooking, 
  testFirestoreConnection,
  auth,
  getUserProfile,
  saveUserProfile,
  logoutUser,
  subscribeToNotifications,
  UserProfile,
  AppNotification
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ScheduleSession, ALL_SESSIONS, SCHEDULE_DATA } from './data/scheduleData';
import { Search, X, GraduationCap, Check, Users } from 'lucide-react';

export default function App() {
  // Enforce consistent academic dark mode throughout the application
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // First Visit loading animation (React Bits MetaBalls)
  const [showFirstVisitLoader, setShowFirstVisitLoader] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('itc_first_visit_shown') !== 'true';
    } catch {
      return false;
    }
  });

  const handleCompleteFirstVisit = () => {
    setShowFirstVisitLoader(false);
    try {
      sessionStorage.setItem('itc_first_visit_shown', 'true');
    } catch {
      // ignore
    }
  };

  // Top level views: 'landing' | 'schedule' | 'release-notes'
  const [currentView, setCurrentView] = useState<'landing' | 'schedule' | 'release-notes'>('landing');
  const [portalRole, setPortalRole] = useState<'student' | 'class-monitor'>('student');
  const [activeMonitorGen, setActiveMonitorGen] = useState<string>('Bigboss@67');

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

  // User Profile & Firebase Auth state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const adminStored = localStorage.getItem('itc_admin_auth');
      if (adminStored) {
        return JSON.parse(adminStored);
      }
      const userStored = localStorage.getItem('itc_user_profile');
      if (userStored) {
        return JSON.parse(userStored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null>(null);

  // Modals for Auth / Onboarding / Admin / Notifications Inbox
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Notifications collection
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // "My Cohort / Class" persistence in localStorage
  const [myCohort, setMyCohort] = useState<string>(() => {
    try {
      return localStorage.getItem('itc_my_cohort') || 'I2-SE';
    } catch {
      return 'I2-SE';
    }
  });

  // Active view router modes
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

  // Helper: Synchronize browser URL bar (pushState)
  const navigateTo = useCallback((path: string, replace = false) => {
    try {
      const currentFull = window.location.pathname + window.location.search;
      if (currentFull !== path) {
        if (replace) {
          window.history.replaceState(null, '', path);
        } else {
          window.history.pushState(null, '', path);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Helper: Parse URL on mount and popstate
  const applyRoute = useCallback((pathname: string, search: string) => {
    const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';
    const params = new URLSearchParams(search);
    const grpParam = params.get('group');
    const cohortParam = params.get('cohort');

    if (grpParam) {
      setSelectedGroup(grpParam);
      const matchedG = SCHEDULE_DATA.groups.find(g => g.id === grpParam);
      if (matchedG) setSelectedCohort(matchedG.cohort);
    } else if (cohortParam) {
      setSelectedCohort(cohortParam);
    }

    if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/landing') {
      setCurrentView('landing');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
      setIsAuthModalOpen(false);
    } else if (cleanPath === '/schedule') {
      setCurrentView('schedule');
      setActiveMode('matrix');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
    } else if (cleanPath === '/rooms' || cleanPath === '/room') {
      setCurrentView('schedule');
      setActiveMode('room');
      setPortalRole('class-monitor');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
    } else if (cleanPath === '/lecturers' || cleanPath === '/lecturer') {
      setCurrentView('schedule');
      setActiveMode('lecturer');
      setPortalRole('class-monitor');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
    } else if (cleanPath === '/agenda' || cleanPath === '/daily') {
      setCurrentView('schedule');
      setActiveMode('agenda');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
    } else if (cleanPath === '/clubs' || cleanPath === '/club') {
      setCurrentView('schedule');
      setActiveMode('clubs');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
    } else if (cleanPath === '/free-rooms') {
      setIsFreeRoomsOpen(true);
    } else if (cleanPath === '/booking' || cleanPath === '/makeup') {
      setIsBookingModalOpen(true);
      setCurrentView('schedule');
    } else if (cleanPath === '/login' || cleanPath === '/auth') {
      setIsAuthModalOpen(true);
    } else if (cleanPath === '/release-notes' || cleanPath === '/changelog') {
      setCurrentView('release-notes');
      setIsFreeRoomsOpen(false);
      setIsBookingModalOpen(false);
      setIsAuthModalOpen(false);
    }
  }, []);

  // Listen to popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      applyRoute(window.location.pathname, window.location.search);
    };

    applyRoute(window.location.pathname, window.location.search);

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyRoute]);

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
    if (currentView === 'schedule') {
      navigateTo(`/schedule?group=${groupId}`);
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
    const unsubscribeBookings = subscribeToMakeupBookings((remoteBookings) => {
      setMakeupBookings(remoteBookings);
      try {
        localStorage.setItem('itc_makeup_bookings', JSON.stringify(remoteBookings));
      } catch {
        // ignore
      }
    });

    return () => {
      unsubscribeBookings();
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      const adminStored = localStorage.getItem('itc_admin_auth');
      if (adminStored) {
        try {
          const parsedAdmin = JSON.parse(adminStored);
          setUserProfile(parsedAdmin);
          setIsMonitorAuthorized(true);
          setIsOnboardingModalOpen(false);
          setPendingFirebaseUser(null);
          return;
        } catch {
          // ignore
        }
      }

      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile && (profile.onboardingCompleted || profile.groupId)) {
            setUserProfile(profile);
            localStorage.setItem('itc_user_profile', JSON.stringify(profile));
            setIsOnboardingModalOpen(false);
            setPendingFirebaseUser(null);
            if (profile.groupId) {
              setMyCohort(profile.groupId);
              setSelectedGroup(profile.groupId);
              const grp = SCHEDULE_DATA.groups.find(g => g.id === profile.groupId);
              if (grp) setSelectedCohort(grp.cohort);
            }
            if (profile.role === 'monitor' || profile.role === 'admin') {
              setIsMonitorAuthorized(true);
              sessionStorage.setItem('itc_monitor_authorized', 'true');
            }
          } else {
            // Check local cache before assuming new user
            const cached = localStorage.getItem('itc_user_profile');
            let hasValidCache = false;
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (parsed && (parsed.uid === fbUser.uid || parsed.email === fbUser.email) && (parsed.onboardingCompleted || parsed.groupId)) {
                  const restored = { ...parsed, uid: fbUser.uid };
                  setUserProfile(restored);
                  setIsOnboardingModalOpen(false);
                  setPendingFirebaseUser(null);
                  hasValidCache = true;
                  saveUserProfile(restored).catch(() => {});
                }
              } catch {
                // ignore
              }
            }

            if (!hasValidCache) {
              setPendingFirebaseUser({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName
              });
              setIsOnboardingModalOpen(true);
            }
          }
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Subscribe to Notifications in real-time
  useEffect(() => {
    const currentRole = userProfile?.role || 'student';
    const unsubscribeNotes = subscribeToNotifications(currentRole, (items) => {
      setNotifications(items);
    });

    return () => {
      unsubscribeNotes();
    };
  }, [userProfile?.role]);

  // Compute unread notification count
  const unreadNotificationsCount = notifications.filter(
    n => !n.readBy || !n.readBy.includes(userProfile?.uid || 'guest')
  ).length;

  const handleSaveMakeupBooking = async (booking: MakeupClassBooking) => {
    setMakeupBookings(prev => {
      const updated = [booking, ...prev.filter(b => b.id !== booking.id)];
      try {
        localStorage.setItem('itc_makeup_bookings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    try {
      await saveMakeupBooking(booking, userProfile);
    } catch (err) {
      console.warn('Booking saved in local cache, cloud sync deferred:', err);
    }
  };

  const handleDeleteMakeupBooking = async (id: string) => {
    setMakeupBookings(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('itc_makeup_bookings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    try {
      await deleteMakeupBooking(id);
    } catch (err) {
      console.warn('Booking removed locally, cloud sync deferred:', err);
    }
  };

  // Auth & Profile actions: triggers LogoutOverlay animation with MetallicPaint
  const handleTriggerLogout = () => {
    setIsLoggingOut(true);
  };

  const handleFinishLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    localStorage.removeItem('itc_admin_auth');
    localStorage.removeItem('itc_user_profile');
    sessionStorage.removeItem('itc_monitor_authorized');
    sessionStorage.removeItem('itc_monitor_gen');
    setUserProfile(null);
    setIsMonitorAuthorized(false);
    setIsLoggingOut(false);
    setCurrentView('landing');
    navigateTo('/', true);
  };

  const handleAdminLoginSuccess = async (adminProfile: UserProfile) => {
    setUserProfile(adminProfile);
    setIsMonitorAuthorized(true);
    localStorage.setItem('itc_admin_auth', JSON.stringify(adminProfile));
    sessionStorage.setItem('itc_monitor_authorized', 'true');
    setIsAuthModalOpen(false);
    setIsAdminDashboardOpen(true);
    try {
      await saveUserProfile(adminProfile);
    } catch {
      // ignore
    }
    navigateTo(currentView === 'landing' ? '/' : '/schedule');
  };

  const handleGoogleLoginSuccess = (profile: UserProfile | null, isNewUser: boolean) => {
    setIsAuthModalOpen(false);
    // If profile already exists or is loaded in state/cache, proceed directly without onboarding
    const effectiveProfile = profile || userProfile;
    if (effectiveProfile && (effectiveProfile.onboardingCompleted || effectiveProfile.groupId)) {
      setUserProfile(effectiveProfile);
      localStorage.setItem('itc_user_profile', JSON.stringify(effectiveProfile));
      setIsOnboardingModalOpen(false);
      setPendingFirebaseUser(null);
      if (effectiveProfile.groupId) {
        handleSetMyCohort(effectiveProfile.groupId);
      }
      if (effectiveProfile.role === 'monitor' || effectiveProfile.role === 'admin') {
        setIsMonitorAuthorized(true);
        sessionStorage.setItem('itc_monitor_authorized', 'true');
      }
      navigateTo(currentView === 'landing' ? '/' : '/schedule');
      return;
    }

    if (isNewUser || !profile) {
      if (auth.currentUser) {
        setPendingFirebaseUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName
        });
      }
      setIsOnboardingModalOpen(true);
    } else {
      setUserProfile(profile);
      localStorage.setItem('itc_user_profile', JSON.stringify(profile));
      setIsOnboardingModalOpen(false);
      setPendingFirebaseUser(null);
      if (profile.groupId) {
        handleSetMyCohort(profile.groupId);
      }
      if (profile.role === 'monitor' || profile.role === 'admin') {
        setIsMonitorAuthorized(true);
        sessionStorage.setItem('itc_monitor_authorized', 'true');
      }
      navigateTo(currentView === 'landing' ? '/' : '/schedule');
    }
  };

  const handleCompleteOnboarding = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('itc_user_profile', JSON.stringify(profile));
    if (profile.groupId) {
      handleSetMyCohort(profile.groupId);
    }
    if (profile.role === 'monitor' || profile.role === 'admin') {
      setIsMonitorAuthorized(true);
      sessionStorage.setItem('itc_monitor_authorized', 'true');
      setActiveMonitorGen('Bigboss@67');
    }
    setIsOnboardingModalOpen(false);
    setPendingFirebaseUser(null);
    handleEnterStudentSchedule(profile.groupId);
  };

  const handleUpgradeToMonitor = async (password: string): Promise<boolean> => {
    if (password === 'Bigboss@67' && userProfile) {
      const updated: UserProfile = { ...userProfile, role: 'monitor' };
      setUserProfile(updated);
      await saveUserProfile(updated);
      localStorage.setItem('itc_user_profile', JSON.stringify(updated));
      setIsMonitorAuthorized(true);
      sessionStorage.setItem('itc_monitor_authorized', 'true');
      return true;
    }
    return false;
  };

  const handleUpdateAcademicStatus = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('itc_user_profile', JSON.stringify(updatedProfile));
    if (updatedProfile.groupId) {
      handleSetMyCohort(updatedProfile.groupId);
    }
    setShowClassChangeModal(false);
  };

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

  // Auth Guard
  useEffect(() => {
    if (!userProfile && currentView === 'schedule') {
      setCurrentView('landing');
      setIsAuthModalOpen(true);
      navigateTo('/login');
    }
  }, [userProfile, currentView, navigateTo]);

  // Handler to enter Student Portal directly into the timetable
  const handleEnterStudentSchedule = (targetGroupId?: string) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      navigateTo('/login');
      return;
    }
    const groupToSelect = targetGroupId || myCohort;
    setSelectedGroup(groupToSelect);
    const grp = SCHEDULE_DATA.groups.find(g => g.id === groupToSelect);
    if (grp) setSelectedCohort(grp.cohort);
    setPortalRole('student');
    setActiveMode('matrix');
    setCurrentView('schedule');
    navigateTo(`/schedule?group=${groupToSelect}`);
  };

  // Handler to enter Class Monitor Portal
  const handleEnterClassMonitor = (genPassword?: string) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      navigateTo('/login');
      return;
    }
    if (genPassword) setActiveMonitorGen(genPassword);
    setPortalRole('class-monitor');
    setActiveMode('matrix');
    setCurrentView('schedule');
    navigateTo(`/schedule?group=${selectedGroup}`);
  };

  // Handler to open free study rooms
  const handleOpenFreeRooms = () => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      navigateTo('/login');
      return;
    }
    setIsFreeRoomsOpen(true);
    navigateTo('/free-rooms');
  };

  // Nav Mode Selector with URL sync
  const handleSelectNavMode = (mode: 'matrix' | 'lecturer' | 'room' | 'agenda' | 'clubs') => {
    setActiveMode(mode);
    setCurrentView('schedule');
    if (mode === 'matrix') {
      navigateTo(`/schedule?group=${selectedGroup}`);
    } else if (mode === 'room') {
      navigateTo('/rooms');
    } else if (mode === 'lecturer') {
      navigateTo('/lecturers');
    } else if (mode === 'agenda') {
      navigateTo(`/agenda?group=${selectedGroup}`);
    } else if (mode === 'clubs') {
      navigateTo('/clubs');
    }
  };

  const handleReturnHome = () => {
    setCurrentView('landing');
    navigateTo('/');
  };

  // Front Page Landing View
  if (currentView === 'landing') {
    return (
      <>
        {/* First Visit Loader Animation (React Bits MetaBalls) */}
        {showFirstVisitLoader && (
          <FirstVisitLoader onComplete={handleCompleteFirstVisit} />
        )}

        {/* Logout Animation Overlay (React Bits MetallicPaint) */}
        <LogoutOverlay
          isOpen={isLoggingOut}
          userName={userProfile?.displayName || userProfile?.email?.split('@')[0]}
          onFinished={handleFinishLogout}
        />

        <LandingPortal
          onEnterClassMonitor={handleEnterClassMonitor}
          onEnterStudentSchedule={handleEnterStudentSchedule}
          onOpenFreeRooms={handleOpenFreeRooms}
          myCohort={myCohort}
          onSelectMyCohort={handleSetMyCohort}
          isMonitorAuthorized={isMonitorAuthorized}
          onAuthorizeMonitor={handleAuthorizeMonitor}
          userProfile={userProfile}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenAuthModal={() => {
            setIsAuthModalOpen(true);
            navigateTo('/login');
          }}
          onOpenInbox={() => setIsInboxOpen(true)}
          onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          onLogout={handleTriggerLogout}
          onUpgradeToMonitor={handleUpgradeToMonitor}
          onOpenAcademicStatus={() => {
            if (!userProfile) {
              setIsAuthModalOpen(true);
              navigateTo('/login');
            } else {
              setShowClassChangeModal(true);
            }
          }}
          onOpenReleaseNotes={() => {
            setCurrentView('release-notes');
            navigateTo('/release-notes');
          }}
        />

        {/* Free Study Room Modal accessible directly from Landing */}
        <FreeStudyRoomModal
          isOpen={isFreeRoomsOpen}
          onClose={() => {
            setIsFreeRoomsOpen(false);
            navigateTo('/');
          }}
          onSelectRoom={(roomName) => {
            setSelectedRoom(roomName);
            setActiveMode('room');
            setCurrentView('schedule');
            navigateTo('/rooms');
          }}
          makeupBookings={makeupBookings}
        />

        {/* Auth Modal with MetallicPaint */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            navigateTo('/');
          }}
          onLoginSuccess={handleGoogleLoginSuccess}
          onAdminLoginSuccess={handleAdminLoginSuccess}
        />

        {/* Onboarding Modal for first-time sign-ups */}
        {pendingFirebaseUser && !userProfile?.onboardingCompleted && (
          <OnboardingModal
            isOpen={isOnboardingModalOpen}
            currentUser={pendingFirebaseUser}
            onComplete={handleCompleteOnboarding}
          />
        )}

        {/* Admin Dashboard Modal */}
        {userProfile?.role === 'admin' && (
          <AdminDashboardModal
            isOpen={isAdminDashboardOpen}
            onClose={() => setIsAdminDashboardOpen(false)}
            adminProfile={userProfile}
          />
        )}

        {/* Notifications Inbox Modal */}
        <NotificationInboxModal
          isOpen={isInboxOpen}
          onClose={() => setIsInboxOpen(false)}
          notifications={notifications}
          currentUserId={userProfile?.uid}
        />

        {/* Academic Status & Year Promotion Modal on Landing */}
        {showClassChangeModal && userProfile && (
          <AcademicStatusModal
            isOpen={showClassChangeModal}
            onClose={() => setShowClassChangeModal(false)}
            currentUserProfile={userProfile}
            onUpdateSuccess={handleUpdateAcademicStatus}
          />
        )}
      </>
    );
  }

  // Dedicated Release Notes Page
  if (currentView === 'release-notes') {
    return (
      <ReleaseNotesView
        onBack={() => {
          setCurrentView('landing');
          navigateTo('/');
        }}
      />
    );
  }

  // Active Schedule & Matrix Portal View (Student or Class Monitor)
  const isStudent = portalRole === 'student';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* First Visit Loader Animation (React Bits MetaBalls) */}
      {showFirstVisitLoader && (
        <FirstVisitLoader onComplete={handleCompleteFirstVisit} />
      )}

      {/* Logout Animation Overlay (React Bits MetallicPaint) */}
      <LogoutOverlay
        isOpen={isLoggingOut}
        userName={userProfile?.displayName || userProfile?.email?.split('@')[0]}
        onFinished={handleFinishLogout}
      />

      {/* Top Bar with School Logo, Navigation Tabs & URLs */}
      <Header
        activeMode={activeMode}
        onSelectMode={handleSelectNavMode}
        onReturnHome={handleReturnHome}
        onOpenFreeRooms={() => {
          setIsFreeRoomsOpen(true);
          navigateTo('/free-rooms');
        }}
        onOpenBookingModal={() => {
          setIsBookingModalOpen(true);
          navigateTo('/booking');
        }}
        onOpenClubModal={() => {
          setShowClubModal(true);
          navigateTo('/clubs');
        }}
        onChangeClass={() => setShowClassChangeModal(true)}
        activeGroup={activeGroupObj}
        portalRole={portalRole}
        userProfile={userProfile}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenInbox={() => setIsInboxOpen(true)}
        onOpenAuthModal={() => {
          setIsAuthModalOpen(true);
          navigateTo('/login');
        }}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onLogout={handleTriggerLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        
        {/* Authentic Academic Quick Stats with larger typography */}
        <QuickStats />

        {/* Global Instant Search Bar */}
        {activeMode !== 'clubs' && (
          <div className="no-print mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, instructors (e.g. Dr. KUY Movsun), rooms (e.g. Room A-420), or cohorts..."
                className="w-full text-sm pl-10 pr-24 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-400 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xs font-mono tabular-nums text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                    {searchMatchCount} match{searchMatchCount !== 1 ? 'es' : ''}
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active View Router with unique URL states */}
        {activeMode === 'matrix' && (
          <TimetableMatrix
            searchQuery={searchQuery}
            onSelectSession={setActiveModalSession}
            selectedCohort={selectedCohort}
            onSelectCohort={setSelectedCohort}
            selectedGroup={selectedGroup}
            onSelectGroup={(grp) => {
              setSelectedGroup(grp);
              navigateTo(`/schedule?group=${grp}`);
            }}
            myCohort={myCohort}
            onSetMyCohort={handleSetMyCohort}
            isStudentMode={isStudent}
            onChangeClass={() => setShowClassChangeModal(true)}
            onOpenFreeRooms={() => {
              setIsFreeRoomsOpen(true);
              navigateTo('/free-rooms');
            }}
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
            onOpenBookingModal={() => {
              setIsBookingModalOpen(true);
              navigateTo('/booking');
            }}
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

        {activeMode === 'clubs' && (
          <ClubsView />
        )}

      </main>

      {/* Free Study Room Right Now Modal */}
      <FreeStudyRoomModal
        isOpen={isFreeRoomsOpen}
        onClose={() => {
          setIsFreeRoomsOpen(false);
          navigateTo(activeMode === 'room' ? '/rooms' : '/schedule');
        }}
        onSelectRoom={(roomName) => {
          setSelectedRoom(roomName);
          if (!isStudent) {
            setActiveMode('room');
            navigateTo('/rooms');
          }
        }}
        makeupBookings={makeupBookings}
      />

      {/* Make-up Class Room Booking Modal */}
      <MakeupClassBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          navigateTo(activeMode === 'room' ? '/rooms' : '/schedule');
        }}
        onSaveBooking={handleSaveMakeupBooking}
        onDeleteBooking={handleDeleteMakeupBooking}
        activeMonitorGen={activeMonitorGen}
        existingBookings={makeupBookings}
        currentUserProfile={userProfile}
      />

      {/* Academic Status & Year Promotion Modal in Schedule View */}
      {showClassChangeModal && userProfile ? (
        <AcademicStatusModal
          isOpen={showClassChangeModal}
          onClose={() => setShowClassChangeModal(false)}
          currentUserProfile={userProfile}
          onUpdateSuccess={handleUpdateAcademicStatus}
        />
      ) : showClassChangeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowClassChangeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Change Active Class
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Select your class to switch your schedule view.
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
                    className={`w-full p-3 rounded-xl text-left text-sm transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 text-white font-bold shadow-xs'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="font-mono font-bold text-base text-slate-100">{group.id}</span>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">{group.name}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-sky-400 shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowClassChangeModal(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Student Club Under Development Modal */}
      {showClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-300">
                <Users className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowClubModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 mb-2">
                Under Development
              </span>
              <h3 className="text-lg font-bold text-white">
                Student Club Portal
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                The Student Club feature is currently under active development. It will feature club announcements, tech community workshops, hackathons, and event schedules for international engineering students.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowClubModal(false)}
                className="px-4 py-2 text-sm font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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
            navigateTo('/lecturers');
          }
        }}
        onSelectRoom={(room) => {
          if (!isStudent) {
            setSelectedRoom(room);
            setActiveMode('room');
            navigateTo('/rooms');
          }
        }}
      />

      {/* Auth Modal with MetallicPaint in Schedule view */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          navigateTo(activeMode === 'room' ? '/rooms' : '/schedule');
        }}
        onLoginSuccess={handleGoogleLoginSuccess}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Onboarding Modal in Schedule view */}
      {pendingFirebaseUser && !userProfile?.onboardingCompleted && (
        <OnboardingModal
          isOpen={isOnboardingModalOpen}
          currentUser={pendingFirebaseUser}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Admin Dashboard Modal */}
      {userProfile?.role === 'admin' && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          adminProfile={userProfile}
        />
      )}

      {/* Notifications Inbox Modal */}
      <NotificationInboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        notifications={notifications}
        currentUserId={userProfile?.uid}
      />

      {/* Institutional Academic Footer */}
      <footer className="no-print mt-auto border-t border-slate-800 bg-slate-900 py-6 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="font-semibold text-slate-200 text-sm">
              Institute of Technology of Cambodia (ITC) · International Engineering School
            </p>
            <p className="text-xs text-slate-400">
              Disclaimer: This is not an official website from the school, but a student-made project for learning and documentation purposes.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs">
            <button
              onClick={() => {
                setCurrentView('release-notes');
                navigateTo('/release-notes');
              }}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Release Notes (v1.0.0)
            </button>
            <span>·</span>
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
            <span className="font-mono">UTC+7</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
