import type { Category } from "./types";

/** Categorias padrão inseridas automaticamente no primeiro login de cada usuário. */
export const seedCategories: Category[] = [
  { id: "cat-salario", name: "Salário", icon: "💼", color: "#3ed9b0", type: "income" },
  { id: "cat-freelance", name: "Freelance", icon: "💻", color: "#8b7bf7", type: "income" },
  { id: "cat-alimentacao", name: "Alimentação", icon: "🍔", color: "#f4577f", type: "expense" },
  { id: "cat-transporte", name: "Transporte", icon: "🚗", color: "#f4c744", type: "expense" },
  { id: "cat-moradia", name: "Moradia", icon: "🏠", color: "#3ed9b0", type: "expense" },
  { id: "cat-lazer", name: "Lazer", icon: "🎮", color: "#8b7bf7", type: "expense" },
  { id: "cat-saude", name: "Saúde", icon: "💊", color: "#5fb0f0", type: "expense" },
  { id: "cat-outros", name: "Outros", icon: "📦", color: "#9a9aa3", type: "expense" },
];
