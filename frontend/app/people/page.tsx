"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Heart, Search, Filter, RefreshCw, Sparkles } from "lucide-react";
import { fetchPeople, Person } from "@/lib/api";
import { PersonCard } from "@/components/PersonCard";

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const data = await fetchPeople(search, filter);
      setPeople(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPeople();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">People Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Every real person is represented by an autonomous AI agent grounded in their public LinkedIn & Instagram profiles.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/dating"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Dating Arena</span>
          </Link>
          <Link
            href="/people/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Person</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or headline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 self-start md:self-auto overflow-x-auto w-full md:w-auto">
          {["all", "verified", "analyzed", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === tab
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={loadPeople}
            title="Refresh list"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 border border-slate-200 hover:bg-slate-50 transition ml-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* People Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse p-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded"></div>
              <div className="h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : people.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 text-base">No people found</h3>
          <p className="text-xs text-slate-500">
            {search ? `No profiles matched "${search}".` : "No profiles exist in this category yet."}
          </p>
          <div className="pt-2">
            <Link
              href="/people/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Person</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
