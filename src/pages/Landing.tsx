import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../lib/format";

const features = [
  {
    icon: "📊",
    title: "Dashboard visual",
    desc: "Veja seu saldo, gastos por categoria e a evolução do mês em gráficos simples de entender.",
  },
  {
    icon: "💸",
    title: "Receitas e despesas",
    desc: "Registre transações em segundos e organize tudo por categoria e conta.",
  },
  {
    icon: "🎯",
    title: "Metas e orçamento",
    desc: "Defina limites de gasto por categoria e acompanhe metas de economia com barra de progresso.",
  },
  {
    icon: "🏦",
    title: "Contas e cartões",
    desc: "Controle várias contas bancárias e faturas de cartão de crédito em um só lugar.",
  },
];

const advantages = [
  "Seus dados sincronizam entre celular e computador",
  "Backup automático — nunca perde suas transações",
  "Funciona como um app instalado (PWA)",
  "Interface rápida, sem anúncios ou distrações",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#recursos" className="hover:text-ink">Recursos</a>
            <a href="#vantagens" className="hover:text-ink">Vantagens</a>
          </nav>
          <Link to="/login">
            <Button size="sm">Entrar</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Sua vida financeira,
            <br />
            organizada com
            <br />
            <span className="text-teal">carinho</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted md:text-lg">
            O Amorim te ajuda a registrar receitas e despesas, acompanhar
            metas e enxergar pra onde seu dinheiro está indo — sem planilha,
            sem complicação.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/login">
              <Button>Começar agora</Button>
            </Link>
            <a href="#recursos">
              <Button variant="secondary">Ver recursos</Button>
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-md">
          <div className="card-glow relative z-10 rounded-3xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-muted">Saldo total</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(15936.6)}</p>
            <div className="mt-5 flex items-end gap-1.5">
              {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: `${h}px`,
                    backgroundColor: i === 5 ? "#f4c744" : "#26262b",
                  }}
                />
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted">Últimas transações</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-base">🍔</span>
                  <div>
                    <p className="text-sm font-medium">Delivery de comida</p>
                    <p className="text-xs text-subtle">Alimentação</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-pink">-R$ 42,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-base">💼</span>
                  <div>
                    <p className="text-sm font-medium">Salário</p>
                    <p className="text-xs text-subtle">Renda</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-teal">+R$ 6.200,00</span>
              </div>
            </div>
          </div>

          <div className="absolute -left-10 -top-6 z-20 hidden rotate-[-6deg] items-center gap-2 whitespace-nowrap rounded-full bg-pink px-4 py-2 text-sm font-semibold text-bg shadow-xl md:flex">
            🔥 Streak de 7 dias
          </div>
          <div className="absolute -right-8 -bottom-6 z-20 hidden rotate-[6deg] items-center gap-2 whitespace-nowrap rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-bg shadow-xl md:flex">
            💰 Meta em dia
          </div>
        </div>
      </section>

      <section id="recursos" className="border-t border-border px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Tudo que você precisa</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted">
            Um dashboard financeiro completo, sem complicação.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card-glow rounded-2xl border border-border bg-surface p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-xl">
                  {f.icon}
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="vantagens" className="border-t border-border px-4 py-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">
              Simples, rápido e <span className="text-yellow">só seu</span>
            </h2>
            <p className="mt-4 text-muted">
              Nada de burocracia. Abra o app e comece a organizar sua vida
              financeira agora mesmo.
            </p>
          </div>
          <ul className="space-y-4">
            {advantages.map((a) => (
              <li key={a} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">✓</span>
                <span className="text-sm text-ink/90">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20 md:px-8">
        <div className="card-glow mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-10 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Pronto para organizar sua grana?</h2>
          <p className="mt-3 text-muted">Comece agora, é grátis e roda direto no seu navegador.</p>
          <Link to="/login" className="mt-6 inline-block">
            <Button>Começar agora</Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-border px-4 py-16 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold text-ink">Por que o Amorim existe</h2>
          <p className="mt-3 text-sm text-muted">
            Cansei de planilha que ninguém atualiza e de app de banco que só
            mostra extrato. Criei o Amorim pra ter, num só lugar, uma visão
            simples e honesta de pra onde vai o meu dinheiro — e resolvi
            deixar aberto pra quem quiser usar também.
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-subtle md:px-8">
        <Logo className="mx-auto mb-3 justify-center" />
        Um projeto criado por Amorim, com carinho pela sua grana.
      </footer>
    </div>
  );
}
