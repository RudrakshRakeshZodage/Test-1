import { ShieldCheck, ExternalLink, Bookmark } from "lucide-react";
import { AttributionBadge } from "./SourceBadge";

interface EvidenceCardProps {
  title: string;
  source: "LinkedIn" | "Instagram" | "Both";
  confidence?: "high" | "medium" | "low";
  items: string[];
}

export function EvidenceCard({ title, source, confidence = "high", items }: EvidenceCardProps) {
  const confStyles = {
    high: "text-emerald-700 bg-emerald-50 border-emerald-200",
    medium: "text-amber-700 bg-amber-50 border-amber-200",
    low: "text-slate-600 bg-slate-50 border-slate-200",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-indigo-600" />
          <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <AttributionBadge source={source} />
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${confStyles[confidence]}`}
          >
            {confidence} Confidence
          </span>
        </div>
      </div>

      <ul className="mt-3.5 space-y-2.5">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-xs text-slate-400 italic">No direct public evidence recorded</li>
        )}
      </ul>
    </div>
  );
}
