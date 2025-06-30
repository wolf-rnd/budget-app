import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingDown } from 'lucide-react';
import ExpenseModal from '../components/Modals/ExpenseModal';
import ExpenseFilters from '../components/Expenses/ExpenseFilters';
import ExpenseTable from '../components/Expenses/ExpenseTable';
import UndoNotification from '../components/Expenses/UndoNotification';
import { GroupBy, UndoNotification as UndoNotificationType } from '../components/Expenses/types';
import { useExpenseData } from '../hooks/useExpenseData';
import { UpdateExpenseRequest } from '../services/expensesService';

const Expenses: React.FC = () => {
  // Custom hook for data management
  const {
    expenses,
    categories,
    loading,
    error,
    dataLoaded,
    filters,
    sort,
    pagination,
    inlineEdit,
    uniqueFunds,
    loadMoreData,
    handleFilterChange,
    clearFilters,
    handleSortChange,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
    createExpense,
    updateExpense,
    deleteExpense,
    getEditingExpense,
    resetAndLoadData,
    handleInlineEditChange,
    handleInlineEditKeyPress
  } = useExpenseData();

  // Local state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<UpdateExpenseRequest | null>(null);
  const [undoNotification, setUndoNotification] = useState<UndoNotificationType | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('fund');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showGroupBy, setShowGroupBy] = useState(false);
  const [expenseId, setExpenseId] = useState<string | null>(null);

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && pagination.hasMore && !pagination.loading) {
          loadMoreData();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadingRef.current && observerRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.hasMore, pagination.loading, loadMoreData]);

  // Focus on edit input when starting inline edit
  useEffect(() => {
    if (inlineEdit.expenseId && inlineEdit.field && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [inlineEdit.expenseId, inlineEdit.field]);

  // Cleanup undo notification
  useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  // Computed values
  const groupedExpenses = useMemo(() => {
    if (groupBy === 'none') return {};
    
    const key = groupBy === 'category' ? 'categories' : 'funds';
    return expenses.reduce((groups, expense) => {
      const groupName = expense[key]?.name || 'לא ידוע';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(expense);
      return groups;
    }, {} as Record<string, typeof expenses>);
  }, [expenses, groupBy]);

  const groupSums = useMemo(() => {
    const sums: Record<string, number> = {};
    Object.entries(groupedExpenses).forEach(([groupName, groupExpenses]) => {
      sums[groupName] = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    });
    return sums;
  }, [groupedExpenses]);

  // Auto-expand groups when groupBy changes
  useEffect(() => {
    if (groupBy === 'none') return;
    const allGroups = Object.keys(groupedExpenses);
    setExpandedGroups(Object.fromEntries(allGroups.map(g => [g, true])));
  }, [groupBy, groupedExpenses]);

  // Handlers
  const handleGroupByChange = (newGroupBy: GroupBy) => {
    setGroupBy(newGroupBy);
    setShowGroupBy(false);
  };

  const handleToggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (id: string) => {
    const expense = getEditingExpense(id);
    if (expense) {
      setEditingExpense(expense);
      setExpenseId(id);
      setIsExpenseModalOpen(true);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === id);
    if (!expenseToDelete) return;

    await deleteExpense(id);

    const timeoutId = setTimeout(() => {
      setUndoNotification(null);
    }, 3000);

    setUndoNotification({
      expenseId: id,
      expenseName: expenseToDelete.name,
      timeoutId
    });
  };

  const handleUndo = async () => {
    if (undoNotification) {
      try {
        await resetAndLoadData();
        clearTimeout(undoNotification.timeoutId);
        setUndoNotification(null);
      } catch (error) {
        console.error('Failed to undo expense deletion:', error);
      }
    }
  };

  const handleCloseNotification = () => {
    if (undoNotification) {
      clearTimeout(undoNotification.timeoutId);
      setUndoNotification(null);
    }
  };

  // Loading state
  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען הוצאות...</h2>
          <p className="text-gray-600">אנא המתן בזמן טעינת הנתונים מהשרת</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההוצאות</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-3 mx-4 mt-4">
          <div className="flex items-center gap-3">
            <TrendingDown size={20} className="text-amber-500" />
            <h1 className="text-lg font-bold text-gray-800">הוצאות</h1>
            <span className="text-sm text-gray-500">
              ({expenses.length} הוצאות{pagination.hasMore ? '+' : ''})
            </span>
          </div>
        </div>

        {/* פילטרים */}
        <ExpenseFilters
          filters={filters}
          groupBy={groupBy}
          showFilters={showFilters}
          showGroupBy={showGroupBy}
          categories={categories}
          uniqueFunds={uniqueFunds}
          onFilterChange={handleFilterChange}
          onGroupByChange={handleGroupByChange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onToggleGroupBy={() => setShowGroupBy(!showGroupBy)}
          onClearFilters={clearFilters}
          onAddExpense={handleAddExpense}
        />

        {/* טבלה */}
        <ExpenseTable
          expenses={expenses}
          groupBy={groupBy}
          groupedExpenses={groupedExpenses}
          groupSums={groupSums}
          expandedGroups={expandedGroups}
          pagination={pagination}
          sort={sort}
          inlineEdit={inlineEdit}
          dataLoaded={dataLoaded}
          loadingRef={loadingRef}
          editInputRef={editInputRef}
          onSortChange={handleSortChange}
          onToggleGroup={handleToggleGroup}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onStartInlineEdit={startInlineEdit}
          onSaveInlineEdit={saveInlineEdit}
          onCancelInlineEdit={cancelInlineEdit}
          onInlineEditChange={handleInlineEditChange}
          onInlineEditKeyPress={handleInlineEditKeyPress}
        />

        {/* מודל עריכה */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onAddExpense={createExpense}
          onEditExpense={updateExpense}
          categories={categories}
          editingExpense={editingExpense}
          expenseId={expenseId}
        />  

        {/* נוטיפיקציית ביטול */}
        <UndoNotification
          notification={undoNotification}
          onUndo={handleUndo}
          onClose={handleCloseNotification}
        />
      </div>
    </div>
  );
};

export default Expenses;