import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const presets = [30, 60, 90, 120];

export function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function selectPreset(seconds: number) {
    setDuration(seconds);
    setRemaining(seconds);
    setRunning(false);
  }

  function toggle() {
    if (remaining === 0) setRemaining(duration);
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const done = remaining === 0;

  return (
    <div className="card-glow rounded-2xl border border-border bg-surface p-5">
      <p className="mb-3 text-sm font-semibold">⏱ Timer de descanso</p>
      <div className="flex items-center justify-between gap-4">
        <p className={clsx("text-4xl font-bold tabular-nums", done ? "text-pink" : "text-ink")}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <Button onClick={toggle} label={running ? "Pausar" : "Iniciar"} />
          <Button onClick={reset} label="Zerar" variant="secondary" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              duration === p ? "bg-ink text-bg" : "bg-surface-2 text-muted hover:text-ink",
            )}
          >
            {p}s
          </button>
        ))}
      </div>
    </div>
  );
}

function Button({
  onClick,
  label,
  variant = "primary",
}: {
  onClick: () => void;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        variant === "primary" ? "bg-ink text-bg hover:bg-white" : "bg-surface-2 text-ink hover:bg-white/10",
      )}
    >
      {label}
    </button>
  );
}
