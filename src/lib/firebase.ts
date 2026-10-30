import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  memoryLocalCache,
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
  where,
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
import { SessionType, SCHEDULE_DATA } from '../data/scheduleData';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'ratanaknochmunny@gmail.com';

const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;

export function ensureIsoTimestamp(ts?: string): string {
  if (typeof ts === 'string' && ISO_TIMESTAMP_REGEX.test(ts.trim()) && ts.trim().length <= 64) {
    return ts.trim();
  }
  return new Date().toISOString();
}

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

// Initialize Auth & Firestore with volatile in-memory cache to prevent shared-workstation IndexedDB leakage
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function initFirestoreWithMemoryCache() {
  const dbId = activeFirebaseConfig.firestoreDatabaseId;
  try {
    const cacheSettings = {
      localCache: memoryLocalCache()
    };
    return dbId 
      ? initializeFirestore(app, cacheSettings, dbId)
      : initializeFirestore(app, cacheSettings);
  } catch (err) {
    console.warn('In-memory cache fallback to standard firestore instance:', err);
  }
  return dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = initFirestoreWithMemoryCache();

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
  senderUid?: string;
  senderName?: string;
  senderRole?: string;
  type: 'announcement' | 'class_booking' | 'system';
  createdAt: string;
  readBy?: string[];
  clearedBy?: string[];
}

// ==========================================
// Defensive Payload Sanitization Helpers
// ==========================================

