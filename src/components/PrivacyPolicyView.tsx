import { ArrowLeft, Shield, Mail } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            IP-Portal Legal
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div className="space-y-1.5 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Last updated: October 26, 2026 · Effective for IP-Portal (https://ip-portal.onrender.com)
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Overview</h2>
            <p>
              IP-Portal ("we", "our", or "the platform") is an academic timetable and classroom reservation system built for students, class monitors, and faculty of the Institute of Technology of Cambodia (ITC). We respect your privacy and are committed to protecting any personal information collected through our web service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>Google Account Information:</strong> When you sign in with Google, we collect your name, email address, and profile photo provided by Google OAuth to create and identify your student profile.</li>
              <li><strong>Academic Preferences:</strong> Your selected academic cohort (e.g. I1–I5, Alumni) and group classification (e.g. SE, AIECS, CMIE).</li>
              <li><strong>Reservation Records:</strong> Room bookings, booked time slots, and optional booking notes submitted by class monitors.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. How We Use Your Information</h2>
            <p>Your information is used exclusively to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Display your customized class timetable and group schedule.</li>
              <li>Verify class monitor permissions when reserving make-up classrooms in Building A.</li>
              <li>Send real-time peer notifications to other class monitors when rooms are reserved.</li>
              <li>Maintain accurate academic status progression across academic years.</li>
            </ul>
            <p className="text-slate-400 text-xs">
              We do not sell, rent, monetize, or share your personal information with any third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. Data Storage & Security</h2>
            <p>
              All user profiles, schedules, and reservation records are stored using Google Cloud Firebase Firestore with strict Attribute-Based Access Control (ABAC) security rules. Access is protected through authenticated session tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">5. Your Data Rights & Deletion</h2>
            <p>
              You have the right to inspect, update, or request the permanent deletion of your profile and reservation records at any time. To request data deletion, contact us directly at the email below.
            </p>
          </section>

          <section className="space-y-2 rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Contact Us</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              If you have any questions regarding this Privacy Policy or data handling, please contact:
            </p>
            <p className="font-mono text-sky-300 text-xs sm:text-sm">
              Ratanak Noch Munny · <a href="mailto:ratanaknochmunny@gmail.com" className="underline hover:text-sky-200">ratanaknochmunny@gmail.com</a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        <p>Institute of Technology of Cambodia (ITC) · International Engineering School</p>
      </footer>
    </div>
  );
}
