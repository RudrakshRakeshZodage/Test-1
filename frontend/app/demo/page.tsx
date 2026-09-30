"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, CheckCircle2, RotateCcw, Heart, Trophy, Users,
  ExternalLink, ArrowRight, ShieldCheck, Play, Award, Zap
} from "lucide-react";
import { fetchStats, fetchPeople, fetchDates, triggerSeedDemo, Stats, Person, DateSession } from "@/lib/api";
import { SourceBadge } from "@/components/SourceBadge";

export default function DemoHubPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [dates, setDates] = useState<DateSession[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, p, d] = await Promise.all([
        fetchStats(),
        fetchPeople(),
        fetchDates()
      ]);
      setStats(s);
      setPeople(p);
      setDates(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetSeed = async () => {
    if (!confirm("Reset database to clean 25-person demo state?")) return;
    try {
      setSeeding(true);
      await triggerSeedDemo();
      await loadData();
      alert("Demo dataset successfully reset with 25 people, analyzed profiles, dates, and rankings!");
    } catch (err: any) {
      alert("Failed to seed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Award className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Judges & Demo Explorer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Demo Showcase Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore 25 fully analyzed tech professionals with precomputed agent dating dialogues and explainable rankings.
          </p>
        </div>

        {/* 1-Click Reset Button */}
        <button
          onClick={handleResetSeed}
          disabled={seeding}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 bg-white text-slate-800 text-xs font-semibold shadow-xs transition"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${seeding ? "animate-spin text-indigo-600" : ""}`} />
          <span>{seeding ? "Resetting Seed..." : "Reset 25-Person Demo Seed"}</span>
        </button>
      </div>

      {/* Demo Walkthrough Guide (3-Minute Tour Sequence) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Recommended 3-Minute Hackathon Evaluation Flow</span>
          </span>
          <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
            Self-Contained Demo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-amber-400 block mb-1">1. Explore People</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Open Elena Rostova or Marcus Vance. Note exact source attribution (LinkedIn & Instagram).
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-indigo-400 block mb-1">2. Verify Evidence</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Check that every skill and hobby has verified citations without sensitive trait inference.
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-rose-400 block mb-1">3. Dating Arena</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Simulate live multi-turn date between two agents. Watch dynamic turn generation and breakdown.
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-emerald-400 block mb-1">4. Explainable Rankings</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Inspect personalized candidate rankings. See why agents connected based on real date dialogues.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total People</span>
          <span className="text-2xl font-black text-slate-900">{stats?.people_count ?? 25}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">100% Precomputed</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Agents</span>
          <span className="text-2xl font-black text-slate-900">{stats?.agents_count ?? 25}</span>
          <span className="text-[11px] text-indigo-600 block mt-0.5">Strictly Grounded</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Dates</span>
          <span className="text-2xl font-black text-slate-900">{stats?.dates_count ?? 8}</span>
          <span className="text-[11px] text-rose-600 block mt-0.5">Multi-Turn Dialogues</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Rankings Matrix</span>
          <span className="text-2xl font-black text-slate-900">{stats?.rankings_count ?? 600}</span>
          <span className="text-[11px] text-amber-600 block mt-0.5">Pairwise Explained</span>
        </div>
      </div>

      {/* Precomputed Completed Dates Showcase */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Completed Dating Sessions</h3>
            <p className="text-xs text-slate-500">
              Explore authentic conversations simulated between autonomous person agents
            </p>
          </div>
          <Link
            href="/dating"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Launch Dating Arena →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dates.map((d) => (
            <div
              key={d.id}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                  <span className="font-bold text-xs text-slate-900">
                    {d.person_a?.name} & {d.person_b?.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {d.compatibility_score}% Match
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {d.assessment || "Engaging conversation with demonstrated overlap in engineering craft and lifestyle."}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-400 text-[11px]">{d.messages?.length || 8} Turns Recorded</span>
                <Link
                  href={`/dating/${d.id}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Read Transcript</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 25 Demo Profiles Directory Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">All 25 Seeded Demo Profiles</h3>
            <p className="text-xs text-slate-500">
              Technology practitioners with strictly public LinkedIn and Instagram sources
            </p>
          </div>
          <Link
            href="/people"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Browse in People Directory →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {people.map((p) => (
            <div
              key={p.id}
              className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={p.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <Link
                    href={`/people/${p.id}`}
                    className="font-semibold text-xs text-slate-900 hover:text-indigo-600 truncate block"
                  >
                    {p.name}
                  </Link>
                  <span className="text-[10px] text-slate-500 truncate block">{p.headline}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <Link
                  href={`/rankings/${p.id}`}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100"
                  title="View Rankings"
                >
                  <Trophy className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/dating?personA=${p.id}`}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                  title="Simulate Date"
                >
                  <Heart className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
