import { useRef, useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export function AvatarUploader({ size = "md" }: { size?: "sm" | "md" }) {
  const { user, updateAvatar } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = (user?.user_metadata as { avatar_url?: string } | undefined)?.avatar_url;
  const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Imagem muito grande (máx. 2MB).");
      return;
    }

    setUploading(true);
    setError(null);
    const result = await updateAvatar(file);
    setUploading(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Alterar foto de perfil"
        className={clsx(
          "group relative flex items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-ink ring-1 ring-border",
          dimension,
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <span>{user?.email?.[0]?.toUpperCase() ?? "?"}</span>
        )}
        <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-[10px] text-white group-hover:flex">
          ✎
        </span>
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white">
            ...
          </span>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {error && (
        <p className="absolute left-0 top-full z-10 mt-1 w-40 text-[10px] leading-tight text-pink">{error}</p>
      )}
    </div>
  );
}
