import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "md" ? "px-5 py-2.5 text-sm" : "px-4 py-1.5 text-xs",
        variant === "primary" && "bg-ink text-bg hover:bg-white",
        variant === "secondary" && "bg-surface-2 text-ink border border-border hover:bg-white/10",
        variant === "ghost" && "text-muted hover:text-ink",
        variant === "danger" && "bg-pink/10 text-pink hover:bg-pink/20",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
