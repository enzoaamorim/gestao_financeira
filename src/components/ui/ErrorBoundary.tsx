import { Component, type ErrorInfo, type ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center text-ink">
          <Logo />
          <div>
            <h1 className="text-xl font-bold">Algo deu errado</h1>
            <p className="mt-2 text-sm text-muted">Ocorreu um erro inesperado. Tente recarregar a página.</p>
          </div>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
