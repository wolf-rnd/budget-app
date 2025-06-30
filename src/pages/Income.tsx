import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import IncomeModal from '../components/Modals/IncomeModal';
import IncomeFilters from '../components/Income/IncomeFilters';
import IncomeTable from '../components/Income/IncomeTable';
import IncomeSummary from '../components/Income/IncomeSummary';
import UndoNotification from '../components/Income/UndoNotification';
import { GroupBy, UndoNotification as UndoNotificationType } from '../components/Income/types';
import { useIncomeData } from '../hooks/useIncomeData';
import { UpdateIncomeRequest } from '../services/incomesService';

const Income: React.FC = () => {
  // Custom hook for data management
  const {
    incomes,
    summary,
    loading,
    error,
    dataLoaded,
    filters,
    sort,
    pagination,
    inlineEdit,
    uniqueSources,
    loadMoreData,
    handleFilterChange,
    clearFilters,
    handleSortChange,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
    createIncome,
    updateIncome,
    deleteIncome,
    getEditingIncome,
    resetAndLoadData,
    handleInlineEditChange,
    handleInlineEditKeyPress
  } = useIncomeData();

  // Local state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<UpdateIncomeRequest | null>(null);
  const [undoNotification, setUndoNotification] = useState<UndoNotificationType | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('source');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showGroupBy, setShowGroupBy] = useState(false);

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
    if (inlineEdit.incomeId && inlineEdit.field && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [inlineEdit.incomeId, inlineEdit.field]);

  // Cleanup undo notification
  useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  // Computed values
  const groupedIncomes = useMemo(() => {
    if (groupBy === 'none') return {};
    
    return incomes.reduce((groups, income) => {
      let groupName: string;
      
      switch (groupBy) {
        case 'source':
          groupName = income.source || 'ללא מקור';
          break;
        case 'month':
          groupName = `${income.month}/${income.year}`;
          break;
        case 'year':
          groupName = income.year.toString();
          break;
        default:
          groupName = 'לא ידוע';
      }
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(income);
      return groups;
    }, {} as Record<string, typeof incomes>);
  }, [incomes, groupBy]);

  const groupSums = useMemo(() => {
    const sums: Record<string, number> = {};
    Object.entries(groupedIncomes).forEach(([groupName, groupIncomes]) => {
      sums[groupName] = groupIncomes.reduce((sum, income) => sum + income.amount, 0);
    });
    return sums;
  }, [groupedIncomes]);

  // Auto-expand groups when groupBy changes
  useEffect(() => {
    if (groupBy === 'none') return;
    const allGroups = Object.keys(groupedIncomes);
    setExpandedGroups(Object.fromEntries(allGroups.map(g => [g, true])));
  }, [groupBy, groupedIncomes]);

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

  const handleAddIncome = () => {
    setEditingIncome(null);
    setIsIncomeModalOpen(true);
  };

  const handleEditIncome = (id: string) => {
    const income = getEditingIncome(id);
    if (income) {
      setEditingIncome(income);
      setIsIncomeModalOpen(true);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    const incomeToDelete = incomes.find(income => income.id === id);
    if (!incomeToDelete) return;

    await deleteIncome(id);

    const timeoutId = setTimeout(() => {
      setUndoNotification(null);
    }, 3000);

    setUndoNotification({
      incomeId: id,
      incomeName: incomeToDelete.name,
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
        console.error('Failed to undo income deletion:', error);
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
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען הכנסות...</h2>
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
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההכנסות</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
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
            <TrendingUp size={20} className="text-emerald-500" />
            <h1 className="text-lg font-bold text-gray-800">הכנסות</h1>
            <span className="text-sm text-gray-500">
              ({incomes.length} הכנסות{pagination.hasMore ? '+' : ''})
            </span>
          </div>
        </div>

        {/* סיכום הכנסות */}
        {summary && (
          <IncomeSummary summary={summary} />
        )}

        {/* פילטרים */}
        <IncomeFilters
          filters={filters}
          groupBy={groupBy}
          showFilters={showFilters}
          showGroupBy={showGroupBy}
          uniqueSources={uniqueSources}
          onFilterChange={handleFilterChange}
          onGroupByChange={handleGroupByChange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onToggleGroupBy={() => setShowGroupBy(!showGroupBy)}
          onClearFilters={clearFilters}
          onAddIncome={handleAddIncome}
        />

        {/* טבלה */}
        <IncomeTable
          incomes={incomes}
          groupBy={groupBy}
          groupedIncomes={groupedIncomes}
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
          onEditIncome={handleEditIncome}
          onDeleteIncome={handleDeleteIncome}
          onStartInlineEdit={startInlineEdit}
          onSaveInlineEdit={saveInlineEdit}
          onCancelInlineEdit={cancelInlineEdit}
          onInlineEditChange={handleInlineEditChange}
          onInlineEditKeyPress={handleInlineEditKeyPress}
        />

        {/* מודל עריכה */}
        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => {
            setIsIncomeModalOpen(false);
            setEditingIncome(null);
          }}
          onAddIncome={createIncome}
          onEditIncome={updateIncome}
          editingIncome={editingIncome}
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

export default Income;