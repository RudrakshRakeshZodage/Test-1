import { cn } from "@/lib/utils";

interface InterestTagProps {
  label: string;
  variant?: "skill" | "hobby" | "topic" | "default";
}

export function InterestTag({ label, variant = "default" }: InterestTagProps) {
  const variantStyles = {
    skill: "bg-indigo-50/70 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/70",
    hobby: "bg-emerald-50/70 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/70",
    topic: "bg-amber-50/70 text-amber-700 border-amber-200/60 hover:bg-amber-100/70",
    default: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border transition-colors",
        variantStyles[variant]
      )}
    >
      {label}
    </span>
  );
}
