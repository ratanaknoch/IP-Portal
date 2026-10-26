import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Lock, 
  User, 
  Mail, 
  ArrowRight
} from 'lucide-react';
import { UserProfile, UserRole, AcademicYear, saveUserProfile } from '../lib/firebase';
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
  const [role, setRole] = useState<UserRole>('student');
  
  // Monitor password requirement: "Bigboss@67"
  const [monitorPassword, setMonitorPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Filter available groups based on selected cohort/year
  const availableGroups = SCHEDULE_DATA.groups.filter((g) => g.cohort === year);

  const handleYearChange = (newYear: AcademicYear) => {
    setYear(newYear);
    if (newYear === 'Alumni') {
      setGroupId('Alumni');
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

    // If Monitor role is selected, verify password strictly
    if (role === 'monitor') {
      if (monitorPassword.trim() !== 'Bigboss@67') {
        setError('Incorrect Class Monitor Password. Please enter the valid monitor password.');
        return;
      }
    }

    setSaving(true);
    try {
      const profile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || 'student@itc.edu.kh',
        displayName: displayName.trim(),
        role,
        year,
        groupId,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      await saveUserProfile(profile);

      // Auto bookmark their respected timetable
      try {
        localStorage.setItem('itc_my_cohort', groupId);
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
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-hidden focus:border-sky-400"
              />
            </div>
          </div>

          {/* Academic Year Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1">
                Academic Year / Status *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                {(['I1', 'I2', 'I3', 'I4', 'I5', 'Alumni'] as const).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleYearChange(y)}
                    className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      year === y
                        ? y === 'Alumni'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-sky-500 text-slate-950 shadow-xs'
                        : y === 'Alumni'
                        ? 'text-amber-400 hover:text-amber-200'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Group / Class */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1">
                {year === 'Alumni' ? 'Alumni Community *' : 'Class / Specialization *'}
              </label>
              {year === 'Alumni' ? (
                <div className="px-3 py-2 bg-amber-950/40 border border-amber-800/80 rounded-lg text-amber-200 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>ITC Alumni & Engineering Graduate</span>
                </div>
              ) : (
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-sky-400 cursor-pointer"
                >
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.id}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300">
              Select Your Role *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRole('student'); setError(''); }}
                className={`py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-sky-950/70 border-sky-500 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Student</span>
                  {role === 'student' && <Check className="w-4 h-4 text-sky-400" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setRole('monitor'); setError(''); }}
                className={`py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer ${
                  role === 'monitor'
                    ? 'bg-amber-950/70 border-amber-500 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Class Monitor
                  </span>
                  {role === 'monitor' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              </button>
            </div>
          </div>

          {/* If Monitor is selected: require password */}
          {role === 'monitor' && (
            <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/80 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-300">
                <Lock className="w-4 h-4" />
                <span>Class Monitor Password *</span>
              </div>
              <input
                type="password"
                required
                value={monitorPassword}
                onChange={(e) => {
                  setMonitorPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter monitor password"
                className="w-full px-3 py-2 bg-slate-950 border border-amber-800/80 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-amber-400"
              />
            </div>
          )}

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
