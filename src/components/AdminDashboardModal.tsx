import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  Radio
} from 'lucide-react';
import { 
  UserProfile, 
  UserRole, 
  AppNotification, 
  subscribeToAllUsers, 
  saveUserProfile, 
  deleteUserProfile, 
  createNotification,
  subscribeToNotifications
} from '../lib/firebase';
import { SCHEDULE_DATA } from '../data/scheduleData';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminProfile: UserProfile;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  adminProfile
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'announcements'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'student' | 'monitor' | 'admin'>('ALL');

  // Announcement Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifAudience, setNotifAudience] = useState<'all' | 'monitors'>('all');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');

  // Add User Form Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [newUserYear, setNewUserYear] = useState<'I1' | 'I2' | 'I3' | 'I4'>('I1');
  const [newUserGroup, setNewUserGroup] = useState('I1-G1');
  const [addUserError, setAddUserError] = useState('');

  // Editing User
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Real-time subscriptions
  useEffect(() => {
    if (!isOpen) return;

    const unsubUsers = subscribeToAllUsers((remoteUsers) => {
      setUsers(remoteUsers);
    });

    const unsubNotifs = subscribeToNotifications('admin', (remoteNotifs) => {
      setNotifications(remoteNotifs);
    });

    return () => {
      unsubUsers();
      unsubNotifs();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.groupId.toLowerCase().includes(q) ||
        u.year.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    try {
      await saveUserProfile({
        ...targetUser,
        role: newRole
      });
    } catch (err) {
      console.error('Failed to change user role:', err);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Are you sure you want to remove this user from the directory?')) {
      return;
    }
    try {
      await deleteUserProfile(uid);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setSendingNotif(true);
    setNotifSuccess('');
    try {
      await createNotification({
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        audience: notifAudience,
        senderName: adminProfile.displayName || 'Administrator',
        senderRole: 'Administrator',
        type: 'announcement',
        createdAt: new Date().toISOString()
      });

      setNotifTitle('');
      setNotifMessage('');
      setNotifSuccess(`Announcement successfully broadcasted to ${notifAudience === 'all' ? 'everyone' : 'Class Monitors'}!`);
      setTimeout(() => setNotifSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to send announcement:', err);
    } finally {
      setSendingNotif(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    if (!newUserName.trim() || !newUserEmail.trim()) {
      setAddUserError('Name and email are required.');
      return;
    }

    const customUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      await saveUserProfile({
        uid: customUid,
        email: newUserEmail.trim().toLowerCase(),
        displayName: newUserName.trim(),
        role: newUserRole,
        year: newUserYear,
        groupId: newUserGroup,
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      });

      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('student');
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs selection:bg-amber-900 selection:text-white">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col text-white overflow-hidden animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Bongthom Portal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
                  Root Bongthom
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as <span className="text-amber-300 font-mono font-semibold">{adminProfile.displayName}</span> · Full access to user roles & broadcasts
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'users'
                  ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Management ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'announcements'
                  ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Announcement</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="mb-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'users' ? (
            <div className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, group..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Role:
                  </span>
                  {(['ALL', 'student', 'monitor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                        roleFilter === r
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {r === 'ALL' ? 'All' : r === 'admin' ? 'Bongthom' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      <tr>
                        <th className="px-4 py-3">User & Contact</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Cohort & Group</th>
                        <th className="px-4 py-3">Joined Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                            No users found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{u.displayName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                                className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border focus:outline-hidden ${
                                  u.role === 'admin'
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : u.role === 'monitor'
                                    ? 'bg-sky-950 text-sky-300 border-sky-800'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <option value="student">Student</option>
                                <option value="monitor">Class Monitor</option>
                                <option value="admin">Bongthom</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-slate-300 font-bold">
                                {u.year}
                              </span>
                              <span className="text-slate-400 text-[11px] ml-1.5">
                                ({u.groupId})
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.uid)}
                                title="Remove User"
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Broadcast Announcement Tab */
            <div className="space-y-6 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Send Notification Announcement</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Broadcast system notices or academic alerts directly to users' account inboxes. You can target Everyone or Class Monitors only.
                </p>
              </div>

              {notifSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{notifSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="e.g. Campus Holiday Notice or Examination Timetable"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-xs focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Audience *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNotifAudience('all')}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                        notifAudience === 'all'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span>Everyone (All Users)</span>
                        {notifAudience === 'all' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Students, monitors, and all accounts
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNotifAudience('monitors')}
                      className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                        notifAudience === 'monitors'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span>Class Monitors Only</span>
                        {notifAudience === 'monitors' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Restricted to authorized class monitors
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="Write your broadcast message details here..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-xs focus:outline-hidden focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingNotif ? 'Sending Broadcast...' : 'Send Broadcast Announcement'}</span>
                </button>
              </form>

              {/* Recent Announcements */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Announcements ({notifications.length})
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{n.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                            {n.audience}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {n.message}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          {new Date(n.createdAt).toLocaleString()} · {n.senderName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Logged in as Bongthom: {adminProfile.email}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Dashboard
          </button>
        </div>

      </div>

      {/* Add User Sub-Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Add New User to Directory</h4>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addUserError && (
              <div className="p-2.5 rounded bg-red-950/80 border border-red-800 text-red-200 text-xs">
                {addUserError}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Sok Sovann"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="student@itc.edu.kh"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                  >
                    <option value="student">Student</option>
                    <option value="monitor">Class Monitor</option>
                    <option value="admin">Bongthom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Cohort</label>
                  <select
                    value={newUserYear}
                    onChange={(e) => {
                      const y = e.target.value as any;
                      setNewUserYear(y);
                      const f = SCHEDULE_DATA.groups.find(g => g.cohort === y);
                      if (f) setNewUserGroup(f.id);
                    }}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                  >
                    <option value="I1">I1</option>
                    <option value="I2">I2</option>
                    <option value="I3">I3</option>
                    <option value="I4">I4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Group</label>
                <select
                  value={newUserGroup}
                  onChange={(e) => setNewUserGroup(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                >
                  {SCHEDULE_DATA.groups.filter(g => g.cohort === newUserYear).map(g => (
                    <option key={g.id} value={g.id}>{g.id}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
