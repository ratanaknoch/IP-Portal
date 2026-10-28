import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  updateDoc,
  arrayUnion,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  QueryDocumentSnapshot
} from 'firebase/firestore';

export type { QueryDocumentSnapshot };
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { MakeupClassBooking, CancelledClassSession, MakeupSessionType } from '../components/MakeupClassBookingModal';
import { SessionType } from '../data/scheduleData';

// Resolve configuration: fallback between bundled config and VITE_ environment variables
const activeFirebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  firestoreDatabaseId: (import.meta.env.VITE_FIRESTORE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId
};

// Initialize Firebase App
const app = initializeApp(activeFirebaseConfig);

// Initialize Auth & Firestore with multi-tab persistent IndexedDB caching
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function initFirestoreWithPersistentCache() {
  const dbId = activeFirebaseConfig.firestoreDatabaseId;
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const cacheSettings = {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      };
      return dbId 
        ? initializeFirestore(app, cacheSettings, dbId)
        : initializeFirestore(app, cacheSettings);
    }
  } catch (err) {
    console.warn('Persistent IndexedDB cache fallback to standard firestore instance:', err);
  }
  return dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = initFirestoreWithPersistentCache();

// User Profile Types
export type UserRole = 'student' | 'monitor' | 'admin';
export type AcademicYear = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'Alumni' | 'Admin' | 'None';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  year: AcademicYear;
  groupId: string;
  onboardingCompleted: boolean;
  promotionYear?: string;
  isAlumni?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'monitors' | 'students';
  senderName?: string;
  senderRole?: string;
  type: 'announcement' | 'class_booking' | 'system';
  createdAt: string;
  readBy?: string[];
  clearedBy?: string[];
}

// Test connection on boot per Firestore specification
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check connection.');
    }
    return false;
  }
}

// Error handling conforming to FirestoreErrorInfo specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous ?? true,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// Authentication Functions
// ==========================================

export async function loginWithGoogle(): Promise<{ user: FirebaseUser; profile: UserProfile | null; isNew: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    let profile: UserProfile | null = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        if (data && (data.onboardingCompleted || data.groupId)) {
          profile = data;
        }
      }
    } catch (e) {
      console.warn('Could not fetch user document directly on login:', e);
    }

    // Secondary fallback: check local cached profile
    if (!profile) {
      try {
        const cached = localStorage.getItem('itc_user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.uid === result.user.uid || parsed.email === result.user.email) && (parsed.onboardingCompleted || parsed.groupId)) {
            profile = { ...parsed, uid: result.user.uid };
            setDoc(doc(db, 'users', result.user.uid), profile, { merge: true }).catch(() => {});
          }
        }
      } catch {
        // ignore
      }
    }

    const isNew = !profile;
    return { user: result.user, profile, isNew };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    localStorage.removeItem('itc_admin_auth');
    localStorage.removeItem('itc_user_profile');
    sessionStorage.removeItem('itc_monitor_authorized');
    sessionStorage.removeItem('itc_monitor_gen');
    await fbSignOut(auth);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ==========================================
