"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Heart, Sparkles, Play, Pause, FastForward, RotateCcw,
  Bot, ShieldCheck, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft
} from "lucide-react";
import {
  fetchPeople, fetchDates, startDate, continueDateTurn, completeDate,
  Person, DateSession, DateMessage
} from "@/lib/api";
import { AgentMessage } from "@/components/AgentMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { DateSummary } from "@/components/DateSummary";

function DatingArenaContent() {
  const searchParams = useSearchParams();
  const initialPersonA = searchParams.get("personA");
  const initialPersonB = searchParams.get("personB");

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");

  const [activeSession, setActiveSession] = useState<DateSession | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGeneratingTurn, setIsGeneratingTurn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load people list
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const pList = await fetchPeople();
        setPeople(pList);

        if (pList.length >= 2) {
          const defaultA = initialPersonA || pList[0].id;
          const defaultB = initialPersonB || (pList[1].id !== defaultA ? pList[1].id : pList[2]?.id || pList[1].id);
          setSelectedA(defaultA);
          setSelectedB(defaultB);
        }
      } catch (err) {
        console.error("Failed to load people for arena:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initialPersonA, initialPersonB]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isGeneratingTurn]);

  // Handle autonomous step simulation when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && activeSession && activeSession.status === "in_progress" && !isGeneratingTurn) {
      if (activeSession.current_turn >= activeSession.max_turns) {
        setIsPlaying(false);
      } else {
        timer = setTimeout(async () => {
          await handleNextTurn();
        }, 1800);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeSession, isGeneratingTurn]);

  const personAObj = people.find((p) => p.id === selectedA);
  const personBObj = people.find((p) => p.id === selectedB);

  // Start Date
  const handleStartDate = async () => {
    if (!selectedA || !selectedB || selectedA === selectedB) {
      alert("Please select two distinct people to simulate a date.");
      return;
    }

    try {
      setIsGeneratingTurn(true);
      const session = await startDate(selectedA, selectedB, 8);
      setActiveSession(session);
      setIsPlaying(true);
      // Generate Turn 1 immediately
      const firstTurn = await continueDateTurn(session.id);
      setActiveSession(firstTurn);
    } catch (err: any) {
      alert("Failed to start date: " + err.message);
    } finally {
      setIsGeneratingTurn(false);
    }
  };

  // Next Turn
  const handleNextTurn = async () => {
    if (!activeSession || isGeneratingTurn) return;
    try {
      setIsGeneratingTurn(true);
      const updated = await continueDateTurn(activeSession.id);
      setActiveSession(updated);
      if (updated.status === "completed") {
        setIsPlaying(false);
      }
    } catch (err: any) {
      console.error(err);
      setIsPlaying(false);
    } finally {
      setIsGeneratingTurn(false);
    }
  };

  // Skip to End
  const handleSkipToEnd = async () => {
    if (!activeSession) return;
    try {
      setIsPlaying(false);
      setIsGeneratingTurn(true);
      const finished = await completeDate(activeSession.id);
      setActiveSession(finished);
    } catch (err: any) {
      alert("Failed to complete date: " + err.message);
    } finally {
      setIsGeneratingTurn(false);
    }
  };

  // Restart
  const handleRestart = () => {
    setIsPlaying(false);
    setActiveSession(null);
  };

  // Speaking agent calculation
  const currentSpeakingAgent =
    activeSession && activeSession.status === "in_progress"
      ? activeSession.current_turn % 2 === 0
        ? personAObj?.name || "Agent A"
        : personBObj?.name || "Agent B"
      : "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 mb-1">
            <Heart className="w-5 h-5 fill-rose-100" />
            <span className="text-xs uppercase font-bold tracking-wider">Multi-Turn Simulator</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dating Arena</h1>
          <p className="text-xs text-slate-500 mt-1">
            Watch two autonomous AI agents converse on behalf of their people, strictly bounded by verified profile evidence.
          </p>
        </div>

        {/* Status Pill */}
        {activeSession && (
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                activeSession.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse"
              }`}
            >
              {activeSession.status === "completed" ? "Date Concluded" : `Turn ${activeSession.current_turn} of ${activeSession.max_turns}`}
            </span>
          </div>
        )}
      </div>

      {/* Arena Stage: Left Agent Card | Central Conversation | Right Agent Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Agent Card (Agent A) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Agent A</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>

          {!activeSession ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Person A</label>
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {personAObj && (
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-slate-100 border-2 border-indigo-500/30">
                <img
                  src={personAObj.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{personAObj.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{personAObj.headline}</p>

              <div className="pt-2 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Agent Grounded</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Central Chat Feed & Controls */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[580px] overflow-hidden">
          {/* Arena Top Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-800">Autonomous Dialogue Stream</span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-1.5">
              {!activeSession ? (
                <button
                  onClick={handleStartDate}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Date</span>
                </button>
              ) : (
                <>
                  {activeSession.status === "in_progress" && (
                    <>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 transition"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? "Pause" : "Play"}</span>
                      </button>
                      <button
                        onClick={handleNextTurn}
                        disabled={isGeneratingTurn}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition"
                      >
                        Step
                      </button>
                      <button
                        onClick={handleSkipToEnd}
                        disabled={isGeneratingTurn}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 transition"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Skip</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleRestart}
                    className="p-1.5 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg transition"
                    title="Reset Simulator"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            {!activeSession ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Heart className="w-6 h-6 fill-indigo-100" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Select Two Agents & Press Start</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  The agents will introduce themselves, inquire about verified hobbies and projects, discover shared interests, and conclude with authentic assessments.
                </p>
              </div>
            ) : (
              <>
                {activeSession.messages.map((msg, idx) => (
                  <AgentMessage
                    key={idx}
                    message={msg}
                    isAgentA={msg.sender_name === personAObj?.name}
                  />
                ))}

                {isGeneratingTurn && currentSpeakingAgent && (
                  <div className="my-2">
                    <TypingIndicator agentName={currentSpeakingAgent} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Right Agent Card (Agent B) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Agent B</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>

          {!activeSession ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Person B</label>
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {personBObj && (
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-slate-100 border-2 border-rose-500/30">
                <img
                  src={personBObj.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{personBObj.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{personBObj.headline}</p>

              <div className="pt-2 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Agent Grounded</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Date Summary (Revealed when date completed) */}
      {activeSession && activeSession.status === "completed" && (
        <DateSummary session={activeSession} />
      )}
    </div>
  );
}

export default function DatingArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Dating Arena...</p>
        </div>
      }
    >
      <DatingArenaContent />
    </Suspense>
  );
}

