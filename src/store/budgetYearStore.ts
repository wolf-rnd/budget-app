import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetYear } from '../types';

interface BudgetYearStore {
  budgetYears: BudgetYear[];
  selectedBudgetYearId: string | null;
  setBudgetYears: (years: BudgetYear[]) => void;
  setSelectedBudgetYearId: (id: string) => void;
  getBudgetYearByDate: (date: string) => BudgetYear | undefined;
}

export const useBudgetYearStore = create<BudgetYearStore>()(
  persist(
    (set, get) => ({
      budgetYears: [],
      selectedBudgetYearId: null,
      setBudgetYears: (years) => set({ budgetYears: years }),
      setSelectedBudgetYearId: (id) => set({ selectedBudgetYearId: id }),
      getBudgetYearByDate: (date: string) => {
        const d = new Date(date);
        return get().budgetYears.find(
          y => new Date(y.start_date) <= d && new Date(y.end_date) >= d
        );
      },
    }),
    {
      name: 'budget-year-store',
      partialize: (state) => ({
        selectedBudgetYearId: state.selectedBudgetYearId,
        budgetYears: state.budgetYears,
      }),
    }
  )
);