// User Profile Management
// ==========================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      if (data && (data.onboardingCompleted || data.groupId)) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Could not fetch user profile from Firestore:', error);
  }

  try {
    const cached = localStorage.getItem('itc_user_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.uid === uid && (parsed.onboardingCompleted || parsed.groupId)) {
        return parsed;
      }
    }
  } catch {}

  return null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const fullProfile: UserProfile = {
    ...profile,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'users', profile.uid), fullProfile, { merge: true });
  } catch (error) {
    console.warn('Firestore write warning:', error);
  }
  try {
    localStorage.setItem('itc_user_profile', JSON.stringify(fullProfile));
  } catch {
    // ignore
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  const docPath = `users/${uid}`;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export interface UsersPageResult {
  users: UserProfile[];
  firstDoc: QueryDocumentSnapshot | null;
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export async function fetchUsersPaginated(
  pageSize: number = 20,
  cursor: QueryDocumentSnapshot | null = null
): Promise<UsersPageResult> {
  const collectionPath = 'users';
  try {
    const q = cursor
      ? query(
          collection(db, collectionPath),
          orderBy('createdAt', 'desc'),
          startAfter(cursor),
          limit(pageSize)
        )
      : query(
          collection(db, collectionPath),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );

    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      users.push(d.data() as UserProfile);
    });

    return {
      users,
      firstDoc: snap.docs.length > 0 ? snap.docs[0] : null,
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
      hasMore: snap.docs.length === pageSize
    };
  } catch (err) {
    console.warn('Error fetching paginated users with order, fallback to limit:', err);
    try {
      const fallbackQ = cursor
        ? query(collection(db, collectionPath), startAfter(cursor), limit(pageSize))
        : query(collection(db, collectionPath), limit(pageSize));
      const snap = await getDocs(fallbackQ);
      const users: UserProfile[] = [];
      snap.forEach((d) => {
        users.push(d.data() as UserProfile);
      });
      return {
        users,
        firstDoc: snap.docs[0] || null,
        lastDoc: snap.docs[snap.docs.length - 1] || null,
        hasMore: snap.docs.length === pageSize
      };
    } catch (fbErr) {
      console.error('Failed to fetch paginated users:', fbErr);
      return { users: [], firstDoc: null, lastDoc: null, hasMore: false };
    }
  }
}

export async function getTotalUsersCount(): Promise<number> {
  try {
    const snap = await getCountFromServer(collection(db, 'users'));
    return snap.data().count;
  } catch (err) {
    console.warn('Could not retrieve aggregate user count:', err);
    return 0;
  }
}

export function subscribeToAllUsers(
  onUpdate: (users: UserProfile[]) => void,
  onFailed?: (error: Error) => void,
  maxItems: number = 20
): () => void {
  const collectionPath = 'users';
  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((d) => {
          users.push(d.data() as UserProfile);
        });
        users.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(users);
      },
      (error) => {
        console.warn('Error subscribing to users with limit query:', error);
        try {
          const fallbackQ = query(collection(db, collectionPath), limit(maxItems));
          return onSnapshot(fallbackQ, (snapshot) => {
            const users: UserProfile[] = [];
            snapshot.forEach((d) => {
              users.push(d.data() as UserProfile);
            });
            onUpdate(users);
          });
        } catch {
          if (onFailed) onFailed(error);
        }
      }
    );
    return unsub;
  } catch (error) {
    if (onFailed) onFailed(error as Error);
    return () => {};
  }
}

// ==========================================
// Notifications & Announcements System
// ==========================================

export async function createNotification(notif: Omit<AppNotification, 'id'>): Promise<string> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `notifications/${id}`;
  try {
    await setDoc(doc(db, 'notifications', id), {
      ...notif,
      id,
      readBy: notif.readBy || [],
      clearedBy: notif.clearedBy || []
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
    return id;
  }
}

export async function markNotificationAsRead(notificationId: string, uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      readBy: arrayUnion(uid)
    });
  } catch (error) {
    console.warn('Could not mark notification as read:', error);
  }
}

export async function clearNotificationForUser(notificationId: string, uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      clearedBy: arrayUnion(uid),
      readBy: arrayUnion(uid)
    });
  } catch (error) {
    console.warn('Could not clear notification in cloud, using local cache:', error);
  }
}

export async function clearAllNotificationsForUser(notificationIds: string[], uid: string): Promise<void> {
  try {
    await Promise.all(
      notificationIds.map((id) =>
        updateDoc(doc(db, 'notifications', id), {
          clearedBy: arrayUnion(uid),
          readBy: arrayUnion(uid)
        }).catch(() => {})
      )
    );
  } catch (error) {
    console.warn('Could not clear all notifications in cloud:', error);
  }
}

export async function deleteNotificationGlobally(notificationId: string): Promise<void> {
  const docPath = `notifications/${notificationId}`;
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function deleteAllNotificationsAcrossAllUsers(): Promise<void> {
  const collectionPath = 'notifications';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const deletions: Promise<void>[] = [];
    snap.forEach((d) => {
      deletions.push(deleteDoc(doc(db, collectionPath, d.id)));
    });
    await Promise.all(deletions);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionPath);
  }
}

