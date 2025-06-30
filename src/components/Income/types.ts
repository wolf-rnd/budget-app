// Types משותפים לכל קומפוננטות ההכנסות
import { Income, UpdateIncomeRequest } from '../../services/incomesService';

export interface UndoNotification {
  incomeId: string;
  incomeName: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface FilterState {
  source: string;
  month: string;
  year: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  search: string;
}

export interface SortState {
  field: 'date' | 'name' | 'amount' | 'source' | 'month' | 'year';
  direction: 'asc' | 'desc';
}

export type GroupBy = 'none' | 'source' | 'month' | 'year';

export interface PaginationState {
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

export interface InlineEditState {
  incomeId: string | null;
  field: 'name' | 'amount' | 'source' | 'note' | null;
  value: string;
  originalValue: string;
}

export interface IncomeRowProps {
  income: Income;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  inlineEdit: InlineEditState;
  onStartInlineEdit: (incomeId: string, field: 'name' | 'amount' | 'source' | 'note', currentValue: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onInlineEditChange: (value: string) => void;
  onInlineEditKeyPress: (e: React.KeyboardEvent) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}