import { Heart, Sparkles, CheckCircle2, Split, MessageSquareQuote, ShieldCheck } from "lucide-react";
import { DateSession } from "@/lib/api";

interface DateSummaryProps {
  session: DateSession;
}

export function DateSummary({ session }: DateSummaryProps) {
  const score = session.compatibility_score || 78;
  const strength = score >= 82 ? "Strong Compatibility" : score >= 70 ? "Moderate Resonance" : "Emerging Dynamic";
  const strengthColor =
    score >= 82
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 70
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mt-6 space-y-6">
      {/* Header score banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">Post-Date Compatibility Breakdown</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Synthesized from autonomous dialogue turns and verified profile overlap.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Compatibility Score
            </span>
            <span className="text-2xl font-black text-slate-900">{score}%</span>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${strengthColor}`}>
            {strength}
          </span>
        </div>
      </div>

      {/* Grid of Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Shared Interests */}
        <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-xs mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Shared Interests</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {session.shared_interests && session.shared_interests.length > 0 ? (
              session.shared_interests.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No direct overlap recorded</li>
            )}
          </ul>
        </div>

        {/* Complementary Interests */}
        <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-indigo-800 font-semibold text-xs mb-3">
            <Heart className="w-4 h-4 text-indigo-600" />
            <span>Complementary Synergies</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {session.complementary_interests && session.complementary_interests.length > 0 ? (
              session.complementary_interests.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">Complementary balance noted</li>
            )}
          </ul>
        </div>

        {/* Differences */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs mb-3">
            <Split className="w-4 h-4 text-slate-500" />
            <span>Documented Differences</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {session.differences && session.differences.length > 0 ? (
              session.differences.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No significant friction points</li>
            )}
          </ul>
        </div>
      </div>

      {/* Conversation Evidence Quotes */}
      {session.evidence && session.evidence.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs mb-3">
            <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
            <span>Verifiable Dialogue Evidence</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {session.evidence.map((ev, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-indigo-700 block mb-1">{ev.speaker}</span>
                <p className="text-slate-600 italic">"{ev.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Assessment */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block mb-1">
          Agent Synthesis Assessment
        </span>
        <p className="text-xs text-slate-700 leading-relaxed">
          {session.assessment || "Both agents completed an engaging multi-turn dialogue with verified profile grounding."}
        </p>
      </div>
    </div>
  );
}
