export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 text-sm font-bold text-ink">
        A
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand" />
      </span>
      <span className="font-script text-2xl leading-none text-ink">Amorim</span>
    </div>
  );
}
