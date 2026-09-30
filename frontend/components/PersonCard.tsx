"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Heart, Bot, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { Person } from "@/lib/api";
import { SourceBadge } from "./SourceBadge";

interface PersonCardProps {
  person: Person;
  onAnalyze?: (id: string) => void;
  isAnalyzing?: boolean;
}

export function PersonCard({ person, onAnalyze, isAnalyzing = false }: PersonCardProps) {
  const isVerified = person.status === "verified";

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top: Avatar, Name & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {person.profile_image ? (
                <img
                  src={person.profile_image}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-200">
                  {person.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                  {person.name}
                </h3>
                {isVerified ? (
                  <span title="Verified Identity">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  </span>
                ) : (
                  <span title="Verification Notice">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Agent Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {person.headline || "Verified public profile on LinkedIn and Instagram"}
        </p>

        {/* Source Badges */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <SourceBadge platform="linkedin" url={person.linkedin_url} />
          <SourceBadge platform="instagram" url={person.instagram_url} />
        </div>

        {/* Warning if any */}
        {person.verification_warning && (
          <div className="mt-2.5 p-2 bg-amber-50/80 border border-amber-200/60 rounded-md text-[11px] text-amber-800">
            {person.verification_warning}
          </div>
        )}

        {/* Metrics Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-slate-50/70 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Extracted Interests</span>
            <span className="font-bold text-slate-800 text-sm">{person.extracted_interests_count}</span>
          </div>
          <div className="bg-slate-50/70 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dates Completed</span>
            <span className="font-bold text-slate-800 text-sm">{person.completed_dates_count}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
        <Link
          href={`/people/${person.id}`}
          className="flex-1 text-center py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          View Profile
        </Link>
        <Link
          href={`/dating?personA=${person.id}`}
          className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-2xs"
        >
          <Heart className="w-3.5 h-3.5 fill-white/20" />
          <span>Start Date</span>
        </Link>
      </div>
    </div>
  );
}
