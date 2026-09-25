import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { Logo } from "../ui/Logo";
import { ModuleSwitcher } from "./ModuleSwitcher";
import { ModuleRail } from "./ModuleRail";
import { SidebarUserCard } from "./SidebarUserCard";
import { AvatarUploader } from "./AvatarUploader";
import { useAuth } from "../../context/AuthContext";
import { useWorkout } from "../../context/WorkoutContext";

const navItems = [
  { to: "/treino", label: "Dashboard", icon: "📈", end: true },
  { to: "/treino/registrar", label: "Registrar treino", icon: "📝" },
  { to: "/treino/rotinas", label: "Rotinas", icon: "🗓️" },
  { to: "/treino/exercicios", label: "Exercícios", icon: "💪" },
];

export function FitnessLayout() {
  const { signOut } = useAuth();
  const { loading, error, clearError } = useWorkout();

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <ModuleRail />
      <aside className="sticky top-0 hidden h-screen w-48 flex-shrink-0 flex-col border-r border-border bg-surface px-3 py-6 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="text-base">💪</span>
          <span className="text-sm font-bold">Treino</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-2 text-ink"
                    : "text-muted hover:bg-surface-2/60 hover:text-ink",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <SidebarUserCard />
      </aside>

      <div className="flex-1">
        <header className="border-b border-border bg-surface px-4 py-3 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <AvatarUploader size="sm" />
              <Link to="/configuracoes" className="text-lg" aria-label="Configurações">
                ⚙️
              </Link>
              <button onClick={() => signOut()} className="text-xs font-semibold text-pink">
                Sair
              </button>
            </div>
          </div>
          <ModuleSwitcher />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          {error && (
            <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-pink/30 bg-pink/10 px-4 py-3 text-sm text-pink">
              <span>{error}</span>
              <button onClick={clearError} className="shrink-0 font-semibold hover:underline">
                Fechar
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-20 text-sm text-muted">Carregando seus dados...</div>
          ) : (
            <Outlet />
          )}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-surface py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium",
                  isActive ? "text-ink" : "text-subtle",
                )
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>
        <div className="h-16 md:hidden" />
      </div>
    </div>
  );
}