function sanitizeDocId(id: string, prefix: string): string {
  const cleaned = (id || '').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${prefix}_${Date.now()}`;
}

export function sanitizeUserProfilePayload(profile: UserProfile): UserProfile {
  const validRoles: UserRole[] = ['student', 'monitor', 'admin'];
  const validYears: AcademicYear[] = ['I1', 'I2', 'I3', 'I4', 'I5', 'Alumni', 'Admin', 'None'];
  const sanitized: UserProfile = {
    uid: String(profile.uid || '').trim().slice(0, 128),
    email: String(profile.email || 'student@itc.edu.kh').trim().toLowerCase().slice(0, 150),
    displayName: String(profile.displayName || 'ITC Student').trim().slice(0, 100) || 'ITC Student',
    role: validRoles.includes(profile.role) ? profile.role : 'student',
    year: validYears.includes(profile.year) ? profile.year : 'I1',
    groupId: String(profile.groupId || 'I1-G1').trim().slice(0, 50) || 'I1-G1',
    onboardingCompleted: Boolean(profile.onboardingCompleted ?? true),
    createdAt: ensureIsoTimestamp(profile.createdAt),
    updatedAt: ensureIsoTimestamp()
  };
  if (typeof profile.promotionYear === 'string' && profile.promotionYear.trim().length > 0) {
    sanitized.promotionYear = profile.promotionYear.trim().slice(0, 80);
  }
  if (typeof profile.isAlumni === 'boolean') {
    sanitized.isAlumni = profile.isAlumni;
  }
  return sanitized;
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
    const fbUser = result.user;
    const isRootAdminEmail =
      fbUser.emailVerified &&
      fbUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

    let profile: UserProfile | null = null;
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        if (data && (data.onboardingCompleted || data.groupId)) {
          profile = data;
          // Ensure bootstrapped admin always has admin role persisted in Firestore
          if (isRootAdminEmail && profile.role !== 'admin') {
            profile = sanitizeUserProfilePayload({
              ...profile,
              role: 'admin'
            });
            await setDoc(doc(db, 'users', fbUser.uid), profile);
          }
        }
      } else if (isRootAdminEmail) {
        // Automatically provision root administrator profile on first Google Sign-In
        const rootAdminProfile = sanitizeUserProfilePayload({
          uid: fbUser.uid,
          email: fbUser.email || BOOTSTRAPPED_ADMIN_EMAIL,
          displayName: fbUser.displayName || 'Root Bongthom Admin',
          role: 'admin',
          year: 'Admin',
          groupId: 'I2-SE',
          onboardingCompleted: true,
          createdAt: ensureIsoTimestamp()
        });
        await setDoc(doc(db, 'users', fbUser.uid), rootAdminProfile);
        profile = rootAdminProfile;
      }
    } catch (e) {
      console.warn('Could not fetch user document directly on login:', e);
    }

    const isNew = !profile;
    return { user: fbUser, profile, isNew };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export function purgeSessionStorageArtifacts(): void {
  try {
    const explicitKeys = [
      'itc_admin_auth',
      'itc_user_profile',
      'itc_portal_role',
      'itc_makeup_bookings',
      'itc_cancelled_classes'
    ];
    for (const key of explicitKeys) {
      localStorage.removeItem(key);
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('itc_cleared_notifs_')) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
    sessionStorage.removeItem('itc_monitor_authorized');
    sessionStorage.removeItem('itc_monitor_gen');
  } catch {
    // ignore storage access errors
  }
}

export async function logoutUser(): Promise<void> {
  try {
    purgeSessionStorageArtifacts();
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
  return null;
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', normalizedEmail),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (error) {
    console.warn('Could not lookup user by email:', error);
  }
  return null;
}

export function subscribeToUserProfile(
  uid: string,
  onUpdate: (profile: UserProfile | null) => void
): () => void {
  if (!uid) return () => {};
  const docRef = doc(db, 'users', uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('User profile listener warning:', error.message);
    }
  );
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const safeId = sanitizeDocId(profile.uid, 'user');
  const fullProfile = sanitizeUserProfilePayload({
    ...profile,
    uid: safeId,
    onboardingCompleted: true
  });
  const docPath = `users/${safeId}`;
  try {
    await setDoc(doc(db, 'users', safeId), fullProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  const safeId = sanitizeDocId(uid, 'user');
  const docPath = `users/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', safeId));
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

// ==========================================
// Notifications & Announcements System
// ==========================================

export async function createNotification(notif: Omit<AppNotification, 'id'>): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication is required to create a notification.');
  }

  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `notifications/${id}`;
  const validAudiences = ['all', 'monitors', 'students'] as const;
  const validTypes = ['announcement', 'class_booking', 'system'] as const;

  const payload = {
    id,
    title: String(notif.title || 'Announcement').trim().slice(0, 150) || 'Announcement',
    message: String(notif.message || '').trim().slice(0, 1000) || 'System notification',
    audience: validAudiences.includes(notif.audience) ? notif.audience : 'all',
    senderUid: currentUser.uid.slice(0, 128),
    senderName: String(notif.senderName || 'System').trim().slice(0, 100),
    senderRole: String(notif.senderRole || 'Class Monitor').trim().slice(0, 60),
    type: validTypes.includes(notif.type) ? notif.type : 'class_booking',
    createdAt: ensureIsoTimestamp(notif.createdAt),
    readBy: Array.isArray(notif.readBy) ? notif.readBy.slice(0, 500) : [],
    clearedBy: Array.isArray(notif.clearedBy) ? notif.clearedBy.slice(0, 500) : []
  };

  try {
    await setDoc(doc(db, 'notifications', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
    return id;
  }
}

export async function markNotificationAsRead(notificationId: string, uid: string): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) return;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      readBy: arrayUnion(uid)
    });
  } catch (error) {
    console.warn('Could not mark notification as read:', error);
  }
}

