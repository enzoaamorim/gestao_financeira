import { useState } from "react";
import type { Account, AccountType } from "../../lib/types";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";

const typeLabels: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit_card: "Cartão de crédito",
  cash: "Dinheiro",
};

const colorOptions = ["#3ed9b0", "#f4577f", "#f4c744", "#8b7bf7", "#5fb0f0"];

interface Props {
  initial?: Account;
  onDone: () => void;
}

export function AccountForm({ initial, onDone }: Props) {
  const { addAccount, updateAccount } = useFinance();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "checking");
  const [balance, setBalance] = useState(initial ? String(initial.balance) : "");
  const [limit, setLimit] = useState(initial?.limit ? String(initial.limit) : "");
  const [color, setColor] = useState(initial?.color ?? colorOptions[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const balanceValue = parseFloat(balance.replace(",", ".") || "0");
    if (!name.trim() || Number.isNaN(balanceValue)) return;

    const payload: Omit<Account, "id"> = {
      name: name.trim(),
      type,
      balance: balanceValue,
      color,
      ...(type === "credit_card" ? { limit: parseFloat(limit.replace(",", ".") || "0") } : {}),
    };

    if (initial) updateAccount(initial.id, payload);
    else addAccount(payload);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nome</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Nubank"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Tipo</label>
        <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{type === "credit_card" ? "Fatura atual (R$)" : "Saldo (R$)"}</label>
          <input
            className={inputClass}
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            required
          />
        </div>
        {type === "credit_card" && (
          <div>
            <label className={labelClass}>Limite (R$)</label>
            <input
              className={inputClass}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
            />
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Cor</label>
        <div className="flex gap-2">
          {colorOptions.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-shadow"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initial ? "Salvar alterações" : "Adicionar conta"}
      </Button>
    </form>
  );
}
