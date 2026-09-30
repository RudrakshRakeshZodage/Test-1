import { DateMessage } from "@/lib/api";
import { Sparkles, Tag } from "lucide-react";

interface AgentMessageProps {
  message: DateMessage;
  isAgentA: boolean;
}

export function AgentMessage({ message, isAgentA }: AgentMessageProps) {
  const phaseLabels: Record<string, string> = {
    opener: "Icebreaker & Greeting",
    response_bridge: "Context Bridge",
    inquire_passion: "Inquiring Passions",
    deep_dive: "Deep Dive",
    shared_discovery: "Shared Discovery",
    complementary: "Complementary Synergies",
    explore_contrast: "Exploring Contrast",
    conclusion: "Reflective Conclusion",
  };

  const phaseName = phaseLabels[message.phase] || message.phase;

  return (
    <div className={`flex flex-col ${isAgentA ? "items-start" : "items-end"} my-4`}>
      <div className={`flex items-start space-x-3 max-w-[85%] ${isAgentA ? "flex-row" : "flex-row-reverse space-x-reverse"}`}>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-xs">
          {message.sender_avatar ? (
            <img src={message.sender_avatar} alt={message.sender_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 bg-slate-100">
              {message.sender_name.charAt(0)}
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div>
          {/* Header Row */}
          <div className={`flex items-center space-x-2 mb-1 text-xs ${isAgentA ? "justify-start" : "justify-end"}`}>
            <span className="font-semibold text-slate-900">{message.sender_name}</span>
            <span className="text-[10px] text-slate-400">• {message.timestamp}</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
              Turn {message.turn}: {phaseName}
            </span>
          </div>

          <div
            className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs transition-all ${
              isAgentA
                ? "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                : "bg-indigo-600 text-white rounded-tr-xs shadow-indigo-100"
            }`}
          >
            <p>{message.message}</p>

            {/* Evidence grounding badges */}
            {message.evidence_grounding && message.evidence_grounding.length > 0 && (
              <div
                className={`mt-2.5 pt-2 border-t flex flex-wrap gap-1.5 items-center text-[10px] ${
                  isAgentA ? "border-slate-100 text-slate-500" : "border-indigo-500/60 text-indigo-100"
                }`}
              >
                <Tag className="w-3 h-3 opacity-70" />
                <span className="font-medium">Grounded in:</span>
                {message.evidence_grounding.map((g, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded ${
                      isAgentA ? "bg-slate-100 text-slate-700" : "bg-indigo-700/60 text-indigo-100"
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
