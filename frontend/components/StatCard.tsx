import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "indigo" | "emerald" | "rose" | "amber";
}

export function StatCard({ label, value, subtitle, icon: Icon, color = "indigo" }: StatCardProps) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={cn("p-2 rounded-lg border", colorMap[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
}
