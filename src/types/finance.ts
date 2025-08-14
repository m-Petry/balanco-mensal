export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string;
}

export interface MonthlyData {
  year: number;
  month: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const defaultCategories: Category[] = [
  // Income categories
  { id: 'salary', name: 'Salário', color: '#22c55e', type: 'income' },
  { id: 'freelance', name: 'Freelance', color: '#10b981', type: 'income' },
  { id: 'investments', name: 'Investimentos', color: '#059669', type: 'income' },
  { id: 'bonus', name: 'Bônus', color: '#047857', type: 'income' },
  { id: 'transfer-in', name: 'Saldo Anterior (Positivo)', color: '#16a34a', type: 'income' },
  
  // Expense categories
  { id: 'housing', name: 'Moradia', color: '#ef4444', type: 'expense' },
  { id: 'food', name: 'Alimentação', color: '#f97316', type: 'expense' },
  { id: 'transport', name: 'Transporte', color: '#eab308', type: 'expense' },
  { id: 'healthcare', name: 'Saúde', color: '#ec4899', type: 'expense' },
  { id: 'education', name: 'Educação', color: '#8b5cf6', type: 'expense' },
  { id: 'entertainment', name: 'Lazer', color: '#06b6d4', type: 'expense' },
  { id: 'shopping', name: 'Compras', color: '#84cc16', type: 'expense' },
  { id: 'utilities', name: 'Contas', color: '#6366f1', type: 'expense' },
  { id: 'insurance', name: 'Seguros', color: '#f59e0b', type: 'expense' },
  { id: 'transfer-out', name: 'Saldo Anterior (Negativo)', color: '#dc2626', type: 'expense' },
  { id: 'others', name: 'Outros', color: '#64748b', type: 'expense' }
];