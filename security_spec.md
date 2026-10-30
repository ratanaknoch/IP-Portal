# Phase 0: Payload-First Security TDD Specification (`security_spec.md`)

## 1. Data Invariants & Access Laws

1. **Global Default-Deny Gate**: Any path not explicitly matched in `/databases/{database}/documents` is unconditionally denied (`allow read, write: if false;`).
2. **PII Isolation on `/users/{userId}`**:
   - Anonymous visitors and standard students (`role == 'student'`) or monitors (`role == 'monitor'`) can NEVER read (`get` or `list`) another user's profile document.
   - `get` is permitted strictly to `isOwner(userId)` or `isAdmin()`.
   - `list` is permitted strictly to `isAdmin()` (or `resource.data.uid == request.auth.uid`).
3. **Zero Self-Promotion (Privilege Escalation Guard)**:
   - On `create` of `/users/{userId}`, `userId` must equal `request.auth.uid`, `incoming().uid == request.auth.uid`, `incoming().email == request.auth.token.email`, `isValidIsoTimestamp(incoming().createdAt)`, and `incoming().role` MUST be `'student'` (unless `request.auth.token.email == 'ratanaknochmunny@gmail.com'` and `request.auth.token.email_verified == true`, which may bootstrap as `'admin'`).
   - On `update` of `/users/{userId}` by a non-admin owner, `incoming().role == existing().role`, `incoming().uid == existing().uid`, `incoming().email == existing().email`, and `incoming().createdAt == existing().createdAt` (Immortal Fields).
4. **Authenticated & Cohort-Scoped Schedule Writes (`/makeupBookings/{bookingId}` & `/cancelledClasses/{cancelId}`)**:
   - `get` and `list` require `isSignedIn() && isVerified()` to prevent unauthenticated scraping, and personal email fields (`bookedByEmail`, `cancelledByEmail`) are forbidden from storage (`hasOnly`).
   - `create` is restricted strictly to `isAdmin() || isMonitorForGroup(incoming().groupId)`, requires `incoming().bookedByUid == request.auth.uid` (or `cancelledByUid == request.auth.uid`), enforces strict `timeSlots` allowlists, and validates `isValidIsoTimestamp(incoming().createdAt)`.
   - `update` and `delete` are restricted strictly to `isAdmin()` OR (`isMonitorForGroup(existing().groupId)` and `existing().bookedByUid == request.auth.uid` / `existing().cancelledByUid == request.auth.uid`).
5. **Audience-Scoped Notification Broadcast & Monotonic Self-UID Read-Receipts (`/notifications/{notificationId}`)**:
   - `get` and `list` require `isSignedIn() && isVerified()` AND enforce server-side audience RBAC (`resource.data.audience == 'all' || (resource.data.audience == 'students' && isSignedIn()) || (resource.data.audience == 'monitors' && isMonitorOrAdmin()) || isAdmin()`).
   - `create` requires `incoming().senderUid == request.auth.uid`, `isValidIsoTimestamp(incoming().createdAt)`, and restricts `type == 'announcement'` / `senderRole == 'Administrator'` strictly to `isAdmin()` (monitors may only create `type == 'class_booking'` with `senderRole == 'Class Monitor'`).
   - `update` by non-admin users is restricted strictly to `affectedKeys().hasOnly(['readBy', 'clearedBy'])` AND monotonic self-UID append (`isAppendingOwnUidOnly()`), preventing users from wiping arrays or injecting other users' UIDs into `clearedBy`.
   - `delete` is restricted strictly to `isAdmin()`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Name | Target Path & Operation | Adversarial Payload / Context | Expected Result |
| :- | :--- | :--- | :--- | :--- |
| **01** | **Unauthenticated User PII Dump** | `GET /users/victim_student_1` | `auth = null` | `PERMISSION_DENIED` |
| **02** | **Authenticated Lateral PII Scrape** | `GET /users/victim_student_1` | `auth = { uid: 'attacker_uid', email_verified: true }` | `PERMISSION_DENIED` |
| **03** | **Self-Assigned Admin Escalation on Signup** | `CREATE /users/attacker_uid` | `{ uid: 'attacker_uid', email: 'attacker@itc.edu.kh', displayName: 'Hacker', role: 'admin', year: 'I2', groupId: 'I2-SE', onboardingCompleted: true, createdAt: '2026-10-30T10:00:00.000Z' }` | `PERMISSION_DENIED` |
| **04** | **Profile Update Role Tampering** | `UPDATE /users/attacker_uid` | Existing `role: 'student'` -> Incoming `role: 'monitor'` by non-admin owner | `PERMISSION_DENIED` |
| **05** | **Unverified Email Admin Spoof** | `DELETE /users/victim_student_1` | `auth = { uid: 'spoof_uid', token: { email: 'ratanaknochmunny@gmail.com', email_verified: false } }` | `PERMISSION_DENIED` |
| **06** | **Shadow Field / PII Email Injection on Booking** | `CREATE /makeupBookings/makeup_1` | Monitor attempts to inject `bookedByEmail` or undeclared fields | `PERMISSION_DENIED` |
| **07** | **Unauthenticated Schedule Scraping** | `LIST /makeupBookings` | `auth = null` attempting to scrape classroom bookings & UIDs | `PERMISSION_DENIED` |
| **08** | **Cross-Group Monitor Schedule Tampering** | `CREATE /makeupBookings/makeup_999` | Monitor of `I1-G1` attempts to book or cancel a class for `I4-SE` | `PERMISSION_DENIED` |
| **09** | **Student Reading Monitor-Only Broadcast** | `GET /notifications/notif_monitors` | Student attempts to read notification with `audience: 'monitors'` | `PERMISSION_DENIED` |
| **10** | **Monitor Forging Official Admin Announcement** | `CREATE /notifications/notif_fake` | Monitor submits `{ type: 'announcement', senderRole: 'Administrator', ... }` | `PERMISSION_DENIED` |
| **11** | **Future Timestamp Feed-Pinning Attack** | `CREATE /cancelledClasses/cancel_777` | Monitor submits non-ISO or malformed timestamp `createdAt: '9999-99-99'` | `PERMISSION_DENIED` |
| **12** | **Notification Inbox Sabotage via `clearedBy` Spoofing** | `UPDATE /notifications/notif_1` | Student injects `victim_uid` into `clearedBy` or wipes `readBy: []` | `PERMISSION_DENIED` |
