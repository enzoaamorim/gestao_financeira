import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { accentOptions } from "../lib/accentColors";
import { Logo } from "../components/ui/Logo";
import { ModuleSwitcher } from "../components/layout/ModuleSwitcher";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { inputClass, labelClass } from "../components/ui/fields";

const financeTables = ["transactions", "recurring_transactions", "budgets", "goals", "accounts", "categories"];
const fitnessTables = ["workout_sets", "workout_sessions", "routine_exercises", "routines", "exercises"];

export default function Settings() {
  const { user, accentColor, updateAccentColor, updateEmail, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailInfo, setEmailInfo] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);

  const [savingColor, setSavingColor] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || email === user?.email) return;

    setSavingEmail(true);
    setEmailError(null);
    setEmailInfo(null);
    const result = await updateEmail(email.trim());
    setSavingEmail(false);

    if (result.error) setEmailError(result.error);
    else setEmailInfo("Enviamos um link de confirmação para o novo e-mail. Ele só passa a valer depois de confirmado.");
  }

  async function handlePickColor(hex: string) {
    setSavingColor(hex);
    await updateAccentColor(hex);
    setSavingColor(null);
  }

  async function handleDeleteAllData() {
    setDeleting(true);
    setDeleteError(null);
    try {
      for (const table of [...financeTables, ...fitnessTables]) {
        const { error } = await supabase.from(table).delete().not("id", "is", null);
        if (error) throw error;
      }
      if (user) {
        await supabase.storage.from("avatars").remove([`${user.id}/avatar`]);
      }
      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleting(false);
      if (err instanceof TypeError) {
        setDeleteError("Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.");
        return;
      }
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Não foi possível excluir os dados.";
      setDeleteError(message);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="max-w-xs">
          <ModuleSwitcher />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="mt-1 text-sm text-muted">Sua conta, aparência e dados</p>
        </div>

        <Card className="space-y-4">
          <h2 className="text-sm font-semibold">Conta</h2>
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {emailError && <p className="text-sm text-pink">{emailError}</p>}
            {emailInfo && <p className="text-sm text-teal">{emailInfo}</p>}
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={savingEmail || email === user?.email}
            >
              {savingEmail ? "Salvando..." : "Trocar e-mail"}
            </Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Aparência</h2>
            <p className="mt-1 text-xs text-subtle">Escolha a cor de destaque do sistema</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {accentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePickColor(opt.value)}
                disabled={savingColor !== null}
                title={opt.name}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
                style={{
                  backgroundColor: opt.value,
                  boxShadow: accentColor === opt.value ? `0 0 0 3px #131316, 0 0 0 5px ${opt.value}` : "none",
                }}
              >
                {savingColor === opt.value && <span className="text-xs">...</span>}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 !border-pink/30">
          <div>
            <h2 className="text-sm font-semibold text-pink">Zona de perigo</h2>
            <p className="mt-1 text-xs text-subtle">
              Apaga todas as suas transações, contas, orçamentos, metas, categorias, treinos e sua foto de
              perfil. Sua conta de login continua existindo, mas fica vazia — como se fosse novo. Essa ação
              não pode ser desfeita.
            </p>
          </div>

          {!confirmingDelete ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
              Excluir todos os meus dados
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-pink/30 bg-pink/5 p-4">
              <p className="text-sm text-ink">Tem certeza? Essa ação é permanente.</p>
              {deleteError && <p className="text-sm text-pink">{deleteError}</p>}
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteAllData}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo..." : "Sim, excluir tudo"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
