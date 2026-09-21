import { useState } from "react";
import { useFinance, type AccountWithBalance } from "../context/FinanceContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProgressBar } from "../components/ui/ProgressBar";
import { AccountForm } from "../components/accounts/AccountForm";
import { formatCurrency } from "../lib/format";
import type { Account } from "../lib/types";

const typeLabels: Record<Account["type"], string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit_card: "Cartão de crédito",
  cash: "Dinheiro",
};

export default function Accounts() {
  const { accounts, deleteAccount } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountWithBalance | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<AccountWithBalance | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(a: AccountWithBalance) {
    setEditing(a);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contas e cartões</h1>
          <p className="mt-1 text-sm text-muted">Gerencie suas contas bancárias e cartões</p>
        </div>
        <Button onClick={openNew}>+ Nova conta</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => {
          const isCard = a.type === "credit_card";
          const used = isCard && a.limit ? (Math.abs(a.balance) / a.limit) * 100 : 0;
          return (
            <Card key={a.id} className="group relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: a.color }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted">{typeLabels[a.type]}</p>
                  <h3 className="mt-0.5 font-semibold">{a.name}</h3>
                </div>
                <div className="hidden items-center gap-1 group-hover:flex">
                  <button
                    onClick={() => openEdit(a)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                    aria-label="Editar"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => setDeleteTarget(a)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                    aria-label="Excluir"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <p
                className="mt-4 text-2xl font-bold"
                style={{ color: a.balance < 0 ? "#f4577f" : undefined }}
              >
                {formatCurrency(a.balance)}
              </p>

              {isCard && a.limit ? (
                <div className="mt-4 space-y-1.5">
                  <ProgressBar value={used} color={a.color} />
                  <p className="text-xs text-subtle">
                    {formatCurrency(Math.abs(a.balance))} de {formatCurrency(a.limit)} usados
                  </p>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar conta" : "Nova conta"}
      >
        <AccountForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== undefined}
        title="Excluir conta"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? As transações associadas a ela também serão excluídas. Essa ação não pode ser desfeita.`}
        onConfirm={() => deleteAccount(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
}
