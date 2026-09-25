import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center text-ink">
      <Logo />
      <div>
        <h1 className="text-xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted">O endereço que você tentou acessar não existe.</p>
      </div>
      <Link to="/">
        <Button>Voltar para o início</Button>
      </Link>
    </div>
  );
}
