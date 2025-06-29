import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import TitheModal from '../components/Charity/TitheModal';
import TitheFilters from '../components/Charity/TitheFilters';
import TitheTable from '../components/Charity/TitheTable';
import TitheSummary from '../components/Charity/TitheSummary';
import UndoNotification from '../components/Charity/UndoNotification';
import { GroupBy, UndoNotification as UndoNotificationType } from '../components/Charity/types';
import { useTitheData } from '../hooks/useTitheData';
import { UpdateTitheRequest } from '../services/titheService';

const Charity: React.FC = () => {
  // Custom hook for data management
  const {
    tithes,
    summary,
    loading,
    error,
    dataLoaded,
    filters,
    sort,
    pagination,
    inlineEdit,
    loadMoreData,
    handleFilterChange,
    clearFilters,
    handleSortChange,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
    createTithe,
    updateTithe,
    deleteTithe,
    getEditingTithe,
    resetAndLoadData,
    handleInlineEditChange,
    handleInlineEditKeyPress
  } = useTitheData();

  // Local state
  const [isTitheModalOpen, setIsTitheModalOpen] = useState(false);
  const [editingTithe, setEditingTithe] = useState<UpdateTitheRequest | null>(null);
  const [undoNotification, setUndoNotification] = useState<UndoNotificationType | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
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
    if (inlineEdit.titheId && inlineEdit.field && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [inlineEdit.titheId, inlineEdit.field]);

  // Cleanup undo notification
  useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  // Computed values
  const groupedTithes = useMemo(() => {
    if (groupBy === 'none') return {};
    
    return tithes.reduce((groups, tithe) => {
      let groupName: string;
      
      switch (groupBy) {
        case 'month':
          const date = new Date(tithe.date);
          groupName = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        case 'year':
          groupName = new Date(tithe.date).getFullYear().toString();
          break;
        default:
          groupName = 'לא ידוע';
      }
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(tithe);
      return groups;
    }, {} as Record<string, typeof tithes>);
  }, [tithes, groupBy]);

  const groupSums = useMemo(() => {
    const sums: Record<string, number> = {};
    Object.entries(groupedTithes).forEach(([groupName, groupTithes]) => {
      sums[groupName] = groupTithes.reduce((sum, tithe) => sum + tithe.amount, 0);
    });
    return sums;
  }, [groupedTithes]);

  // Auto-expand groups when groupBy changes
  useEffect(() => {
    if (groupBy === 'none') return;
    const allGroups = Object.keys(groupedTithes);
    setExpandedGroups(Object.fromEntries(allGroups.map(g => [g, true])));
  }, [groupBy, groupedTithes]);

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

  const handleAddTithe = () => {
    setEditingTithe(null);
    setIsTitheModalOpen(true);
  };

  const handleEditTithe = (id: string) => {
    const tithe = getEditingTithe(id);
    if (tithe) {
      setEditingTithe(tithe);
      setIsTitheModalOpen(true);
    }
  };

  const handleDeleteTithe = async (id: string) => {
    const titheToDelete = tithes.find(tithe => tithe.id === id);
    if (!titheToDelete) return;

    await deleteTithe(id);

    const timeoutId = setTimeout(() => {
      setUndoNotification(null);
    }, 3000);

    setUndoNotification({
      titheId: id,
      titheName: titheToDelete.description,
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
        console.error('Failed to undo tithe deletion:', error);
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
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען מעשרות...</h2>
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
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת המעשרות</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
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
            <Heart size={20} className="text-pink-500" />
            <h1 className="text-lg font-bold text-gray-800">צדקה ומעשרות</h1>
            <span className="text-sm text-gray-500">
              ({tithes.length} מעשרות{pagination.hasMore ? '+' : ''})
            </span>
          </div>
        </div>

        {/* סיכום מעשרות */}
        {summary && (
          <TitheSummary summary={summary} />
        )}

        {/* פילטרים */}
        <TitheFilters
          filters={filters}
          groupBy={groupBy}
          showFilters={showFilters}
          showGroupBy={showGroupBy}
          onFilterChange={handleFilterChange}
          onGroupByChange={handleGroupByChange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onToggleGroupBy={() => setShowGroupBy(!showGroupBy)}
          onClearFilters={clearFilters}
          onAddTithe={handleAddTithe}
        />

        {/* טבלה */}
        <TitheTable
          tithes={tithes}
          groupBy={groupBy}
          groupedTithes={groupedTithes}
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
          onEditTithe={handleEditTithe}
          onDeleteTithe={handleDeleteTithe}
          onStartInlineEdit={startInlineEdit}
          onSaveInlineEdit={saveInlineEdit}
          onCancelInlineEdit={cancelInlineEdit}
          onInlineEditChange={handleInlineEditChange}
          onInlineEditKeyPress={handleInlineEditKeyPress}
        />

        {/* מודל עריכה */}
        <TitheModal
          isOpen={isTitheModalOpen}
          onClose={() => {
            setIsTitheModalOpen(false);
            setEditingTithe(null);
          }}
          onAddTithe={createTithe}
          onEditTithe={updateTithe}
          editingTithe={editingTithe}
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

export default Charity;