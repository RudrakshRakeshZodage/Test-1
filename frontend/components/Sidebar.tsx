"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Heart, Trophy, Sparkles, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "People", href: "/people", icon: Users },
  { label: "Dating Arena", href: "/dating", icon: Heart },
  { label: "Rankings", href: "/rankings", icon: Trophy },
  { label: "Demo Hub", href: "/demo", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 font-bold text-xl tracking-tight">
          AD
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 tracking-tight text-base leading-none">
            Agentic Dating
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Autonomous Agent Arena</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="p-4 flex-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Fast Action CTA */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <Link
          href="/people/new"
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Person</span>
        </Link>

        {/* Source constraint badge */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs text-slate-500 space-y-1">
          <div className="font-medium text-slate-700 flex items-center justify-between">
            <span>Source Grounding</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">Strict</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Exactly two public sources: LinkedIn + Instagram. No web search fabrications.
          </p>
        </div>
      </div>
    </aside>
  );
}
