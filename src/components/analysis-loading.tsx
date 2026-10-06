import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = {
  text: {
    title: "Your submission is being analysed…",
    steps: ["Reading your submission", "Checking grammar", "Examining word choice", "Evaluating naturalness", "Preparing your feedback"],
  },
  image: {
    title: "Reading your image…",
    steps: ["Extracting text", "Checking the extracted content", "Analysing your language", "Preparing your feedback"],
  },
  audio: {
    title: "Listening to your recording…",
    steps: [
      "Transcribing your speech",
      "Checking grammar and vocabulary",
      "Evaluating fluency",
      "Checking clarity and enunciation",
      "Preparing your feedback",
    ],
  },
} as const;

/** Staged loader. Steps advance on a timer but never past the last one until `done`. */
export function AnalysisLoading({ mode, title }: { mode: keyof typeof STAGES; title?: string }) {
  const stage = STAGES[mode];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, stage.steps.length - 1)), 1400);
    return () => clearInterval(t);
  }, [stage.steps.length]);

  return (
    <div className="surface-card mx-auto max-w-lg p-8 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="relative mx-auto size-16">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-primary/25" />
        <span className="absolute inset-[22px] rounded-full bg-primary" />
      </div>
      <h2 className="mt-6 text-lg font-semibold tracking-tight text-foreground">{title ?? stage.title}</h2>
      <ul className="mx-auto mt-6 max-w-xs space-y-3 text-left">
        {stage.steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-3 text-sm transition-all duration-500",
              i < step ? "text-muted-foreground" : i === step ? "font-medium text-foreground" : "text-muted-foreground/50",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                i < step ? "border-primary bg-primary text-primary-foreground" : i === step ? "border-primary" : "border-border",
              )}
            >
              {i < step ? <Check className="size-3" /> : i === step ? <span className="size-1.5 animate-pulse rounded-full bg-primary" /> : null}
            </span>
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${((step + 1) / stage.steps.length) * 92}%` }}
        />
      </div>
    </div>
  );
}
