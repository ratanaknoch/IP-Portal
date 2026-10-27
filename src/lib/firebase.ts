import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { MakeupClassBooking } from '../components/MakeupClassBookingModal';

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

// Initialize Auth & Firestore with explicit database ID
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = activeFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, activeFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

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
            // Background sync back to Firestore
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

  // Fallback to localStorage cache
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
  const docPath = `users/${profile.uid}`;
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

export function subscribeToAllUsers(
  onUpdate: (users: UserProfile[]) => void,
  onFailed?: (error: Error) => void
): () => void {
  const collectionPath = 'users';
  try {
    const unsub = onSnapshot(
      collection(db, collectionPath),
      (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((d) => {
          users.push(d.data() as UserProfile);
        });
        users.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(users);
      },
      (error) => {
        console.warn('Error subscribing to users:', error);
        if (onFailed) onFailed(error);
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
  const docPath = `notifications/${notificationId}`;
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
  onFailed?: (error: Error) => void
): () => void {
  const collectionPath = 'notifications';
  try {
    const unsub = onSnapshot(
      collection(db, collectionPath),
      (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const aud = data.audience || 'all';
          // Filter according to audience
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
        // Sort latest first
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(list);
      },
      (error) => {
        console.warn('Error syncing notifications:', error);
        if (onFailed) onFailed(error);
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
  onFailed?: (error: Error) => void
): () => void {
  const collectionPath = 'makeupBookings';
  
  try {
    const unsub = onSnapshot(
      collection(db, collectionPath),
      (snapshot) => {
        const bookings: MakeupClassBooking[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          bookings.push({
            id: d.id,
            course: data.course || '',
            room: data.room || '',
            generation: data.generation || 'I1',
            groupId: data.groupId || '',
            date: data.date || '',
            day: data.day || 'Monday',
            time: data.time || '',
            timeSlots: data.timeSlots || (data.time ? data.time.split(', ') : []),
            bookedBy: data.bookedBy || 'Monitor',
            note: data.note || '',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(bookings);
      },
      (error) => {
        console.warn('Real-time sync error, falling back to local cache:', error.message);
        if (onFailed) {
          onFailed(error);
        }
        try {
          handleFirestoreError(error, OperationType.LIST, collectionPath);
        } catch {
          // Handled for logging
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
      room: booking.room,
      groupId: booking.groupId,
      date: booking.date,
      day: booking.day,
      time: booking.time,
      timeSlots: booking.timeSlots || [],
      bookedBy: booking.bookedBy,
      note: booking.note || '',
      createdAt: booking.createdAt
    });

    // Send a notification to other class monitors
    const monitorName = creatorProfile?.displayName || booking.bookedBy || 'Class Monitor';
    const monitorGroup = booking.groupId;
    
    await createNotification({
      title: `Class Booking: ${booking.course}`,
      message: `${monitorName} (${monitorGroup}) booked a make-up class in ${booking.room} on ${booking.day}, ${booking.date} (${booking.time}).`,
      audience: 'monitors',
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
