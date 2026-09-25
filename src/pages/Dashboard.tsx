import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useFinance } from "../context/FinanceContext";
import { Card } from "../components/ui/Card";
import { formatCurrency, formatDate } from "../lib/format";

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export default function Dashboard() {
  const { transactions, accounts, categories, categoryById } = useFinance();

  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts],
  );

  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === currentMonthKey),
    [transactions, currentMonthKey],
  );

  const monthIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const monthExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([categoryId, value]) => {
        const cat = categoryById(categoryId);
        return { name: cat?.name ?? "Outros", value, color: cat?.color ?? "#9a9aa3" };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions, categoryById]);

  const monthlyEvolution = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const key = monthKey(t.date);
      const entry = map.get(key) ?? { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({
        month: new Date(`${key}-02`).toLocaleDateString("pt-BR", { month: "short" }),
        Receitas: v.income,
        Despesas: v.expense,
      }));
  }, [transactions]);

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Resumo de {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium text-muted">Saldo total</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(totalBalance)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted">Receitas do mês</p>
          <p className="mt-2 text-2xl font-bold text-teal">{formatCurrency(monthIncome)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted">Despesas do mês</p>
          <p className="mt-2 text-2xl font-bold text-pink">{formatCurrency(monthExpense)}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <p className="mb-4 text-sm font-semibold">Receitas x Despesas (últimos meses)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262b" vertical={false} />
                <XAxis dataKey="month" stroke="#6b6b74" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b6b74" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "#1b1b1f", border: "1px solid #26262b", borderRadius: 12 }}
                  labelStyle={{ color: "#f5f5f4" }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Bar dataKey="Receitas" fill="#3ed9b0" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="#f4577f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="mb-4 text-sm font-semibold">Gastos por categoria (mês)</p>
          {expenseByCategory.length === 0 ? (
            <p className="py-10 text-center text-sm text-subtle">Sem despesas neste mês.</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {expenseByCategory.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1b1b1f", border: "1px solid #26262b", borderRadius: 12 }}
                      formatter={(v) => formatCurrency(Number(v))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {expenseByCategory.slice(0, 4).map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-medium text-ink">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card>
        <p className="mb-4 text-sm font-semibold">Últimas transações</p>
        {recentTransactions.length === 0 ? (
          <p className="py-10 text-center text-sm text-subtle">Nenhuma transação registrada ainda.</p>
        ) : (
        <div className="space-y-3">
          {recentTransactions.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-base">
                    {cat?.icon ?? "📦"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-subtle">
                      {cat?.name} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === "income" ? "text-teal" : "text-pink"}`}>
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
        )}
      </Card>
    </div>
  );
}
