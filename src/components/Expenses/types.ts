// Types משותפים לכל קומפוננטות ההוצאות
import { GetExpenseRequest, UpdateExpenseRequest } from '../../services/expensesService';

export interface UndoNotification {
  expenseId: string;
  expenseName: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface FilterState {
  category: string;
  fund: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  search: string;
}

export interface SortState {
  field: 'date' | 'name' | 'amount' | 'category' | 'fund';
  direction: 'asc' | 'desc';
}

export type GroupBy = 'none' | 'category' | 'fund';

export interface PaginationState {
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

export interface InlineEditState {
  expenseId: string | null;
  field: 'name' | 'amount' | 'category' | 'fund' | 'note' | null;
  value: string;
  originalValue: string;
}

export interface ExpenseRowProps {
  expense: GetExpenseRequest;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  inlineEdit: InlineEditState;
  onStartInlineEdit: (expenseId: string, field: 'name' | 'amount' | 'note', currentValue: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onInlineEditChange: (value: string) => void;
  onInlineEditKeyPress: (e: React.KeyboardEvent) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}