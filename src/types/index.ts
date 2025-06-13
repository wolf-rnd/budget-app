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
  name: string; // שינוי מ-description ל-name
  amount: number;
  category: string;
  fund: string;
  date: string;
  note?: string; // הוספת שדה הערה
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
  totalSavings?: number; // תאימות לאחור
  totalLiabilities?: number; // תאימות לאחור
  assets?: Record<string, number>; // פירוט נכסים חדש
  liabilities?: Record<string, number>; // פירוט התחייבויות חדש
  date: string;
  note: string;
}

export interface Category {
  name: string;
  fund: string;
}