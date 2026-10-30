import { useState, useMemo } from 'react';
import { 
  X, 
  GraduationCap, 
  Check, 
  ArrowRight, 
  Award, 
  AlertCircle,
  CalendarDays,
  BookmarkCheck
} from 'lucide-react';
import { SCHEDULE_DATA } from '../data/scheduleData';
import { UserProfile, AcademicYear, saveUserProfile } from '../lib/firebase';

interface AcademicStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile;
  onUpdateSuccess: (updatedProfile: UserProfile) => void;
}

export function AcademicStatusModal({
  isOpen,
  onClose,
  currentUserProfile,
  onUpdateSuccess
}: AcademicStatusModalProps) {
  // Years progression order
  const yearOptions: Array<{ id: AcademicYear; label: string; desc: string }> = [
    { id: 'I1', label: 'I1', desc: 'Foundation Year 1 (Tronc Commun)' },
    { id: 'I2', label: 'I2', desc: 'Foundation Year 2 (Tronc Commun)' },
    { id: 'I3', label: 'I3', desc: 'Specialization Year 3' },
    { id: 'I4', label: 'I4', desc: 'Specialization Year 4' },
    { id: 'I5', label: 'I5', desc: 'Final Year 5 (PFE & Capstone)' },
    { id: 'Alumni', label: 'Alumni', desc: 'Graduated / ITC Engineering Alumni' }
  ];

  // Derive initial year
  const initialYear = (currentUserProfile.year as AcademicYear) || 'I2';
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(initialYear);
  const [selectedGroup, setSelectedGroup] = useState<string>(currentUserProfile.groupId || 'I2-SE');
  const [promotionTag, setPromotionTag] = useState<string>(currentUserProfile.promotionYear || 'Academic Year 2026–2027');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Determine the next chronological step for the quick promote helper
  const nextPromotion = useMemo<{ nextYear: AcademicYear; defaultGroup: string; label: string } | null>(() => {
    switch (currentUserProfile.year) {
      case 'I1':
        return { nextYear: 'I2', defaultGroup: 'I2-SE', label: 'Promote to I2 (Year 2)' };
      case 'I2':
        return { nextYear: 'I3', defaultGroup: 'I3-SE', label: 'Promote to I3 (Year 3 Specialization)' };
      case 'I3':
        return { nextYear: 'I4', defaultGroup: 'I4-SE', label: 'Promote to I4 (Year 4 Specialization)' };
      case 'I4':
        return { nextYear: 'I5', defaultGroup: 'I5', label: 'Promote to I5 (Final Year PFE & Capstone)' };
      case 'I5':
        return { nextYear: 'Alumni', defaultGroup: 'Alumni', label: 'Graduate as ITC Alumni' };
      default:
        return null;
    }
  }, [currentUserProfile.year]);

  if (!isOpen) return null;

  const isMonitorRole = currentUserProfile.role === 'monitor';

  // Filter available groups for the selected year
  const availableGroups = SCHEDULE_DATA.groups.filter(g => g.cohort === selectedYear);

  const handleYearChange = (newYear: AcademicYear) => {
    if (isMonitorRole) return;
    setSelectedYear(newYear);
    setError('');
    if (newYear === 'Alumni') {
      setSelectedGroup('Alumni');
      return;
    }
    if (newYear === 'I5') {
      setSelectedGroup('I5');
      return;
    }

    // Try to preserve specialization prefix if possible (e.g. SE, AIECS)
    const currentSpecialization = currentUserProfile.groupId.split('-')[1];
    const matchingGroup = SCHEDULE_DATA.groups.find(
      g => g.cohort === newYear && currentSpecialization && g.id.includes(currentSpecialization)
    );

    if (matchingGroup) {
      setSelectedGroup(matchingGroup.id);
    } else {
      const firstInYear = SCHEDULE_DATA.groups.find(g => g.cohort === newYear);
      if (firstInYear) setSelectedGroup(firstInYear.id);
    }
  };

  const handleQuickPromote = () => {
    if (!nextPromotion || isMonitorRole) return;
    setSelectedYear(nextPromotion.nextYear);
    setSelectedGroup(nextPromotion.defaultGroup);
    setPromotionTag('Academic Year 2027–2028');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const enforcedYear = isMonitorRole ? currentUserProfile.year : selectedYear;
      const isAlumni = enforcedYear === 'Alumni';
      const isI5 = enforcedYear === 'I5';
      const finalGroupId = isMonitorRole
        ? currentUserProfile.groupId
        : isAlumni
        ? 'Alumni'
        : isI5
        ? 'I5'
        : selectedGroup;

      const updatedProfile: UserProfile = {
        ...currentUserProfile,
        year: enforcedYear,
        groupId: finalGroupId,
        isAlumni,
        promotionYear: promotionTag.trim(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      await saveUserProfile(updatedProfile);

      // Save to localStorage cache
      try {
        localStorage.setItem('itc_user_profile', JSON.stringify(updatedProfile));
        if (!isAlumni && !isI5 && finalGroupId) {
          localStorage.setItem('itc_my_cohort', finalGroupId);
        }
      } catch {
        // ignore
      }

      setSuccessMsg('Academic status updated successfully!');
      setTimeout(() => {
        onUpdateSuccess(updatedProfile);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to update academic status:', err);
      setError(err?.message || 'Could not update your academic profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl text-white space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Update Academic Status & Promotion
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Advance to next year, change cohort, or mark alumni graduation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Badge Card */}
        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 text-xs block">Current Registered Status:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-white text-sm">
                {currentUserProfile.displayName}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                currentUserProfile.year === 'Alumni'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-sky-950 text-sky-300 border border-sky-800'
              }`}>
                {currentUserProfile.year || 'Student'}
              </span>
              <span className="text-slate-300 font-mono text-xs">
                ({currentUserProfile.groupId || 'Unassigned'})
              </span>
            </div>
          </div>
          <BookmarkCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>

        {isMonitorRole && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs leading-relaxed">
            <strong className="text-amber-300">Class Monitor Cohort Lock:</strong> Because your account holds Class Monitor scheduling privileges for <code className="font-mono font-bold text-white">{currentUserProfile.groupId}</code>, your cohort and group assignment are locked to prevent cross-group privilege hopping. Contact a Bongthom Administrator if your assigned cohort needs to be reassigned.
          </div>
        )}

        {/* 1-Click Progression Helper (If eligible for promotion) */}
        {!isMonitorRole && nextPromotion && selectedYear === currentUserProfile.year && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-sky-300 text-xs font-bold uppercase tracking-wider">
                Next Academic Year Promotion
              </div>
              <p className="text-xs text-slate-300">
                {nextPromotion.label}
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickPromote}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <span>Advance +1 Year</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Year / Status Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300">
              Select Academic Year / Status *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              {yearOptions.map((opt) => {
                const isSelected = (isMonitorRole ? currentUserProfile.year : selectedYear) === opt.id;
                const isAlum = opt.id === 'Alumni';

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isMonitorRole}
                    onClick={() => handleYearChange(opt.id)}
                    className={`py-2 px-1 text-center rounded-lg transition-all font-bold text-xs sm:text-sm ${
                      isSelected
                        ? isAlum
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-sky-500 text-slate-950 shadow-sm'
                        : isAlum
                        ? 'text-amber-400 hover:text-amber-200 hover:bg-slate-850'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    } ${isMonitorRole ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={opt.desc}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional: Alumni Honorary Notice vs I5 Capstone Notice vs Class Selector */}
          {(isMonitorRole ? currentUserProfile.year : selectedYear) === 'Alumni' ? (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs sm:text-sm space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Congratulations, ITC Graduate & Alumni!</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Your profile will be recognized as an official ITC Alumni. You can continue accessing all timetables, room directories, faculty schedules, and academic archives anytime.
              </p>
            </div>
          ) : (isMonitorRole ? currentUserProfile.year : selectedYear) === 'I5' ? (
            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/80 text-sky-200 text-xs sm:text-sm space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
                <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Final Year Engineering (PFE & Capstone Thesis)</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                I5 engineering students conduct independent final year PFE internships and capstone defense research. No fixed weekly lecture schedule is assigned.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-300">
                Class / Specialization Group for {isMonitorRole ? currentUserProfile.year : selectedYear} *
              </label>
              <select
                value={isMonitorRole ? currentUserProfile.groupId : selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={isMonitorRole}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-sky-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.id} — {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Academic Promotion Tag / Note */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400">
              Academic Year Reference (e.g. Promotion Year)
            </label>
            <input
              type="text"
              value={promotionTag}
              onChange={(e) => setPromotionTag(e.target.value)}
              placeholder="e.g. Academic Year 2026–2027 or Promotion 43"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs sm:text-sm focus:outline-hidden focus:border-sky-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs sm:text-sm text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                selectedYear === 'Alumni'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
