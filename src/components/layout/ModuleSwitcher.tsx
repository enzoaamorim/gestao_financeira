import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export function ModuleSwitcher() {
  const location = useLocation();
  const isFinance = !location.pathname.startsWith("/treino");

  return (
    <div className="mb-6 flex gap-1 rounded-full bg-surface-2 p-1">
      <Link
        to="/app"
        className={clsx(
          "flex-1 rounded-full py-2 text-center text-xs font-semibold transition-colors",
          isFinance ? "bg-ink text-bg" : "text-muted hover:text-ink",
        )}
      >
        💰 Finanças
      </Link>
      <Link
        to="/treino"
        className={clsx(
          "flex-1 rounded-full py-2 text-center text-xs font-semibold transition-colors",
          !isFinance ? "bg-ink text-bg" : "text-muted hover:text-ink",
        )}
      >
        💪 Treino
      </Link>
    </div>
  );
}
