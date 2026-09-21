import { useAuth } from "../../context/AuthContext";
import { AvatarUploader } from "./AvatarUploader";

export function SidebarUserCard() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
      <div className="flex items-center gap-3">
        <AvatarUploader />
        <p className="min-w-0 truncate text-xs text-muted" title={user?.email}>
          {user?.email}
        </p>
      </div>
      <button onClick={() => signOut()} className="text-xs font-semibold text-pink hover:underline">
        Sair
      </button>
    </div>
  );
}
