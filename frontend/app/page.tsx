"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Heart, Trophy, Sparkles, ArrowRight, ShieldCheck,
  CheckCircle2, ArrowUpRight, Play, ExternalLink, Activity
} from "lucide-react";
import { fetchStats, fetchPeople, fetchDates, Stats, Person, DateSession } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { SourceBadge } from "@/components/SourceBadge";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [dates, setDates] = useState<DateSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
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
    }
    loadData();
  }, []);

  const featuredDate = dates.length > 0 ? dates[0] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Autonomous Multi-Agent Dating Protocol</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            AI agents date so you don't have to.
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Every real person is represented by an autonomous AI agent grounded strictly in exactly two public sources: LinkedIn and Instagram. Agents meet, simulate in-depth dates, and produce verifiable compatibility rankings.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/people/new"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30"
            >
              <span>Add Person</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dating"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-xs transition border border-white/10"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Dating Arena</span>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-sm border border-emerald-500/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore 25-Person Demo</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Dynamic Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="People"
          value={stats?.people_count ?? people.length ?? 25}
          subtitle="Grounded in public profiles"
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Active Agents"
          value={stats?.agents_count ?? people.length ?? 25}
          subtitle="Autonomous representatives"
          icon={Sparkles}
          color="emerald"
        />
        <StatCard
          label="Simulated Dates"
          value={stats?.dates_count ?? dates.length ?? 8}
          subtitle="Multi-turn grounded dialogues"
          icon={Heart}
          color="rose"
        />
        <StatCard
          label="Rankings Generated"
          value={stats?.rankings_count ?? 600}
          subtitle="Personalized compatibility scores"
          icon={Trophy}
          color="amber"
        />
      </section>

      {/* How it Works Pipeline */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">How Agentic Dating Works</h2>
            <p className="text-xs text-slate-500 mt-0.5">Strict source constraint with autonomous agent reasoning</p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-full">
            Zero Hallucinated Traits
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: "01", title: "Public LinkedIn", desc: "Professional skills, roles & public work" },
            { step: "02", title: "Public Instagram", desc: "Creative hobbies, visual passions & lifestyle" },
            { step: "03", title: "AI Profile Agent", desc: "Structured persona with source attribution" },
            { step: "04", title: "Agent-to-Agent Dates", desc: "Autonomous multi-turn simulated conversations" },
            { step: "05", title: "Compatibility Analysis", desc: "Shared interests & complementary synergies" },
            { step: "06", title: "Personalized Rankings", desc: "Explainable rankings with cited evidence" },
          ].map((item, idx) => (
            <div key={idx} className="relative p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                  {item.step}
                </span>
                <h4 className="font-semibold text-slate-800 text-xs mt-2">{item.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Section: Featured Date & Top Matches */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Date Session */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                <h3 className="font-bold text-slate-900 text-sm">Featured Completed Date</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {featuredDate?.compatibility_score || 88}% Match
              </span>
            </div>

            {featuredDate ? (
              <div className="mt-4 space-y-4">
                {/* Agents Banner */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={featuredDate.person_a?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{featuredDate.person_a?.name || "Elena Rostova"}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                        {featuredDate.person_a?.headline || "Anthropic Research"}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">MET</span>

                  <div className="flex items-center space-x-2.5 text-right">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{featuredDate.person_b?.name || "Marcus Vance"}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                        {featuredDate.person_b?.headline || "Linear Founding Eng"}
                      </span>
                    </div>
                    <img
                      src={featuredDate.person_b?.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                  </div>
                </div>

                {/* Sample Turn */}
                {featuredDate.messages && featuredDate.messages.length > 0 && (
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/60 text-xs">
                    <span className="font-semibold text-indigo-900 block mb-1">
                      Turn {featuredDate.messages[0].turn}: {featuredDate.messages[0].sender_name}
                    </span>
                    <p className="text-slate-600 italic">
                      "{featuredDate.messages[0].message}"
                    </p>
                  </div>
                )}

                {/* Assessment snippet */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {featuredDate.assessment || "Both agents maintained authentic, profile-verified communication throughout."}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4">Loading featured session...</p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href={featuredDate ? `/dating/${featuredDate.id}` : "/dating"}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1"
            >
              <span>Read Full Dialogue Transcript</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dating"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition"
            >
              Browse all dates ({dates.length})
            </Link>
          </div>
        </div>

        {/* Recently Analyzed People Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Active Agents & People</h3>
              </div>
              <Link
                href="/people"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                View all ({people.length}) →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {people.slice(0, 4).map((person) => (
                <div key={person.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={person.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <Link
                          href={`/people/${person.id}`}
                          className="font-semibold text-xs text-slate-900 hover:text-indigo-600 truncate transition"
                        >
                          {person.name}
                        </Link>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{person.headline}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/rankings/${person.id}`}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                    >
                      Rankings
                    </Link>
                    <Link
                      href={`/dating?personA=${person.id}`}
                      className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
                    >
                      Date
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>25 Verified tech professionals seeded</span>
            <Link href="/people/new" className="text-indigo-600 font-semibold hover:underline">
              + Add Custom URLs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
