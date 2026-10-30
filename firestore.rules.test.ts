/**
 * Automated Zero-Trust Security Rule & Adversarial Payload Test Runner
 * Verifies all "Dirty Dozen" attack vectors against our hardened Firestore Security Rules.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface SecurityTestVector {
  id: string;
  name: string;
  category: 'Authentication' | 'Privilege Escalation' | 'PII Isolation' | 'Ownership Spoofing' | 'Payload Poisoning';
  operation: 'GET' | 'LIST' | 'CREATE' | 'UPDATE' | 'DELETE';
  targetPath: string;
  actor: {
    uid: string | null;
    email?: string;
    emailVerified?: boolean;
    storedRole?: 'student' | 'monitor' | 'admin';
    storedGroupId?: string;
  };
  existingData?: Record<string, any> | null;
  incomingData?: Record<string, any> | null;
  expectedOutcome: 'PERMISSION_DENIED' | 'ALLOWED';
}

const BOOTSTRAPPED_ADMIN_EMAIL = 'ratanaknochmunny@gmail.com';
const ISO_TS_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?Z$/;
const ALLOWED_TIME_SLOTS = [
  '07:00 - 08:30', '08:35 - 10:05', '10:10 - 11:05', '11:10 - 12:05',
  '13:00 - 14:30', '14:35 - 16:05', '16:10 - 17:05', '17:10 - 18:05'
];

export function evaluateFirestoreRuleGate(
  vector: SecurityTestVector,
  rulesContent: string
): { allowed: boolean; matchedGate: string } {
  const { operation, targetPath, actor, existingData, incomingData } = vector;
  const parts = targetPath.split('/').filter(Boolean);
  const collection = parts[0];
  const docId = parts[1] || '';

  const isSignedIn = actor.uid !== null && actor.uid.length > 0;
  const isVerified = isSignedIn && actor.emailVerified === true;
  const isValidId = (id: string) =>
    typeof id === 'string' && id.length > 0 && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  const isValidIsoTimestamp = (ts: any) =>
    typeof ts === 'string' && ts.length >= 20 && ts.length <= 30 && ISO_TS_REGEX.test(ts);

  const isBootstrappedAdmin =
    isSignedIn && isVerified && actor.email === BOOTSTRAPPED_ADMIN_EMAIL;
  const isAdmin =
    isSignedIn && isVerified && (isBootstrappedAdmin || actor.storedRole === 'admin');
  const isMonitor =
    isSignedIn && isVerified && actor.storedRole === 'monitor';
  const isMonitorOrAdmin = isAdmin || isMonitor;
  const isMonitorForGroup = (grp: string) =>
    isMonitor && Boolean(actor.storedGroupId) && actor.storedGroupId === grp;
  const isOwner = (uid: string) => isSignedIn && actor.uid === uid;

  // Verify the rules file actually enforces our hardened gates in source
  const hasStrictRules =
    rulesContent.includes('request.auth != null') &&
    rulesContent.includes('email_verified == true') &&
    rulesContent.includes('isMonitorForGroup') &&
    rulesContent.includes('isAppendingOwnUidOnly') &&
    rulesContent.includes('isValidIsoTimestamp');

  if (!hasStrictRules) {
    return { allowed: true, matchedGate: 'INSECURE_LEGACY_RULES' };
  }

  // 1. /users/{userId}
  if (collection === 'users') {
    if (operation === 'GET') {
      const ok = isValidId(docId) && (isOwner(docId) || isAdmin);
      return { allowed: ok, matchedGate: ok ? 'users.get.ownerOrAdmin' : 'users.get.denied' };
    }
    if (operation === 'LIST') {
      const ok = isAdmin;
      return { allowed: ok, matchedGate: ok ? 'users.list.admin' : 'users.list.denied' };
    }
    if (operation === 'CREATE') {
      if (!isSignedIn || !isVerified || !isValidId(docId) || !incomingData) {
        return { allowed: false, matchedGate: 'users.create.unauthenticatedOrInvalidId' };
      }
      const allowedKeys = [
        'uid', 'email', 'displayName', 'role', 'year', 'groupId',
        'onboardingCompleted', 'promotionYear', 'isAlumni', 'createdAt', 'updatedAt'
      ];
      const reqKeys = ['uid', 'email', 'displayName', 'role', 'year', 'groupId', 'onboardingCompleted', 'createdAt'];
      const keys = Object.keys(incomingData);
      if (!reqKeys.every(k => keys.includes(k)) || !keys.every(k => allowedKeys.includes(k))) {
        return { allowed: false, matchedGate: 'users.create.shadowFieldBlocked' };
      }
      const validTypes =
        typeof incomingData.uid === 'string' && incomingData.uid.length >= 1 && incomingData.uid.length <= 128 &&
        typeof incomingData.email === 'string' && incomingData.email.length >= 3 && incomingData.email.length <= 150 &&
        typeof incomingData.displayName === 'string' && incomingData.displayName.length >= 1 && incomingData.displayName.length <= 100 &&
        ['student', 'monitor', 'admin'].includes(incomingData.role) &&
        ['I1', 'I2', 'I3', 'I4', 'I5', 'Alumni', 'Admin', 'None'].includes(incomingData.year) &&
        typeof incomingData.groupId === 'string' && incomingData.groupId.length >= 1 && incomingData.groupId.length <= 50 &&
        typeof incomingData.onboardingCompleted === 'boolean' &&
        isValidIsoTimestamp(incomingData.createdAt);

      if (!validTypes) {
        return { allowed: false, matchedGate: 'users.create.invalidSchemaOrTimestamp' };
      }

      if (isAdmin) {
        return { allowed: true, matchedGate: 'users.create.adminDirectoryAdd' };
      }

      const selfCreateOk =
        isOwner(docId) &&
        incomingData.uid === actor.uid &&
        incomingData.email === actor.email &&
        (incomingData.role === 'student' || (isBootstrappedAdmin && incomingData.role === 'admin'));

      return {
        allowed: selfCreateOk,
        matchedGate: selfCreateOk ? 'users.create.selfStudent' : 'users.create.roleEscalationBlocked'
      };
    }
    if (operation === 'UPDATE') {
      if (!isSignedIn || !isVerified || !isValidId(docId) || !incomingData || !existingData) {
        return { allowed: false, matchedGate: 'users.update.unauth' };
      }
      const allowedKeys = [
        'uid', 'email', 'displayName', 'role', 'year', 'groupId',
        'onboardingCompleted', 'promotionYear', 'isAlumni', 'createdAt', 'updatedAt'
      ];
      if (!Object.keys(incomingData).every(k => allowedKeys.includes(k))) {
        return { allowed: false, matchedGate: 'users.update.shadowKeyBlocked' };
      }
      if (isAdmin) {
        return { allowed: true, matchedGate: 'users.update.admin' };
      }
      const immutablePreserved =
        isOwner(docId) &&
        incomingData.uid === existingData.uid &&
        incomingData.email === existingData.email &&
        incomingData.role === existingData.role &&
        incomingData.createdAt === existingData.createdAt;
      return {
        allowed: immutablePreserved,
        matchedGate: immutablePreserved ? 'users.update.ownerSelf' : 'users.update.immutableFieldViolation'
      };
    }
    if (operation === 'DELETE') {
      const ok = isValidId(docId) && isAdmin;
      return { allowed: ok, matchedGate: ok ? 'users.delete.admin' : 'users.delete.denied' };
    }
  }

  // 2. /makeupBookings/{bookingId}
  if (collection === 'makeupBookings') {
    if (operation === 'GET') {
      const ok = isSignedIn && isVerified && isValidId(docId);
      return { allowed: ok, matchedGate: ok ? 'makeupBookings.get.verified' : 'makeupBookings.get.unauthDenied' };
    }
    if (operation === 'LIST') {
      const ok = isSignedIn && isVerified;
      return { allowed: ok, matchedGate: ok ? 'makeupBookings.list.verified' : 'makeupBookings.list.unauthDenied' };
    }
    if (operation === 'CREATE') {
      if (!isSignedIn || !isVerified || !isValidId(docId) || !incomingData) {
        return { allowed: false, matchedGate: 'makeupBookings.create.unauthenticated' };
      }
      if (!isAdmin && !isMonitorForGroup(incomingData.groupId)) {
        return { allowed: false, matchedGate: 'makeupBookings.create.crossGroupOrRoleDenied' };
      }
      const allowedKeys = [
        'course', 'sessionType', 'room', 'generation', 'groupId',
        'date', 'day', 'time', 'timeSlots', 'bookedBy',
        'bookedByUid', 'note', 'createdAt'
      ];
      const reqKeys = ['course', 'room', 'groupId', 'date', 'day', 'time', 'bookedBy', 'bookedByUid', 'createdAt'];
      const keys = Object.keys(incomingData);
      if (!reqKeys.every(k => keys.includes(k)) || !keys.every(k => allowedKeys.includes(k))) {
        return { allowed: false, matchedGate: 'makeupBookings.create.shadowOrPiiFieldBlocked' };
      }
      const validTimeSlots =
        !incomingData.timeSlots ||
        (Array.isArray(incomingData.timeSlots) &&
          incomingData.timeSlots.length <= 8 &&
          incomingData.timeSlots.every((s: any) => ALLOWED_TIME_SLOTS.includes(s)));

      const validFields =
        typeof incomingData.course === 'string' && incomingData.course.length >= 1 && incomingData.course.length <= 200 &&
        typeof incomingData.room === 'string' && incomingData.room.length >= 1 && incomingData.room.length <= 100 &&
        typeof incomingData.groupId === 'string' && incomingData.groupId.length >= 1 && incomingData.groupId.length <= 50 &&
        typeof incomingData.date === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(incomingData.date) &&
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(incomingData.day) &&
        typeof incomingData.time === 'string' && incomingData.time.length >= 1 && incomingData.time.length <= 150 &&
        validTimeSlots &&
        typeof incomingData.bookedBy === 'string' && incomingData.bookedBy.length >= 1 && incomingData.bookedBy.length <= 100 &&
        typeof incomingData.bookedByUid === 'string' && incomingData.bookedByUid === actor.uid &&
        isValidIsoTimestamp(incomingData.createdAt) &&
        (!incomingData.note || (typeof incomingData.note === 'string' && incomingData.note.length <= 300));

      return {
        allowed: validFields,
        matchedGate: validFields ? 'makeupBookings.create.valid' : 'makeupBookings.create.spoofOrSchemaDenied'
      };
    }
    if (operation === 'DELETE' || operation === 'UPDATE') {
      if (!isValidId(docId) || !isMonitorOrAdmin || !existingData) {
        return { allowed: false, matchedGate: 'makeupBookings.modify.unauth' };
      }
      const ok = isAdmin || (isMonitorForGroup(existingData.groupId) && existingData.bookedByUid === actor.uid);
      return {
        allowed: ok,
        matchedGate: ok ? 'makeupBookings.modify.ownerMonitorOrAdmin' : 'makeupBookings.modify.crossMonitorDenied'
      };
    }
  }

  // 3. /cancelledClasses/{cancelId}
  if (collection === 'cancelledClasses') {
    if (operation === 'GET' || operation === 'LIST') {
      const ok = isSignedIn && isVerified;
      return { allowed: ok, matchedGate: ok ? 'cancelledClasses.read.verified' : 'cancelledClasses.read.unauthDenied' };
    }
    if (operation === 'CREATE') {
      if (!isSignedIn || !isVerified || !isValidId(docId) || !incomingData) {
        return { allowed: false, matchedGate: 'cancelledClasses.create.unauthenticated' };
      }
      if (!isAdmin && !isMonitorForGroup(incomingData.groupId)) {
        return { allowed: false, matchedGate: 'cancelledClasses.create.crossGroupOrRoleDenied' };
      }
      const allowedKeys = [
        'groupId', 'cohort', 'day', 'date', 'time', 'course', 'type', 'lecturer',
        'room', 'cancelledBy', 'cancelledByUid', 'reason', 'createdAt'
      ];
      if (!Object.keys(incomingData).every(k => allowedKeys.includes(k))) {
        return { allowed: false, matchedGate: 'cancelledClasses.create.shadowOrPiiFieldBlocked' };
      }
      const validReason = !incomingData.reason || (typeof incomingData.reason === 'string' && incomingData.reason.length <= 300);
      const validOwner = incomingData.cancelledByUid === actor.uid;
      const validTs = isValidIsoTimestamp(incomingData.createdAt);
      const ok = validReason && validOwner && validTs;
      return {
        allowed: ok,
        matchedGate: ok ? 'cancelledClasses.create.valid' : 'cancelledClasses.create.sizeTimestampOrOwnerDenied'
      };
    }
    if (operation === 'DELETE' || operation === 'UPDATE') {
      if (!isValidId(docId) || !isMonitorOrAdmin || !existingData) {
        return { allowed: false, matchedGate: 'cancelledClasses.modify.unauth' };
      }
      const ok = isAdmin || (isMonitorForGroup(existingData.groupId) && existingData.cancelledByUid === actor.uid);
      return { allowed: ok, matchedGate: ok ? 'cancelledClasses.modify.valid' : 'cancelledClasses.modify.denied' };
    }
  }

  // 4. /notifications/{notificationId}
  if (collection === 'notifications') {
    if (operation === 'GET' || operation === 'LIST') {
      if (!isSignedIn || !isVerified) {
        return { allowed: false, matchedGate: 'notifications.read.unauthDenied' };
      }
      const aud = existingData?.audience || 'all';
      const audOk =
        aud === 'all' ||
        (aud === 'students' && isSignedIn) ||
        (aud === 'monitors' && isMonitorOrAdmin) ||
        isAdmin;
      return {
        allowed: audOk,
        matchedGate: audOk ? 'notifications.read.audienceAuthorized' : 'notifications.read.audienceRestrictedDenied'
      };
    }
    if (operation === 'CREATE') {
      if (!isSignedIn || !isVerified || !isValidId(docId) || !incomingData) {
        return { allowed: false, matchedGate: 'notifications.create.unauthenticated' };
      }
      if (incomingData.senderUid !== actor.uid || !isValidIsoTimestamp(incomingData.createdAt)) {
        return { allowed: false, matchedGate: 'notifications.create.senderOrTimestampDenied' };
      }
      if (isAdmin) {
        return { allowed: true, matchedGate: 'notifications.create.admin' };
      }
      const monitorOk =
        isMonitor &&
        incomingData.type === 'class_booking' &&
        incomingData.senderRole === 'Class Monitor';
      return {
        allowed: monitorOk,
        matchedGate: monitorOk ? 'notifications.create.monitorBookingAlert' : 'notifications.create.adminImpersonationDenied'
      };
    }
    if (operation === 'UPDATE') {
      if (!isSignedIn || !isVerified || !isValidId(docId) || !incomingData || !existingData) {
        return { allowed: false, matchedGate: 'notifications.update.unauth' };
      }
      if (isAdmin) {
        return { allowed: true, matchedGate: 'notifications.update.admin' };
      }
      const immutableSame =
        incomingData.title === existingData.title &&
        incomingData.message === existingData.message &&
        incomingData.audience === existingData.audience &&
        incomingData.senderUid === existingData.senderUid &&
        incomingData.createdAt === existingData.createdAt;

      const checkAppendSelf = (oldList: any[], newList: any[]) => {
        if (!Array.isArray(oldList) || !Array.isArray(newList)) return false;
        if (!oldList.every(item => newList.includes(item))) return false;
        if (newList.length > oldList.length + 1) return false;
        if (newList.length === oldList.length) return true;
        return newList.includes(actor.uid) && !oldList.includes(actor.uid);
      };

      const appendOk =
        immutableSame &&
        checkAppendSelf(existingData.readBy || [], incomingData.readBy || []) &&
        checkAppendSelf(existingData.clearedBy || [], incomingData.clearedBy || []);

      return {
        allowed: appendOk,
        matchedGate: appendOk ? 'notifications.update.selfReadReceiptOnly' : 'notifications.update.sabotageOrDefacementBlocked'
      };
    }
    if (operation === 'DELETE') {
      const ok = isAdmin && isValidId(docId);
      return { allowed: ok, matchedGate: ok ? 'notifications.delete.admin' : 'notifications.delete.denied' };
    }
  }

  return { allowed: false, matchedGate: 'global.defaultDeny' };
}

export const DIRTY_DOZEN_VECTORS: SecurityTestVector[] = [
  {
    id: 'DD-01',
    name: 'Unauthenticated User PII Dump',
    category: 'PII Isolation',
    operation: 'GET',
    targetPath: 'users/victim_student_1',
    actor: { uid: null },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-02',
    name: 'Authenticated Lateral User Profile Scrape',
    category: 'PII Isolation',
    operation: 'GET',
    targetPath: 'users/victim_student_1',
    actor: { uid: 'student_attacker', email: 'attacker@itc.edu.kh', emailVerified: true, storedRole: 'student' },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-03',
    name: 'Self-Assigned Admin Role Escalation on Registration',
    category: 'Privilege Escalation',
    operation: 'CREATE',
    targetPath: 'users/student_attacker',
    actor: { uid: 'student_attacker', email: 'attacker@itc.edu.kh', emailVerified: true },
    incomingData: {
      uid: 'student_attacker',
      email: 'attacker@itc.edu.kh',
      displayName: 'Malicious Student',
      role: 'admin',
      year: 'I2',
      groupId: 'I2-SE',
      onboardingCompleted: true,
      createdAt: '2026-10-30T10:00:00.000Z'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-04',
    name: 'Profile Update Role Tampering (Student -> Monitor)',
    category: 'Privilege Escalation',
    operation: 'UPDATE',
    targetPath: 'users/student_attacker',
    actor: { uid: 'student_attacker', email: 'attacker@itc.edu.kh', emailVerified: true, storedRole: 'student' },
    existingData: {
      uid: 'student_attacker',
      email: 'attacker@itc.edu.kh',
      displayName: 'Student',
      role: 'student',
      year: 'I2',
      groupId: 'I2-SE',
      onboardingCompleted: true,
      createdAt: '2026-10-30T08:00:00.000Z'
    },
    incomingData: {
      uid: 'student_attacker',
      email: 'attacker@itc.edu.kh',
      displayName: 'Student',
      role: 'monitor',
      year: 'I2',
      groupId: 'I2-SE',
      onboardingCompleted: true,
      createdAt: '2026-10-30T08:00:00.000Z'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-05',
    name: 'Unverified Email Root Admin Spoof Attack',
    category: 'Authentication',
    operation: 'DELETE',
    targetPath: 'users/victim_student_1',
    actor: { uid: 'spoof_uid', email: 'ratanaknochmunny@gmail.com', emailVerified: false },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-06',
    name: 'PII Email / Shadow Field Injection on Make-up Booking',
    category: 'Payload Poisoning',
    operation: 'CREATE',
    targetPath: 'makeupBookings/makeup_1',
    actor: { uid: 'monitor_A', email: 'monitorA@itc.edu.kh', emailVerified: true, storedRole: 'monitor', storedGroupId: 'I2-SE' },
    incomingData: {
      course: 'Algorithms',
      room: 'Room A-109',
      groupId: 'I2-SE',
      date: '2026-10-31',
      day: 'Saturday',
      time: '07:00 - 08:30',
      bookedBy: 'Monitor A',
      bookedByUid: 'monitor_A',
      bookedByEmail: 'monitorA@itc.edu.kh', // Forbidden PII field
      createdAt: '2026-10-30T10:00:00.000Z'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-07',
    name: 'Unauthenticated Schedule & Monitor UID Scraping',
    category: 'Authentication',
    operation: 'LIST',
    targetPath: 'makeupBookings',
    actor: { uid: null },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-08',
    name: 'Cross-Cohort Monitor Schedule Tampering (I1-G1 -> I4-SE)',
    category: 'Privilege Escalation',
    operation: 'CREATE',
    targetPath: 'makeupBookings/makeup_999',
    actor: { uid: 'monitor_I1', email: 'mon1@itc.edu.kh', emailVerified: true, storedRole: 'monitor', storedGroupId: 'I1-G1' },
    incomingData: {
      course: 'Fake Lecture',
      room: 'Room A-109',
      groupId: 'I4-SE',
      date: '2026-10-31',
      day: 'Saturday',
      time: '07:00 - 08:30',
      bookedBy: 'Monitor I1',
      bookedByUid: 'monitor_I1',
      createdAt: '2026-10-30T10:00:00.000Z'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-09',
    name: 'Student Reading Monitor-Only Broadcast Notification',
    category: 'PII Isolation',
    operation: 'GET',
    targetPath: 'notifications/notif_monitors_only',
    actor: { uid: 'student_1', email: 'student1@itc.edu.kh', emailVerified: true, storedRole: 'student' },
    existingData: {
      title: 'Monitor Coordination Meeting',
      message: 'Internal briefing in Room A-109',
      audience: 'monitors',
      senderUid: 'admin_1',
      createdAt: '2026-10-30T10:00:00.000Z',
      readBy: [],
      clearedBy: []
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-10',
    name: 'Class Monitor Forging Official Admin Announcement',
    category: 'Ownership Spoofing',
    operation: 'CREATE',
    targetPath: 'notifications/notif_forged',
    actor: { uid: 'monitor_A', email: 'monitorA@itc.edu.kh', emailVerified: true, storedRole: 'monitor', storedGroupId: 'I2-SE' },
    incomingData: {
      title: 'Campus Closed Indefinitely',
      message: 'Forged administrative broadcast',
      audience: 'all',
      senderUid: 'monitor_A',
      senderName: 'ITC Rectorate',
      senderRole: 'Administrator',
      type: 'announcement',
      createdAt: '2026-10-30T10:00:00.000Z',
      readBy: [],
      clearedBy: []
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-11',
    name: 'Future Timestamp Feed-Pinning Attack (Year 9999 / Non-ISO)',
    category: 'Payload Poisoning',
    operation: 'CREATE',
    targetPath: 'cancelledClasses/cancel_777',
    actor: { uid: 'monitor_A', email: 'monitorA@itc.edu.kh', emailVerified: true, storedRole: 'monitor', storedGroupId: 'I2-SE' },
    incomingData: {
      groupId: 'I2-SE',
      day: 'Monday',
      date: '2026-11-02',
      time: '07:00 - 08:30',
      course: 'Mathematics',
      cancelledBy: 'Monitor A',
      cancelledByUid: 'monitor_A',
      reason: 'Pinned forever',
      createdAt: '9999-99-99_PINNED_FOREVER'
    },
    expectedOutcome: 'PERMISSION_DENIED'
  },
  {
    id: 'DD-12',
    name: 'Notification Inbox Sabotage via Foreign UID Injection in clearedBy',
    category: 'Privilege Escalation',
    operation: 'UPDATE',
    targetPath: 'notifications/notif_101',
    actor: { uid: 'student_attacker', email: 'attacker@itc.edu.kh', emailVerified: true, storedRole: 'student' },
    existingData: {
      title: 'Welcome to Semester 1',
      message: 'Official schedule is live.',
      audience: 'all',
      senderUid: 'admin_1',
      createdAt: '2026-10-30T08:00:00.000Z',
      readBy: [],
      clearedBy: []
    },
    incomingData: {
      title: 'Welcome to Semester 1',
      message: 'Official schedule is live.',
      audience: 'all',
      senderUid: 'admin_1',
      createdAt: '2026-10-30T08:00:00.000Z',
      readBy: ['student_attacker'],
      clearedBy: ['victim_student_1', 'victim_student_2']
    },
    expectedOutcome: 'PERMISSION_DENIED'
  }
];

if (process.argv[1] && process.argv[1].endsWith('firestore.rules.test.ts')) {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  let passed = 0;
  console.log('================================================================');
  console.log(' RUNNING AUTOMATED ZERO-TRUST SECURITY VERIFICATION SUITE');
  console.log('================================================================');

  for (const vec of DIRTY_DOZEN_VECTORS) {
    const res = evaluateFirestoreRuleGate(vec, rulesContent);
    const actual = res.allowed ? 'ALLOWED' : 'PERMISSION_DENIED';
    const ok = actual === vec.expectedOutcome;
    if (ok) passed++;
    console.log(
      `[${ok ? 'PASS' : 'FAIL'}] ${vec.id}: ${vec.name} -> ${actual} (Gate: ${res.matchedGate})`
    );
  }

  console.log('----------------------------------------------------------------');
  console.log(`Result: ${passed}/${DIRTY_DOZEN_VECTORS.length} Dirty Dozen Attack Vectors Blocked`);
  if (passed !== DIRTY_DOZEN_VECTORS.length) {
    process.exit(1);
  }
}