export function subscribeToNotifications(
  userRole: UserRole,
  onUpdate: (notifications: AppNotification[]) => void,
  onFailed?: (error: Error) => void,
  maxItems: number = 20
): () => void {
  const collectionPath = 'notifications';
  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const aud = data.audience || 'all';
          if (
            userRole === 'admin' ||
            aud === 'all' ||
            (userRole === 'monitor' && (aud === 'monitors' || aud === 'all')) ||
            (userRole === 'student' && (aud === 'students' || aud === 'all'))
          ) {
            list.push({
              id: d.id,
              title: data.title || '',
              message: data.message || '',
              audience: data.audience || 'all',
              senderName: data.senderName || 'System',
              senderRole: data.senderRole || 'Admin',
              type: data.type || 'announcement',
              createdAt: data.createdAt || new Date().toISOString(),
              readBy: data.readBy || [],
              clearedBy: data.clearedBy || []
            });
          }
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(list);
      },
      (error) => {
        console.warn('Error syncing notifications with order limit, fallback:', error);
        try {
          const fallbackQ = query(collection(db, collectionPath), limit(maxItems));
          return onSnapshot(fallbackQ, (snapshot) => {
            const list: AppNotification[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              list.push({ ...data, id: d.id } as AppNotification);
            });
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            onUpdate(list);
          });
        } catch {
          if (onFailed) onFailed(error);
        }
      }
    );
    return unsub;
  } catch (error) {
    if (onFailed) onFailed(error as Error);
    return () => {};
  }
}

// ==========================================
// Make-up Class Bookings System
// ==========================================

export function subscribeToMakeupBookings(
  onUpdate: (bookings: MakeupClassBooking[]) => void,
  onFailed?: (error: Error) => void,
  maxItems: number = 20
): () => void {
  const collectionPath = 'makeupBookings';
  
  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const bookings: MakeupClassBooking[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          bookings.push({
            id: d.id,
            course: data.course || '',
            sessionType: (data.sessionType as MakeupSessionType) || 'Lecture',
            room: data.room || '',
            generation: data.generation || (data.groupId ? data.groupId.split('-')[0] : 'I1'),
            groupId: data.groupId || '',
            date: data.date || '',
            day: data.day || 'Monday',
            time: data.time || '',
            timeSlots: data.timeSlots || (data.time ? data.time.split(', ') : []),
            bookedBy: data.bookedBy || 'Monitor',
            bookedByUid: data.bookedByUid || '',
            bookedByEmail: data.bookedByEmail || '',
            note: data.note || '',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(bookings);
      },
      (error) => {
        console.warn('Real-time sync error with order query, falling back to basic limit:', error.message);
        try {
          const fallbackQ = query(collection(db, collectionPath), limit(maxItems));
          return onSnapshot(fallbackQ, (snapshot) => {
            const bookings: MakeupClassBooking[] = [];
            snapshot.forEach((d) => {
              bookings.push({ ...d.data(), id: d.id } as MakeupClassBooking);
            });
            bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            onUpdate(bookings);
          });
        } catch {
          if (onFailed) onFailed(error);
        }
      }
    );
    return unsub;
  } catch (error) {
    console.warn('Could not initialize snapshot listener:', error);
    if (onFailed) onFailed(error as Error);
    return () => {};
  }
}

