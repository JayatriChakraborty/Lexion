import { useEffect, useRef, useState } from "react";
import { Check, Mic, RotateCcw, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_AUDIO_SECONDS = 600;

export function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/** Records a complete audio file in-browser. Nothing leaves memory until "Use recording". */
export function AudioRecorder({ onUse }: { onUse: (blob: Blob, seconds: number) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "review">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const start = async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Lexion needs microphone access to record. Please allow it in your browser and try again.");
      return;
    }
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      if (blob.size < 2048) {
        setError("That recording was empty — please try again.");
        setState("idle");
        return;
      }
      blobRef.current = blob;
      setUrl(URL.createObjectURL(blob));
      setState("review");
    };
    recRef.current = rec;
    rec.start(); // no timeslice → one complete file
    setSeconds(0);
    setState("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_AUDIO_SECONDS) stop();
        return s + 1;
      });
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recRef.current?.state === "recording") recRef.current.stop();
  };

  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    blobRef.current = null;
    setSeconds(0);
    setState("idle");
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center">
      {state === "idle" && (
        <>
          <button
            type="button"
            onClick={() => void start()}
            className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card transition-transform hover:scale-105"
            aria-label="Start recording"
          >
            <Mic className="size-6" />
          </button>
          <p className="mt-3 text-sm font-semibold text-foreground">Record in Lexion</p>
          <p className="mt-1 text-xs text-muted-foreground">Up to 10 minutes</p>
        </>
      )}
      {state === "recording" && (
        <>
          <div className="relative mx-auto size-16">
            <span className="absolute inset-0 animate-ping rounded-full bg-error/20" />
            <button
              type="button"
              onClick={stop}
              className="relative flex size-16 items-center justify-center rounded-full bg-error text-primary-foreground"
              aria-label="Stop recording"
            >
              <Square className="size-5 fill-current" />
            </button>
          </div>
          <p className="mt-3 font-mono text-lg font-semibold tabular-nums text-foreground">{fmt(seconds)}</p>
          <p className="text-xs text-muted-foreground">Recording · {fmt(MAX_AUDIO_SECONDS - seconds)} left</p>
        </>
      )}
      {state === "review" && url && (
        <>
          <audio src={url} controls className="mx-auto w-full max-w-sm" />
          <p className="mt-2 text-xs text-muted-foreground">Length {fmt(seconds)}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              <RotateCcw className="size-4" /> Re-record
            </button>
            <button
              type="button"
              onClick={() => blobRef.current && onUse(blobRef.current, seconds)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Check className="size-4" /> Use recording
            </button>
          </div>
        </>
      )}
      {error && <p className={cn("mt-3 text-xs text-error")}>{error}</p>}
    </div>
  );
}
