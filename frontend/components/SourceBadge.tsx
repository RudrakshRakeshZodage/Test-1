import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface SourceBadgeProps {
  platform: "linkedin" | "instagram";
  url: string;
  showLinkIcon?: boolean;
}

export function SourceBadge({ platform, url, showLinkIcon = true }: SourceBadgeProps) {
  const isLinkedIn = platform === "linkedin";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
        isLinkedIn
          ? "bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/20 hover:bg-[#0077B5]/15"
          : "bg-[#E1306C]/10 text-[#E1306C] border-[#E1306C]/20 hover:bg-[#E1306C]/15"
      }`}
    >
      <span className="font-semibold">{isLinkedIn ? "LinkedIn" : "Instagram"}</span>
      {showLinkIcon && <ExternalLink className="w-3 h-3 opacity-70" />}
    </a>
  );
}

export function AttributionBadge({ source }: { source?: string }) {
  if (!source) return null;
  const isBoth = source.toLowerCase().includes("both");
  const isLI = source.toLowerCase().includes("linkedin");

  return (
    <span
      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
        isBoth
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : isLI
          ? "bg-blue-50 text-[#0077B5] border-blue-200"
          : "bg-pink-50 text-[#E1306C] border-pink-200"
      }`}
    >
      {source}
    </span>
  );
}
