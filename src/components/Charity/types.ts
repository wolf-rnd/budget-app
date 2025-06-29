// Types משותפים לכל קומפוננטות המעשרות
import { TitheGiven, UpdateTitheRequest } from '../../services/titheService';

export interface UndoNotification {
  titheId: string;
  titheName: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  search: string;
}

export interface SortState {
  field: 'date' | 'description' | 'amount';
  direction: 'asc' | 'desc';
}

export type GroupBy = 'none' | 'month' | 'year';

export interface PaginationState {
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

export interface InlineEditState {
  titheId: string | null;
  field: 'description' | 'amount' | 'note' | null;
  value: string;
  originalValue: string;
}

export interface TitheRowProps {
  tithe: TitheGiven;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  inlineEdit: InlineEditState;
  onStartInlineEdit: (titheId: string, field: 'description' | 'amount' | 'note', currentValue: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onInlineEditChange: (value: string) => void;
  onInlineEditKeyPress: (e: React.KeyboardEvent) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}