export async function saveMakeupBooking(
  booking: MakeupClassBooking,
  creatorProfile?: UserProfile | null
): Promise<void> {
  const docPath = `makeupBookings/${booking.id}`;
  try {
    await setDoc(doc(db, 'makeupBookings', booking.id), {
      course: booking.course,
      sessionType: booking.sessionType || 'Lecture',
      room: booking.room,
      generation: booking.generation || (booking.groupId ? booking.groupId.split('-')[0] : 'I1'),
      groupId: booking.groupId,
      date: booking.date,
      day: booking.day,
      time: booking.time,
      timeSlots: booking.timeSlots || [],
      bookedBy: booking.bookedBy,
      bookedByUid: booking.bookedByUid || creatorProfile?.uid || '',
      bookedByEmail: booking.bookedByEmail || creatorProfile?.email || '',
      note: booking.note || '',
      createdAt: booking.createdAt
    });

    const monitorName = creatorProfile?.displayName || booking.bookedBy || 'Class Monitor';
    const monitorGroup = booking.groupId;
    const typeLabel = booking.sessionType || 'Lecture';
    
    await createNotification({
      title: `Make-up ${typeLabel}: ${booking.course}`,
      message: `${monitorName} (${monitorGroup}) scheduled a make-up ${typeLabel.toLowerCase()} in ${booking.room} on ${booking.day}, ${booking.date} (${booking.time}).`,
      audience: 'all',
      senderName: monitorName,
      senderRole: 'Class Monitor',
      type: 'class_booking',
      createdAt: new Date().toISOString(),
      readBy: creatorProfile?.uid ? [creatorProfile.uid] : []
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteMakeupBooking(id: string): Promise<void> {
  const docPath = `makeupBookings/${id}`;
  try {
    await deleteDoc(doc(db, 'makeupBookings', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// Cancelled Classes System (Weekly Reset on Sunday)
// ==========================================

export function subscribeToCancelledClasses(
  onUpdate: (items: CancelledClassSession[]) => void,
  onFailed?: (error: Error) => void,
  maxItems: number = 20
): () => void {
  const collectionPath = 'cancelledClasses';

  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: CancelledClassSession[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            groupId: data.groupId || '',
            cohort: data.cohort || (data.groupId ? data.groupId.split('-')[0] : 'I1'),
            day: data.day || 'Monday',
            date: data.date || '',
            time: data.time || '',
            course: data.course || '',
            type: (data.type as SessionType) || 'Lecture',
            lecturer: data.lecturer || '',
            room: data.room || '',
            cancelledBy: data.cancelledBy || 'Class Monitor',
            cancelledByUid: data.cancelledByUid || '',
            cancelledByEmail: data.cancelledByEmail || '',
            reason: data.reason || '',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(items);
      },
      (error) => {
        console.warn('Error syncing cancelled classes with query limit, falling back:', error.message);
        try {
          const fallbackQ = query(collection(db, collectionPath), limit(maxItems));
          return onSnapshot(fallbackQ, (snapshot) => {
            const items: CancelledClassSession[] = [];
            snapshot.forEach((d) => {
              items.push({ ...d.data(), id: d.id } as CancelledClassSession);
            });
            items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            onUpdate(items);
          });
        } catch {
          if (onFailed) onFailed(error);
        }
      }
    );
    return unsub;
  } catch (error) {
    console.warn('Could not initialize cancelledClasses listener:', error);
    if (onFailed) onFailed(error as Error);
    return () => {};
  }
}

export async function saveCancelledClass(
  item: CancelledClassSession,
  creatorProfile?: UserProfile | null
): Promise<void> {
  const docPath = `cancelledClasses/${item.id}`;
  try {
    await setDoc(doc(db, 'cancelledClasses', item.id), {
      groupId: item.groupId,
      cohort: item.cohort,
      day: item.day,
      date: item.date,
      time: item.time,
      course: item.course,
      type: item.type,
      lecturer: item.lecturer,
      room: item.room,
      cancelledBy: item.cancelledBy,
      cancelledByUid: item.cancelledByUid || creatorProfile?.uid || '',
      cancelledByEmail: item.cancelledByEmail || creatorProfile?.email || '',
      reason: item.reason || '',
      createdAt: item.createdAt
    });

    const monitorName = creatorProfile?.displayName || item.cancelledBy || 'Class Monitor';

    await createNotification({
      title: `Class Cancelled (${item.groupId}): ${item.course}`,
      message: `${monitorName} marked ${item.course} (${item.type}) for ${item.groupId} on ${item.day}, ${item.date} (${item.time}) as cancelled for this week.${item.room ? ` ${item.room} is now free during this slot.` : ''}`,
      audience: 'all',
      senderName: monitorName,
      senderRole: 'Class Monitor',
      type: 'class_booking',
      createdAt: new Date().toISOString(),
      readBy: creatorProfile?.uid ? [creatorProfile.uid] : []
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteCancelledClass(id: string): Promise<void> {
  const docPath = `cancelledClasses/${id}`;
  try {
    await deleteDoc(doc(db, 'cancelledClasses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
