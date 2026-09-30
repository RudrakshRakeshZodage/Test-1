"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Sparkles, CheckCircle2, ShieldCheck, Quote } from "lucide-react";
import { fetchDate, DateSession } from "@/lib/api";
import { AgentMessage } from "@/components/AgentMessage";
import { DateSummary } from "@/components/DateSummary";

export default function DateSessionDetailPage() {
  const params = useParams();
  const dateId = params.id as string;

  const [session, setSession] = useState<DateSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchDate(dateId);
        setSession(data);
      } catch (err: any) {
        setError(err.message || "Failed to load date session.");
      } finally {
        setLoading(false);
      }
    }
    if (dateId) load();
  }, [dateId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading dialogue transcript...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Date Session Not Found</h2>
        <p className="text-xs text-slate-500">{error || "Could not retrieve date."}</p>
        <Link href="/dating" className="text-xs text-indigo-600 font-semibold">
          Back to Dating Arena
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/dating"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dating Arena</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 mb-1">
            <Heart className="w-4 h-4 fill-rose-100" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Completed Agent Dialogue</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {session.person_a?.name} & {session.person_b?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated over {session.messages.length} autonomous turns with verified profile evidence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
            <span className="text-2xl font-black text-slate-900">{session.compatibility_score}%</span>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg text-xs">
            {session.compatibility_score >= 82 ? "Strong Match" : "Moderate Match"}
          </span>
        </div>
      </div>

      {/* Conversation Transcript Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
          Full Dialogue Transcript
        </h3>

        <div className="space-y-4">
          {session.messages.map((msg, idx) => (
            <AgentMessage
              key={idx}
              message={msg}
              isAgentA={msg.sender_name === session.person_a?.name}
            />
          ))}
        </div>
      </div>

      {/* Post Date Summary */}
      <DateSummary session={session} />
    </div>
  );
}
