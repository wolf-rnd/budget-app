import { BudgetYear, Fund, Income, Expense, TitheGiven, Debt, Task, AssetSnapshot, Category } from '../types';

// Mock data for fallback when API is unavailable
export const mockBudgetYears: BudgetYear[] = [
  {
    id: '1',
    name: 'שנת תקציב 2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockFunds: Fund[] = [
  {
    id: '1',
    name: 'קופת יומיום',
    type: 'monthly',
    level: 1,
    amount: 5000,
    includeInBudget: true,
    categories: ['מזון', 'תחבורה'],
    budgets: [{
      budgetYearId: '1',
      amount: 5000,
      amountGiven: 0,
      spent: 0
    }]
  },
  {
    id: '2',
    name: 'קופת חירום',
    type: 'savings',
    level: 2,
    amount: 10000,
    includeInBudget: false,
    categories: ['חירום'],
    budgets: [{
      budgetYearId: '1',
      amount: 10000,
      amountGiven: 0,
      spent: 0
    }]
  }
];

export const mockIncomes: Income[] = [
  {
    id: '1',
    name: 'משכורת',
    amount: 15000,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: new Date().toISOString().split('T')[0],
    source: 'עבודה',
    note: ''
  }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    name: 'קניות שבועיות',
    amount: 800,
    category: 'מזון',
    fund: 'קופת יומיום',
    date: new Date().toISOString().split('T')[0],
    note: ''
  }
];

export const mockTithes: TitheGiven[] = [
  {
    id: '1',
    description: 'מעשר חודשי',
    amount: 1500,
    note: '',
    date: new Date().toISOString().split('T')[0]
  }
];

export const mockDebts: Debt[] = [
  {
    id: '1',
    description: 'הלוואה לחבר',
    amount: 2000,
    note: '',
    type: 'owed_to_me',
    isPaid: false
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    description: 'לבדוק ביטוח רכב',
    important: true,
    completed: false
  },
  {
    id: '2',
    description: 'לשלם חשבון חשמל',
    important: false,
    completed: false
  }
];

export const mockAssetSnapshots: AssetSnapshot[] = [
  {
    id: '1',
    assets: {
      'חשבון בנק': 50000,
      'קופת גמל': 100000,
      'דירה': 1500000
    },
    liabilities: {
      'משכנתא': 800000
    },
    note: 'תמונת מצב חודשית',
    date: new Date().toISOString().split('T')[0]
  }
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'מזון',
    fund: 'קופת יומיום',
    fundId: '1',
    isActive: true
  },
  {
    id: '2',
    name: 'תחבורה',
    fund: 'קופת יומיום',
    fundId: '1',
    isActive: true
  },
  {
    id: '3',
    name: 'חירום',
    fund: 'קופת חירום',
    fundId: '2',
    isActive: true
  }
];