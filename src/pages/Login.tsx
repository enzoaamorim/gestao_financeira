import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { inputClass, labelClass } from "../components/ui/fields";

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const { user, loading: sessionLoading, signIn, signUp, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!sessionLoading && user) {
    const redirectTo = (location.state as { from?: string })?.from ?? "/app";
    return <Navigate to={redirectTo} replace />;
  }

  function changeMode(next: "signin" | "signup") {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "forgot") {
      const result = await sendPasswordReset(email);
      setSubmitting(false);
      if (result.error) setError(translateError(result.error));
      else setInfo("Enviamos um link de recuperação para o seu e-mail.");
      return;
    }

    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      setError(translateError(result.error));
    } else if (mode === "signup") {
      setInfo("Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.");
    } else {
      navigate("/app", { replace: true });
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card-glow rounded-3xl border border-border bg-surface p-6">
          {mode !== "forgot" && (
            <div className="mb-5 flex gap-1 rounded-full bg-surface-2 p-1">
              <button
                type="button"
                onClick={() => changeMode("signin")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  mode === "signin" ? "bg-ink text-bg" : "text-muted"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => changeMode("signup")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  mode === "signup" ? "bg-ink text-bg" : "text-muted"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <h2 className="mb-5 text-center text-sm font-semibold text-ink">Recuperar senha</h2>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                autoComplete="email"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label className={labelClass}>Senha</label>
                <input
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                  setInfo(null);
                }}
                className="text-xs text-muted hover:text-ink hover:underline"
              >
                Esqueci minha senha
              </button>
            )}

            {error && <p className="text-sm text-pink">{error}</p>}
            {info && <p className="text-sm text-teal">{info}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? "Aguarde..."
                : mode === "signin"
                  ? "Entrar"
                  : mode === "signup"
                    ? "Criar conta"
                    : "Enviar link de recuperação"}
            </Button>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => changeMode("signin")}
                className="w-full text-center text-xs text-muted hover:text-ink hover:underline"
              >
                Voltar para o login
              </button>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-subtle">
          Seus dados ficam salvos com segurança na nuvem (Supabase) e sincronizam entre seus dispositivos.
        </p>
      </div>
    </div>
  );
}

function translateError(message: string) {
  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
  }
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("already registered")) return "Esse e-mail já tem uma conta. Tente entrar.";
  if (message.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  return message;
}
