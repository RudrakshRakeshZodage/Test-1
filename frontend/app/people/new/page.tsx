"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, ShieldCheck, AlertCircle, CheckCircle2,
  FileText, ExternalLink, Bot, Loader2
} from "lucide-react";
import { createPerson } from "@/lib/api";

const LOADING_MESSAGES = [
  "Opening public profiles...",
  "Reading LinkedIn...",
  "Reading Instagram...",
  "Verifying identity consistency...",
  "Extracting grounded interests...",
  "Building agent memory...",
  "Creating profile & calculating embeddings..."
];

export default function AddPersonPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [pastedLinkedIn, setPastedLinkedIn] = useState("");
  const [pastedInstagram, setPastedInstagram] = useState("");

  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // URL format checks
    const li = linkedinUrl.trim().toLowerCase();
    const ig = instagramUrl.trim().toLowerCase();

    if (!li.includes("linkedin.com/in/") && !li.includes("linkedin.com/pub/")) {
      setError("Please provide a valid public LinkedIn profile URL (e.g., https://www.linkedin.com/in/username).");
      return;
    }

    if (!ig.includes("instagram.com/")) {
      setError("Please provide a valid public Instagram profile URL (e.g., https://www.instagram.com/username).");
      return;
    }

    setLoading(true);
    setStepIndex(0);

    // Step animation interval
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const newPerson = await createPerson({
        name: name.trim() || undefined,
        linkedin_url: linkedinUrl.trim(),
        instagram_url: instagramUrl.trim(),
        pasted_linkedin_content: pastedLinkedIn.trim() || undefined,
        pasted_instagram_content: pastedInstagram.trim() || undefined,
      });

      clearInterval(stepInterval);
      router.push(`/people/${newPerson.id}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "Failed to analyze and create agent profile.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
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

      {/* Main Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-2 text-indigo-600 mb-1.5">
            <Bot className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Agent Synthesis</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an Agent</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Provide exactly two public profile URLs. The agent will retrieve public evidence, perform identity consistency checks, and synthesize an autonomous dating representative.
          </p>
        </div>

        {/* Source Constraint Alert */}
        <div className="my-5 p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Privacy & Source Restriction Rules</span>
          </div>
          <ul className="text-slate-600 space-y-1 pl-5 list-disc leading-relaxed text-[11px]">
            <li>Only public profile URLs are accepted. No authentication or private accounts.</li>
            <li>No external Google search or secondary platforms are queried.</li>
            <li>No inference of sensitive attributes (religion, politics, health, sexuality, ethnicity).</li>
            <li>Clear attribution distinguishing extracted facts from AI compatibility analysis.</li>
          </ul>
        </div>

        {error && (
          <div className="my-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Submission Notice</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {loading ? (
          <div className="py-12 px-4 text-center space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">{LOADING_MESSAGES[stepIndex]}</h3>
              <p className="text-xs text-slate-500 mt-1">Grounding autonomous agent in public evidence...</p>
            </div>

            <div className="max-w-xs mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / LOADING_MESSAGES.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-5">
            {/* Optional Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-slate-400 font-normal">(Optional — inferred from URL if blank)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Public Profile URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary source for professional skills, roles, and open public work.
              </span>
            </div>

            {/* Instagram URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instagram Public Profile URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.instagram.com/username"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Primary source for creative hobbies, downtime activities, and visual interests. Must be public.
              </span>
            </div>

            {/* Fallback Paste Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFallback(!showFallback)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center space-x-1"
              >
                <span>{showFallback ? "- Hide" : "+ Show"} Live Mode Text Fallback (Paste public profile content)</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recommended if live social platforms enforce login walls during automated public retrieval.
              </p>
            </div>

            {showFallback && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    LinkedIn Public Bio / Work Snippet
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste publicly visible headline, about, and skills text..."
                    value={pastedLinkedIn}
                    onChange={(e) => setPastedLinkedIn(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Instagram Public Bio / Captions Snippet
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste publicly visible bio, captions, and activity keywords..."
                    value={pastedInstagram}
                    onChange={(e) => setPastedInstagram(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-hidden bg-white"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wide uppercase transition shadow-md shadow-indigo-100 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract Sources & Synthesize Agent</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
