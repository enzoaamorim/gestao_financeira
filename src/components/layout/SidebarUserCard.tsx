import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AvatarUploader } from "./AvatarUploader";

export function SidebarUserCard() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-2 p-4">
      <AvatarUploader />
      <p className="w-full truncate text-center text-xs font-medium text-ink" title={user?.email}>
        {user?.email}
      </p>
      <div className="flex w-full items-center justify-center gap-3 border-t border-border pt-3">
        <Link
          to="/configuracoes"
          className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-muted hover:bg-surface hover:text-ink"
          aria-label="Configurações"
          title="Configurações"
        >
          ⚙️
        </Link>
        <span className="h-3 w-px bg-border" />
        <button
          onClick={() => signOut()}
          className="text-xs font-semibold text-pink hover:underline"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
