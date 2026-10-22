import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MakeupClassBooking } from '../components/MakeupClassBookingModal';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with explicit database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Subscribe to real-time makeup bookings across all devices
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
            generation: data.generation || 'I2',
            groupId: data.groupId || '',
            date: data.date || '',
            day: data.day || 'Monday',
            time: data.time || '',
            bookedBy: data.bookedBy || 'Monitor',
            note: data.note || '',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // Sort latest first
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

// Save reservation to Firestore
export async function saveMakeupBooking(booking: MakeupClassBooking): Promise<void> {
  const docPath = `makeupBookings/${booking.id}`;
  try {
    await setDoc(doc(db, 'makeupBookings', booking.id), {
      course: booking.course,
      room: booking.room,
      generation: booking.generation,
      groupId: booking.groupId,
      date: booking.date,
      day: booking.day,
      time: booking.time,
      bookedBy: booking.bookedBy,
      note: booking.note || '',
      createdAt: booking.createdAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Delete reservation from Firestore
export async function deleteMakeupBooking(id: string): Promise<void> {
  const docPath = `makeupBookings/${id}`;
  try {
    await deleteDoc(doc(db, 'makeupBookings', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
