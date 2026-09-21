import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { inputClass, labelClass } from "../components/ui/fields";

export default function ResetPassword() {
  const { passwordRecovery, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.error) setError(result.error);
    else navigate("/app", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card-glow rounded-3xl border border-border bg-surface p-6">
          {!passwordRecovery ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted">
                Esse link de recuperação é inválido ou já expirou. Solicite um novo na tela de login.
              </p>
              <Link to="/login">
                <Button className="w-full">Voltar para o login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="mb-1 text-sm font-semibold text-ink">Defina sua nova senha</h2>
              <div>
                <label className={labelClass}>Nova senha</label>
                <input
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={labelClass}>Confirmar nova senha</label>
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="text-sm text-pink">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
