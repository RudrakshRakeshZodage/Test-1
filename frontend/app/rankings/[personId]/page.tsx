"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { fetchPersonRankings, fetchPerson, PersonRankings, Person } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";

export default function SinglePersonRankingsPage() {
  const params = useParams();
  const personId = params.id as string || (params.personId as string);

  const [person, setPerson] = useState<Person | null>(null);
  const [rankingsData, setRankingsData] = useState<PersonRankings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [p, r] = await Promise.all([
          fetchPerson(personId),
          fetchPersonRankings(personId)
        ]);
        setPerson(p);
        setRankingsData(r);
      } catch (err: any) {
        setError(err.message || "Failed to load rankings.");
      } finally {
        setLoading(false);
      }
    }
    if (personId) load();
  }, [personId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Calculating personalized candidate rankings...</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Rankings Not Found</h2>
        <p className="text-xs text-slate-500">{error || "Could not retrieve rankings."}</p>
        <Link href="/rankings" className="text-xs text-indigo-600 font-semibold">
          Back to Rankings Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href={`/people/${personId}`}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {person.name}'s Profile</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={person.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Personalized Matches for {person.name}
              </h1>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">{person.headline}</p>
          </div>
        </div>

        <Link
          href={`/dating?personA=${person.id}`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Heart className="w-3.5 h-3.5 fill-white/20" />
          <span>Start Date</span>
        </Link>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Ranked Compatibility Order
          </h2>
          <span className="text-xs text-slate-500">
            {rankingsData?.ranked_matches.length || 0} candidates analyzed
          </span>
        </div>

        {rankingsData && rankingsData.ranked_matches.length > 0 ? (
          <div className="space-y-4">
            {rankingsData.ranked_matches.map((match) => (
              <MatchCard key={match.id} match={match} subjectPersonId={personId} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No matches found.</p>
        )}
      </div>
    </div>
  );
}
