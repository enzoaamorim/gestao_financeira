export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 512 512" fill="none">
        <rect width="512" height="512" rx="112" fill="#0A0A0B" />
        <path
          d="M128 320c40 0 40-96 80-96s40 96 80 96 40-96 80-96"
          stroke="#F4C744"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="150" cy="176" r="16" fill="#F4577F" />
        <circle cx="362" cy="176" r="16" fill="#3ED9B0" />
      </svg>
      <span className="font-script text-2xl leading-none text-ink">fluxo</span>
    </div>
  );
}
