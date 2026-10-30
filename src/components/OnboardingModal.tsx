import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  User, 
  Mail, 
  ArrowRight
} from 'lucide-react';
import { UserProfile, UserRole, AcademicYear, getUserProfile, saveUserProfile, BOOTSTRAPPED_ADMIN_EMAIL } from '../lib/firebase';
import { SCHEDULE_DATA } from '../data/scheduleData';
import MetallicPaint from './MetallicPaint';

interface OnboardingModalProps {
  isOpen: boolean;
  currentUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingModal({
  isOpen,
  currentUser,
  onComplete
}: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState(
    currentUser.displayName || currentUser.email?.split('@')[0] || 'ITC Student'
  );
  const [year, setYear] = useState<AcademicYear>('I1');
  const [groupId, setGroupId] = useState('I1-G1');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const isRootAdmin =
    currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  // Filter available groups based on selected cohort/year
  const availableGroups = SCHEDULE_DATA.groups.filter((g) => g.cohort === year);

  const handleYearChange = (newYear: AcademicYear) => {
    setYear(newYear);
    if (newYear === 'Alumni') {
      setGroupId('Alumni');
      return;
    }
    if (newYear === 'I5') {
      setGroupId('I5');
      return;
    }
    const firstGroup = SCHEDULE_DATA.groups.find((g) => g.cohort === newYear);
    if (firstGroup) {
      setGroupId(firstGroup.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const existingProfile = await getUserProfile(currentUser.uid);
      const assignedRole: UserRole = isRootAdmin
        ? 'admin'
        : existingProfile?.role || 'student';
      const enforcedGroupId =
        existingProfile?.role === 'monitor' && existingProfile.groupId
          ? existingProfile.groupId
          : groupId;
      const enforcedYear =
        existingProfile?.role === 'monitor' && existingProfile.year
          ? existingProfile.year
          : year;

      const profile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || existingProfile?.email || 'student@itc.edu.kh',
        displayName: displayName.trim().slice(0, 100) || 'ITC Student',
        role: assignedRole,
        year: enforcedYear,
        groupId: enforcedGroupId,
        onboardingCompleted: true,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore (enforced by server-side security rules)
      await saveUserProfile(profile);

      // Auto bookmark their respected timetable
      try {
        localStorage.setItem('itc_my_cohort', enforcedGroupId);
        localStorage.setItem('itc_student_class_picked', 'true');
      } catch {
        // ignore
      }

      onComplete(profile);
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      setError(err.message || 'Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md selection:bg-sky-900 selection:text-white animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl text-white space-y-4">
        
        {/* Header with Metallic Liquid Logo */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Welcome to ITC Timetable
              </h3>
              <p className="text-sm text-slate-400">
                Set up your academic profile to bookmark your timetable.
              </p>
            </div>
          </div>

          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
            <MetallicPaint
              imageSrc="/assets/cropped-itc_tight.png"
              color="#38bdf8"
              edgeBend={0.8}
              softness={0.18}
              distortion={0.06}
              speed={1.0}
              mouseTilt={0.6}
              scale={0.8}
              className="w-full h-full"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* Email (Read-only from Google) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Google Account</span>
              </label>
              <input
                type="text"
                disabled
                value={currentUser.email || 'N/A'}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-400 font-mono text-sm cursor-not-allowed"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Display Name *</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-hidden focus:border-sky-400"
              />
            </div>
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                Academic Year / Status *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {year === 'Alumni' 
                  ? 'ITC Graduate' 
                  : year === 'I5' 
                  ? 'Final Year (PFE & Thesis)' 
                  : `Foundation & Specialization (${year})`}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              {(['I1', 'I2', 'I3', 'I4', 'I5', 'Alumni'] as const).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleYearChange(y)}
                  className={`py-2 px-1 text-center text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis ${
                    year === y
                      ? y === 'Alumni'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-sky-500 text-slate-950 shadow-xs'
                      : y === 'Alumni'
                      ? 'text-amber-400 hover:text-amber-200 hover:bg-slate-850'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Group / Class Selection or Status Notice */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300">
              {year === 'Alumni' || year === 'I5' ? 'Academic Status *' : `Class / Specialization (${year}) *`}
            </label>
            {year === 'Alumni' ? (
              <div className="px-3.5 py-2.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-amber-200 text-xs sm:text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ITC Alumni & Engineering Graduate (Access to all timetables and archives)</span>
              </div>
            ) : year === 'I5' ? (
              <div className="px-3.5 py-2.5 bg-sky-950/40 border border-sky-800/80 rounded-xl text-sky-200 text-xs sm:text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>I5 Final Year Engineering (PFE Thesis & Capstone Defense)</span>
              </div>
            ) : (
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-sky-400 cursor-pointer"
              >
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.id} — {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Role Verification Notice (Zero-Trust Google Auth Role Enforcement) */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Account Access Level</span>
              </span>
              <span className="font-mono font-bold text-sky-300">
                {isRootAdmin ? 'Root Administrator' : 'Verified Student'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isRootAdmin
                ? 'Your verified Google email matches the root administrator account. Full Bongthom Admin permissions will be enabled.'
                : 'Class Monitor and Administrator permissions are verified via your Google account email in the Bongthom Admin Console.'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
