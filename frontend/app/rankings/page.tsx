"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Sparkles, ShieldCheck, Heart, User, Filter } from "lucide-react";
import { fetchPeople, fetchPersonRankings, Person, PersonRankings } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";

export default function RankingsOverviewPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");
  const [rankingsData, setRankingsData] = useState<PersonRankings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const pList = await fetchPeople();
        setPeople(pList);
        if (pList.length > 0) {
          setSelectedPersonId(pList[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadRankings() {
      if (!selectedPersonId) return;
      try {
        setLoadingRankings(true);
        const data = await fetchPersonRankings(selectedPersonId);
        setRankingsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRankings(false);
      }
    }
    loadRankings();
  }, [selectedPersonId]);

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-amber-600 mb-1">
          <Trophy className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">Explainable Compatibility</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personalized Rankings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Each person receives an individual compatibility ranking synthesized from semantic profile overlap and simulated agent dates.
        </p>
      </div>

      {/* Person Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Select Subject Person to View Personalized Compatibility
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {people.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPersonId(p.id)}
              className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                selectedPersonId === p.id
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <img
                src={p.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <span className="font-bold text-xs text-slate-900 block truncate">{p.name}</span>
                <span className="text-[11px] text-slate-500 block truncate">{p.headline}</span>
              </div>
            </button>
          ))}
        </div>

        {people.length > 6 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Or choose from all {people.length} profiles:</span>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white font-medium"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.headline?.slice(0, 40)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Rankings List */}
      <div className="space-y-4">
        {selectedPerson && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Top Matches for {selectedPerson.name}
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by multi-signal model combining profile overlap + dating depth
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {rankingsData?.ranked_matches.length || 0} Evaluated Candidates
            </span>
          </div>
        )}

        {loadingRankings ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-white border border-slate-200 rounded-xl animate-pulse p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-16 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : rankingsData && rankingsData.ranked_matches.length > 0 ? (
          <div className="space-y-4">
            {rankingsData.ranked_matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                subjectPersonId={selectedPersonId}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No rankings generated for this person yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
