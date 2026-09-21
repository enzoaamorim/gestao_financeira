import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const modules = [
  { to: "/app", label: "Finanças", icon: "💰" },
  { to: "/treino", label: "Treino", icon: "💪" },
  { to: "/habitos", label: "Hábitos", icon: "✅" },
];

export function ModuleSwitcher() {
  const location = useLocation();

  return (
    <div className="mb-6 flex gap-1 rounded-full bg-surface-2 p-1">
      {modules.map((m) => {
        const active = location.pathname.startsWith(m.to);
        return (
          <Link
            key={m.to}
            to={m.to}
            className={clsx(
              "flex-1 rounded-full py-2 text-center text-xs font-semibold transition-colors",
              active ? "bg-ink text-bg" : "text-muted hover:text-ink",
            )}
          >
            {m.icon} {m.label}
          </Link>
        );
      })}
    </div>
  );
}
