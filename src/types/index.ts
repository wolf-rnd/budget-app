export interface Fund {
  id: string;
  name: string;
  type: 'monthly' | 'annual' | 'savings';
  amount: number;
  level: 1 | 2 | 3;
  includeInBudget: boolean;
  amountGiven?: number;
  spent?: number;
  categories: string[];
  budgetYearId?: string; // קישור לשנת תקציב
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
  budgetYearId?: string; // קישור לשנת תקציב
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
  budgetYearId?: string; // קישור לשנת תקציב
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
  totalSavings?: number;
  totalLiabilities?: number;
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
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface FundBudget {
  id: string;
  fundId: string;
  budgetYearId: string;
  amount: number;
  amountGiven?: number;
  spent?: number;
}