export function ProgressBar({
  value,
  color = "#3ed9b0",
}: {
  value: number; // 0-100+
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const overBudget = value > 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: overBudget ? "#f4577f" : color }}
      />
    </div>
  );
}
