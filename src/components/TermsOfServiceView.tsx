import { ArrowLeft, FileText, Mail } from 'lucide-react';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export function TermsOfServiceView({ onBack }: TermsOfServiceViewProps) {
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
            <FileText className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Terms of Service
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Last updated: October 26, 2026 · Effective for IP-Portal (https://ip-portal.onrender.com)
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using IP-Portal (<code className="text-xs font-mono text-sky-300">https://ip-portal.onrender.com</code>), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may discontinue use of the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. Educational & Independent Project Disclaimer</h2>
            <p>
              IP-Portal is an independent, student-developed platform built to facilitate schedule coordination, room discovery, and make-up class organization for the Institute of Technology of Cambodia (ITC). While designed to support students and monitors, this platform is not an official administrative website of ITC.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. Acceptable Use of Room Reservation Services</h2>
            <p>Users and Class Monitors utilizing the Building A classroom reservation features agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Book rooms solely for genuine make-up classes, study sessions, or approved group academic activities.</li>
              <li>Avoid submitting false, misleading, or duplicate reservations that block classrooms from other cohorts.</li>
              <li>Comply with on-campus university facility regulations and building management rules.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. User Authentication & Responsibility</h2>
            <p>
              When signing in via Google, you are responsible for maintaining the security of your account and for all activities that occur under your session.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">5. Disclaimer of Warranties & Limitation of Liability</h2>
            <p>
              The platform is provided on an "as-is" and "as-available" basis without warranties of any kind. We strive to maintain maximum schedule accuracy, but users should cross-reference with official department announcements for official examination or curriculum deadlines.
            </p>
          </section>

          <section className="space-y-2 rounded-xl bg-slate-900 border border-slate-800 p-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Contact & Support</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              For any questions regarding these Terms of Service, contact:
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
