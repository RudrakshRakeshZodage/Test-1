"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Heart, CheckCircle2, RefreshCw } from "lucide-react";
import { fetchStats, Stats } from "@/lib/api";

export function TopNavigation() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchStats();
      setStats(data);
    } catch {
      // Fallback display if network blip
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-slate-800 text-sm tracking-tight">Agentic Dating</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-500 font-medium">
          Autonomous agents dating on your behalf
        </span>
      </div>

      <div className="flex items-center space-x-6 text-xs">
        {/* People count */}
        <Link
          href="/people"
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 transition"
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{stats?.people_count ?? 25}</span>
          <span className="text-slate-500">People</span>
        </Link>

        {/* Dates completed */}
        <Link
          href="/dating"
          className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 transition"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
          <span className="font-semibold text-slate-900">{stats?.dates_count ?? 8}</span>
          <span className="text-slate-500">Dates</span>
        </Link>

        {/* System status */}
        <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-700">
            {stats?.system_status || "System Operational"}
          </span>
        </div>
      </div>
    </header>
  );
}
