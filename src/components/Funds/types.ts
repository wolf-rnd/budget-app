// Types משותפים לכל קומפוננטות הקופות
import { GetFundRequest, CreateFundRequest, UpdateFundRequest } from '../../services/fundsService';
import { GetCategoryRequest } from '../../services/categoriesService';
import { BudgetYear } from '../../services/budgetYearsService';

export interface UndoNotification {
  fundId: string;
  fundName: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface FundRowProps {
  fund: GetFundRequest;
  categories: GetCategoryRequest[];
  budgetYears: BudgetYear[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onUpdateBudget: (fundId: string, budgetYearId: string, amount: number) => void;
}

export interface BudgetEditState {
  fundId: string | null;
  budgetYearId: string | null;
  value: string;
  originalValue: string;
}
