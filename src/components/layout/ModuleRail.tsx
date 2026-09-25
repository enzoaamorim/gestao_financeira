import { NavLink } from "react-router-dom";
import clsx from "clsx";

const modules = [
  { to: "/app", icon: "💰", label: "Finanças" },
  { to: "/treino", icon: "💪", label: "Treino" },
  { to: "/habitos", icon: "✅", label: "Hábitos" },
];

export function ModuleRail() {
  return (
    <aside className="sticky top-0 hidden h-screen w-16 flex-shrink-0 flex-col items-center gap-2 border-r border-border bg-bg py-5 md:flex">
      <NavLink
        to="/"
        className="relative mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-sm font-bold text-ink"
      >
        A
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand" />
      </NavLink>

      <div className="my-1 h-px w-8 bg-border" />

      {modules.map((m) => (
        <NavLink
          key={m.to}
          to={m.to}
          title={m.label}
          aria-label={m.label}
          className={({ isActive }) =>
            clsx(
              "relative flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors",
              isActive ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2/60 hover:text-ink",
            )
          }
        >
          {({ isActive }) => (
            <>
              {m.icon}
              {isActive && <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-brand" />}
            </>
          )}
        </NavLink>
      ))}
    </aside>
  );
}
