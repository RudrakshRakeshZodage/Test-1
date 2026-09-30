interface TypingIndicatorProps {
  agentName: string;
}

export function TypingIndicator({ agentName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center space-x-3 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100/80 text-xs text-indigo-900 max-w-md animate-pulse">
      <div className="flex space-x-1.5 items-center">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
      </div>
      <span className="font-medium text-indigo-700">
        Agent {agentName} is reflecting on profile grounding...
      </span>
    </div>
  );
}
