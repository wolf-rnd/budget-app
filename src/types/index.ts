export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Fund {
  id: string;
  name: string;
  type: 'monthly' | 'annual' | 'savings';
  amount: number;
  level: 1 | 2 | 3;
  include_in_budget: boolean;
  amount_given?: number;
  spent?: number;
  categories: string[];
  budget_year_id?: string; // קישור לשנת תקציב
}

export interface Income {
  id: string;
  name: string;
  month: number;
  year: number;
  amount: number;
  date: string;
  source?: string;
  note?: string;
  budget_year_id?: string; // קישור לשנת תקציב
}

export interface ExpectedIncome {
  id: string;
  name: string;
  amount: number;
  note: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  fund: string;
  date: string;
  note?: string;
  budget_year_id?: string; // קישור לשנת תקציב
  // API response additions:
  categories?: {
    name: string;
    color_class?: string | null;
  };
  funds?: {
    name: string;
    type?: string;
    color_class?: string | null;
  };
}

export interface TitheGiven {
  id: string;
  description: string;
  amount: number;
  note: string;
  date: string;
}

export interface Debt {
  id: string;
  description: string;
  amount: number;
  note: string;
  type?: 'owed_to_me' | 'i_owe';
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  important: boolean;
}

export interface AssetSnapshot {
  id: string;
  total_savings?: number;
  total_liabilities?: number;
  assets?: Record<string, number>;
  liabilities?: Record<string, number>;
  date: string;
  note: string;
}

export interface Category {
  name: string;
  fund: string;
}

export interface BudgetYear {
  id: string;
  name: string; // פורמט: mm/yy - mm/yy
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface FundBudget {
  id: string;
  fund_id: string;
  budget_year_id: string;
  amount: number;
  amount_given?: number;
  spent?: number;
}

