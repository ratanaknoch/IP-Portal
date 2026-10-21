import { Users, Sparkles, Calendar, ArrowRight, ExternalLink, ShieldCheck, Cpu, Code2, Globe } from 'lucide-react';

export function ClubsView() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Banner / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Under Development</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          ITC Engineering Student Clubs & Societies
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The official hub for student organizations, robotics chapters, competitive programming teams, and international engineering partnerships is currently being established.
        </p>
      </div>

      {/* Chapters Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="w-10 h-10 rounded-md bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Upcoming</span>
            <h3 className="text-base font-bold text-white">Robotics & IoT Chapter</h3>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Autonomous systems, microcontrollers, sensor networks, and annual national robotics contests.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="w-10 h-10 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Upcoming</span>
            <h3 className="text-base font-bold text-white">AI & Competitive Coding</h3>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Machine learning study jams, algorithm training, hackathons, and ICPC regional competitions.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="w-10 h-10 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Upcoming</span>
            <h3 className="text-base font-bold text-white">International Student Association</h3>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Cultural exchanges, international symposiums, language peer-tutoring, and student welfare initiatives.
          </p>
        </div>

      </div>

      {/* Community Discord notice */}
      <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-white">Interested in starting or leading a chapter?</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Join the Community Discord to connect with fellow student leaders and class monitors.
          </p>
        </div>
        <a
          href="https://discord.gg/QH3rwPbwRm"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <span>Community Discord</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
