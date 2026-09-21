import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { CategoryForm } from "../components/categories/CategoryForm";
import type { Category, TransactionType } from "../lib/types";

export default function Categories() {
  const { categories, deleteCategory } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [newType, setNewType] = useState<TransactionType>("expense");

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  function openNew(type: TransactionType) {
    setEditing(undefined);
    setNewType(type);
    setFormOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setFormOpen(true);
  }

  function renderGroup(title: string, list: Category[], type: TransactionType) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button size="sm" variant="secondary" onClick={() => openNew(type)}>
            + Nova categoria
          </Button>
        </div>

        {list.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-subtle">Nenhuma categoria ainda.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <Card key={c.id} className="group flex items-center justify-between !p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: `${c.color}22` }}
                  >
                    {c.icon}
                  </span>
                  <p className="text-sm font-medium">{c.name}</p>
                </div>
                <div className="hidden items-center gap-1 group-hover:flex">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                    aria-label="Editar"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                    aria-label="Excluir"
                  >
                    🗑
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="mt-1 text-sm text-muted">
          Organize suas receitas e despesas do seu jeito. Categorias com transações não podem ser excluídas.
        </p>
      </div>

      {renderGroup("Despesas", expense, "expense")}
      {renderGroup("Receitas", income, "income")}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
      >
        <CategoryForm initial={editing} defaultType={newType} onDone={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
