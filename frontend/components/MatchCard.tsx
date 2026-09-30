import Link from "next/link";
import { RankingItem } from "@/lib/api";
import { SourceBadge } from "./SourceBadge";
import { Heart, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Quote } from "lucide-react";

interface MatchCardProps {
  match: RankingItem;
  subjectPersonId: string;
}

export function MatchCard({ match, subjectPersonId }: MatchCardProps) {
  const strengthColor =
    match.strength === "Strong"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : match.strength === "Moderate"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4">
      {/* Top Header: Rank, Candidate Avatar, Name, Strength */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          {/* Rank Badge */}
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
            #{match.position}
          </div>

          {/* Candidate Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {match.candidate_image ? (
              <img
                src={match.candidate_image}
                alt={match.candidate_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-200">
                {match.candidate_name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/people/${match.candidate_person_id}`}
                className="font-semibold text-slate-900 text-base hover:text-indigo-600 transition"
              >
                {match.candidate_name}
              </Link>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{match.candidate_headline}</p>
          </div>
        </div>

        {/* Compatibility Percentage & Strength */}
        <div className="text-right shrink-0">
          <div className="text-xl font-black text-slate-900">{match.compatibility_score}%</div>
          <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded text-[11px] font-bold border ${strengthColor}`}>
            {match.strength}
          </span>
        </div>
      </div>

      {/* Sources */}
      <div className="flex items-center space-x-2">
        {match.candidate_linkedin && <SourceBadge platform="linkedin" url={match.candidate_linkedin} />}
        {match.candidate_instagram && <SourceBadge platform="instagram" url={match.candidate_instagram} />}
      </div>

      {/* Key Reasons & Shared Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
        {/* Reasons */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explainable Match Reasons</span>
          </span>
          <ul className="space-y-1 text-slate-600">
            {match.reasons.map((r, i) => (
              <li key={i} className="flex items-start space-x-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Shared & Complementary */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shared & Complementary Overlap</span>
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {match.shared_interests.slice(0, 4).map((interest, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                {interest}
              </span>
            ))}
            {match.complementary_interests.slice(0, 1).map((comp, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium">
                {comp}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Verifiable Conversation Evidence */}
      {match.conversation_evidence && match.conversation_evidence.length > 0 && (
        <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100/70 text-xs text-slate-600">
          <span className="font-semibold text-indigo-900 block mb-1 flex items-center space-x-1">
            <Quote className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dialogue & Profile Evidence</span>
          </span>
          <p className="italic text-slate-700 line-clamp-2">
            {match.conversation_evidence[0]}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        <Link
          href={`/people/${match.candidate_person_id}`}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium transition"
        >
          View Verified Profile →
        </Link>

        {match.date_id ? (
          <Link
            href={`/dating/${match.date_id}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
          >
            <Heart className="w-3.5 h-3.5 fill-white/20" />
            <span>Open Dating Session</span>
          </Link>
        ) : (
          <Link
            href={`/dating?personA=${subjectPersonId}&personB=${match.candidate_person_id}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
          >
            <Heart className="w-3.5 h-3.5 fill-white/20" />
            <span>Start Simulated Date</span>
          </Link>
        )}
      </div>
    </div>
  );
}