export async function clearNotificationForUser(notificationId: string, uid: string): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) return;
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
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) return;
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
  const safeId = sanitizeDocId(notificationId, 'notif');
  const docPath = `notifications/${safeId}`;
  try {
    await deleteDoc(doc(db, 'notifications', safeId));
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
  if (!auth.currentUser) {
    onUpdate([]);
    return () => {};
  }
  const collectionPath = 'notifications';
  let activeUnsub: (() => void) | null = null;
  let isCancelled = false;

  const allowedAudiences: Array<'all' | 'monitors' | 'students'> =
    userRole === 'admin'
      ? ['all', 'monitors', 'students']
      : userRole === 'monitor'
      ? ['all', 'monitors']
      : ['all', 'students'];

  const mapSnapshot = (snapshot: any) => {
    const list: AppNotification[] = [];
    snapshot.forEach((d: any) => {
      const data = d.data();
      const aud = data.audience || 'all';
      if (allowedAudiences.includes(aud)) {
        list.push({
          id: d.id,
          title: data.title || '',
          message: data.message || '',
          audience: data.audience || 'all',
          senderUid: data.senderUid || '',
          senderName: data.senderName || 'System',
          senderRole: data.senderRole || 'Admin',
          type: data.type || 'announcement',
          createdAt: data.createdAt || ensureIsoTimestamp(),
          readBy: data.readBy || [],
          clearedBy: data.clearedBy || []
        });
      }
    });
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    onUpdate(list);
  };

  try {
    const q = query(
      collection(db, collectionPath),
      where('audience', 'in', allowedAudiences),
      limit(maxItems)
    );
    activeUnsub = onSnapshot(
      q,
      mapSnapshot,
      (error) => {
        if (isCancelled || !auth.currentUser) return;
        if (onFailed) onFailed(error);
      }
    );
    return () => {
      isCancelled = true;
      if (activeUnsub) activeUnsub();
    };
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
  if (!auth.currentUser) {
    onUpdate([]);
    return () => {};
  }

  const collectionPath = 'makeupBookings';
  let activeUnsub: (() => void) | null = null;
  let isCancelled = false;

  const mapSnapshot = (snapshot: any) => {
    const bookings: MakeupClassBooking[] = [];
    snapshot.forEach((d: any) => {
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
        note: data.note || '',
        createdAt: data.createdAt || ensureIsoTimestamp()
      });
    });

    bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    onUpdate(bookings);
  };

  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    activeUnsub = onSnapshot(
      q,
      mapSnapshot,
      (error) => {
        if (isCancelled || !auth.currentUser) return;
        try {
          const fallbackQ = query(collection(db, collectionPath), limit(maxItems));
          activeUnsub = onSnapshot(
            fallbackQ,
            mapSnapshot,
            (fallbackErr) => {
              if (onFailed) onFailed(fallbackErr);
            }
          );
        } catch {
          if (onFailed) onFailed(error);
        }
      }
    );
    return () => {
      isCancelled = true;
      if (activeUnsub) activeUnsub();
    };
  } catch (error) {
    if (onFailed) onFailed(error as Error);
    return () => {};
  }
}

