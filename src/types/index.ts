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
}

export interface ExpectedIncome {
  id: string;
  name: string;
  amount: number;
  note: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  fund: string;
  date: string;
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
  type?: 'owed_to_me' | 'i_owe'; // הוספת שדה סוג חוב
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  important: boolean;
}

export interface AssetSnapshot {
  id: string;
  totalSavings: number;
  totalLiabilities: number;
  date: string;
  note: string;
}