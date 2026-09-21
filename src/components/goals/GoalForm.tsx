import { useState } from "react";
import type { Goal } from "../../lib/types";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";

const colorOptions = ["#3ed9b0", "#f4577f", "#f4c744", "#8b7bf7", "#5fb0f0"];
const iconOptions = ["🎯", "✈️", "🏠", "🚗", "🛟", "💍", "🎓", "📱"];

interface Props {
  initial?: Goal;
  onDone: () => void;
}

export function GoalForm({ initial, onDone }: Props) {
  const { addGoal, updateGoal } = useFinance();

  const [name, setName] = useState(initial?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : "");
  const [savedAmount, setSavedAmount] = useState(initial ? String(initial.savedAmount) : "0");
  const [color, setColor] = useState(initial?.color ?? colorOptions[0]);
  const [icon, setIcon] = useState(initial?.icon ?? iconOptions[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(",", "."));
    const saved = parseFloat(savedAmount.replace(",", ".") || "0");
    if (!name.trim() || Number.isNaN(target) || target <= 0) return;

    const payload: Omit<Goal, "id"> = { name: name.trim(), targetAmount: target, savedAmount: saved, color, icon };
    if (initial) updateGoal(initial.id, payload);
    else addGoal(payload);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nome da meta</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Viagem"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Valor alvo (R$)</label>
          <input
            className={inputClass}
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Já guardado (R$)</label>
          <input
            className={inputClass}
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Ícone</label>
        <div className="flex flex-wrap gap-2">
          {iconOptions.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() => setIcon(i)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors"
              style={{ backgroundColor: icon === i ? "#26262b" : "transparent", border: "1px solid #26262b" }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Cor</label>
        <div className="flex gap-2">
          {colorOptions.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition-shadow"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initial ? "Salvar alterações" : "Criar meta"}
      </Button>
    </form>
  );
}