export async function saveMakeupBooking(
  booking: MakeupClassBooking,
  creatorProfile?: UserProfile | null
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication is required to create a make-up booking.');
  }

  const safeId = sanitizeDocId(booking.id, 'makeup');
  const docPath = `makeupBookings/${safeId}`;
  const validSessionTypes: MakeupSessionType[] = ['Lecture', 'Tutorial', 'Practical'];
  const validGenerations = ['I1', 'I2', 'I3', 'I4', 'I5', 'Alumni'];
  const allowedSlots = SCHEDULE_DATA.meta.timeSlots;
  const rawGen = booking.generation || (booking.groupId ? booking.groupId.split('-')[0] : 'I2');

  const filteredSlots = Array.isArray(booking.timeSlots)
    ? booking.timeSlots.filter(s => allowedSlots.includes(s)).slice(0, 8)
    : [];

  const payload = {
    course: String(booking.course || '').trim().slice(0, 200),
    sessionType: validSessionTypes.includes(booking.sessionType as MakeupSessionType) ? booking.sessionType : 'Lecture',
    room: String(booking.room || '').trim().slice(0, 100),
    generation: validGenerations.includes(rawGen) ? rawGen : 'I2',
    groupId: String(booking.groupId || '').trim().slice(0, 50),
    date: String(booking.date || '').trim().slice(0, 10),
    day: booking.day,
    time: String(booking.time || '').trim().slice(0, 150),
    timeSlots: filteredSlots.length > 0 ? filteredSlots : [allowedSlots[0]],
    bookedBy: String(creatorProfile?.displayName || booking.bookedBy || 'Class Monitor').trim().slice(0, 100),
    bookedByUid: currentUser.uid.slice(0, 128),
    note: String(booking.note || '').trim().slice(0, 300),
    createdAt: ensureIsoTimestamp(booking.createdAt)
  };

  try {
    await setDoc(doc(db, 'makeupBookings', safeId), payload);

    const monitorName = payload.bookedBy;
    const monitorGroup = payload.groupId;
    const typeLabel = payload.sessionType || 'Lecture';
    
    await createNotification({
      title: `Make-up ${typeLabel}: ${payload.course}`,
      message: `${monitorName} (${monitorGroup}) scheduled a make-up ${typeLabel.toLowerCase()} in ${payload.room} on ${payload.day}, ${payload.date} (${payload.time}).`,
      audience: 'all',
      senderUid: currentUser.uid,
      senderName: monitorName,
      senderRole: creatorProfile?.role === 'admin' ? 'Administrator' : 'Class Monitor',
      type: 'class_booking',
      createdAt: ensureIsoTimestamp(),
      readBy: [currentUser.uid]
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteMakeupBooking(id: string): Promise<void> {
  const safeId = sanitizeDocId(id, 'makeup');
  const docPath = `makeupBookings/${safeId}`;
  try {
    await deleteDoc(doc(db, 'makeupBookings', safeId));
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
  if (!auth.currentUser) {
    onUpdate([]);
    return () => {};
  }

  const collectionPath = 'cancelledClasses';
  let activeUnsub: (() => void) | null = null;
  let isCancelled = false;

  const mapSnapshot = (snapshot: any) => {
    const items: CancelledClassSession[] = [];
    snapshot.forEach((d: any) => {
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
        reason: data.reason || '',
        createdAt: data.createdAt || ensureIsoTimestamp()
      });
    });

    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    onUpdate(items);
  };

  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    activeUnsub = onSnapshot(
      q,
      mapSnapshot,
      (error) => {
        if (isCancelled || !auth.currentUser) return;
        try {
          const fallbackQ = query(collection(db, collectionPath), limit(maxItems));
          activeUnsub = onSnapshot(
            fallbackQ,
            mapSnapshot,
            (fallbackErr) => {
              if (onFailed) onFailed(fallbackErr);
            }
          );
        } catch {
          if (onFailed) onFailed(error);
        }
      }
    );
    return () => {
      isCancelled = true;
      if (activeUnsub) activeUnsub();
    };
  } catch (error) {
    if (onFailed) onFailed(error as Error);
    return () => {};
  }
}

export async function saveCancelledClass(
  item: CancelledClassSession,
  creatorProfile?: UserProfile | null
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication is required to mark a class as cancelled.');
  }

  const safeId = sanitizeDocId(item.id, 'cancel');
  const docPath = `cancelledClasses/${safeId}`;
  const validCohorts = ['I1', 'I2', 'I3', 'I4', 'I5', 'Alumni'];
  const rawCohort = item.cohort || (item.groupId ? item.groupId.split('-')[0] : 'I2');

  const payload = {
    groupId: String(item.groupId || '').trim().slice(0, 50),
    cohort: validCohorts.includes(rawCohort) ? rawCohort : 'I2',
    day: item.day,
    date: String(item.date || '').trim().slice(0, 10),
    time: String(item.time || '').trim().slice(0, 100),
    course: String(item.course || '').trim().slice(0, 200),
    type: item.type || 'Lecture',
    lecturer: String(item.lecturer || '').trim().slice(0, 150),
    room: String(item.room || '').trim().slice(0, 100),
    cancelledBy: String(creatorProfile?.displayName || item.cancelledBy || 'Class Monitor').trim().slice(0, 100),
    cancelledByUid: currentUser.uid.slice(0, 128),
    reason: String(item.reason || '').trim().slice(0, 300),
    createdAt: ensureIsoTimestamp(item.createdAt)
  };

  try {
    await setDoc(doc(db, 'cancelledClasses', safeId), payload);

    const monitorName = payload.cancelledBy;

    await createNotification({
      title: `Class Cancelled (${payload.groupId}): ${payload.course}`,
      message: `${monitorName} marked ${payload.course} (${payload.type}) for ${payload.groupId} on ${payload.day}, ${payload.date} (${payload.time}) as cancelled for this week.${payload.room ? ` ${payload.room} is now free during this slot.` : ''}`,
      audience: 'all',
      senderUid: currentUser.uid,
      senderName: monitorName,
      senderRole: creatorProfile?.role === 'admin' ? 'Administrator' : 'Class Monitor',
      type: 'class_booking',
      createdAt: ensureIsoTimestamp(),
      readBy: [currentUser.uid]
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteCancelledClass(id: string): Promise<void> {
  const safeId = sanitizeDocId(id, 'cancel');
  const docPath = `cancelledClasses/${safeId}`;
  try {
    await deleteDoc(doc(db, 'cancelledClasses', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

