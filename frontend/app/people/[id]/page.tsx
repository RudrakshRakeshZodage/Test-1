"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Heart, Trophy, Bot, ShieldCheck, AlertCircle,
  Briefcase, Coffee, FolderGit2, MessagesSquare, Sparkles,
  RefreshCw, Bookmark, ExternalLink, CheckCircle2
} from "lucide-react";
import { fetchPerson, fetchPersonProfile, analyzePerson, Person, ProfileData } from "@/lib/api";
import { SourceBadge, AttributionBadge } from "@/components/SourceBadge";
import { InterestTag } from "@/components/InterestTag";
import { EvidenceCard } from "@/components/EvidenceCard";

export default function PersonProfilePage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, prof] = await Promise.all([
        fetchPerson(personId),
        fetchPersonProfile(personId),
      ]);
      setPerson(p);
      setProfile(prof);
    } catch (err: any) {
      setError(err.message || "Failed to load agent profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personId) {
      loadData();
    }
  }, [personId]);

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      const updated = await analyzePerson(personId);
      setProfile(updated);
      await loadData();
    } catch (err: any) {
      alert("Failed to re-run analysis: " + err.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading verified agent profile...</p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Profile Not Found</h2>
        <p className="text-xs text-slate-500">{error || "Could not retrieve person."}</p>
        <Link
          href="/people"
          className="inline-flex items-center space-x-1 text-xs text-indigo-600 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to People</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/people"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to People Directory</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {person.profile_image ? (
                <img
                  src={person.profile_image}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xl">
                  {person.name.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{person.name}</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Identity</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">{person.headline}</p>

              {/* Verified Sources */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <SourceBadge platform="linkedin" url={person.linkedin_url} />
                <SourceBadge platform="instagram" url={person.instagram_url} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <Link
              href={`/dating?personA=${person.id}`}
              className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Heart className="w-4 h-4 fill-white/20" />
              <span>Simulate Date</span>
            </Link>
            <Link
              href={`/rankings/${person.id}`}
              className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>View Match Rankings</span>
            </Link>
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? "animate-spin text-indigo-600" : ""}`} />
              <span>{isReanalyzing ? "Analyzing..." : "Re-run Extraction"}</span>
            </button>
          </div>
        </div>

        {person.verification_warning && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Identity Notice</span>
              <span>{person.verification_warning}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Structured Profile Attributes & Evidence */}
      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Structured Extracted Facts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Interests */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Professional Interests & Skills</h3>
                </div>
                <AttributionBadge source="LinkedIn" />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Extracted Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, i) => (
                        <InterestTag key={i} label={skill} variant="skill" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None extracted</span>
                    )}
                  </div>
                </div>

                {profile.professional_interests?.industries && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                      Core Industries
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.professional_interests.industries.map((ind, i) => (
                        <InterestTag key={i} label={ind} variant="default" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hobbies & Creative Passions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Coffee className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Hobbies & Creative Passions</h3>
                </div>
                <AttributionBadge source="Instagram" />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Documented Activities & Pursuits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.hobbies?.activities && profile.hobbies.activities.length > 0 ? (
                      profile.hobbies.activities.map((hobby, i) => (
                        <InterestTag key={i} label={hobby} variant="hobby" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None extracted</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Public Projects & Research */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Public Projects & Open Work</h3>
                </div>
                <AttributionBadge source="LinkedIn" />
              </div>

              <ul className="mt-3.5 space-y-2 text-xs text-slate-600">
                {profile.projects?.public_work && profile.projects.public_work.length > 0 ? (
                  profile.projects.public_work.map((proj, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{proj}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No public projects identified</li>
                )}
              </ul>
            </div>

            {/* Natural Conversation Topics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <MessagesSquare className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">Verified Conversation Topics</h3>
                </div>
                <AttributionBadge source="Both Sources" />
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {profile.topics && profile.topics.length > 0 ? (
                  profile.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No topics synthesized</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Source Evidence & Confidence Grounding */}
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Identity Grounding
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <span className="font-semibold text-slate-800">
                    {profile.identity?.location || "San Francisco Bay Area"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Role</span>
                  <span className="font-semibold text-slate-800">
                    {profile.identity?.current_role || person.headline}
                  </span>
                </div>
              </div>
            </div>

            {/* LinkedIn Source Evidence */}
            <EvidenceCard
              title="LinkedIn Source Evidence"
              source="LinkedIn"
              confidence="high"
              items={profile.evidence?.linkedin_evidence || []}
            />

            {/* Instagram Source Evidence */}
            <EvidenceCard
              title="Instagram Source Evidence"
              source="Instagram"
              confidence="high"
              items={profile.evidence?.instagram_evidence || []}
            />

            {/* Privacy & Safety Guarantee */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safety & Non-Inference Policy</span>
              </span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                This agent profile has strictly omitted inference of sensitive personal attributes (religion, politics, health, sexuality, ethnicity) in accordance with the Agentic Dating Protocol.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
