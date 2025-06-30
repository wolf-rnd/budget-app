import React, { useState, useEffect, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import FundModal from '../components/Funds/FundModal';
import FundsTable from '../components/Funds/FundsTable';
import FundsSummary from '../components/Funds/FundsSummary';
import UndoNotification from '../components/Funds/UndoNotification';
import { UndoNotification as UndoNotificationType } from '../components/Funds/types';
import { useFundsData } from '../hooks/useFundsData';
import { UpdateFundRequest } from '../services/fundsService';

const Funds: React.FC = () => {
  // Custom hook for data management
  const {
    funds,
    categories,
    budgetYears,
    loading,
    error,
    dataLoaded,
    createFund,
    updateFund,
    deleteFund,
    updateFundBudget,
    activateFund,
    deactivateFund,
    getEditingFund,
    refreshData,
    refreshCategories // פונקציה חדשה לרענון קטגוריות
  } = useFundsData();

  // Local state
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<UpdateFundRequest | null>(null);
  const [undoNotification, setUndoNotification] = useState<UndoNotificationType | null>(null);
  const [fundId, setFundId] = useState<string>('');
  // Cleanup undo notification
  useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  // Handlers
  const handleAddFund = () => {
    setEditingFund(null);
    setIsFundModalOpen(true);
  };

  const handleEditFund = (id: string) => {
    const fund = getEditingFund(id);
    if (fund) {
      setEditingFund(fund);
      setFundId(id);
      setIsFundModalOpen(true);
    }
  };

  const handleDeleteFund = async (id: string) => {
    const fundToDelete = funds.find(fund => fund.id === id);
    if (!fundToDelete) return;

    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הקופה "${fundToDelete.name}"?`)) {
      await deleteFund(id);

      const timeoutId = setTimeout(() => {
        setUndoNotification(null);
      }, 3000);

      setUndoNotification({
        fundId: id,
        fundName: fundToDelete.name,
        timeoutId
      });
    }
  };

  const handleActivateFund = async (id: string) => {
    await activateFund(id);
  };

  const handleDeactivateFund = async (id: string) => {
    await deactivateFund(id);
  };

  const handleUpdateBudget = async (fundId: string, budgetYearId: string, amount: number) => {
    await updateFundBudget(fundId, budgetYearId, { amount });
  };

  const handleUndo = async () => {
    if (undoNotification) {
      try {
        await refreshData();
        clearTimeout(undoNotification.timeoutId);
        setUndoNotification(null);
      } catch (error) {
        console.error('Failed to undo fund deletion:', error);
      }
    }
  };

  const handleCloseNotification = () => {
    if (undoNotification) {
      clearTimeout(undoNotification.timeoutId);
      setUndoNotification(null);
    }
  };

  // Handler לסגירת המודל עם רענון קטגוריות
  const handleModalClose = useCallback(() => {
    setIsFundModalOpen(false);
    setEditingFund(null);
    // רענון קטגוריות כדי לקבל קטגוריות חדשות שנוצרו
    refreshCategories();
  }, [refreshCategories]);

  // Loading state
  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען קופות...</h2>
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
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת הקופות</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 mx-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet size={28} className="text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ניהול קופות</h1>
                <p className="text-gray-600">
                  הגדרת קופות, תקציבים וקטגוריות ({funds.length} קופות)
                </p>
              </div>
            </div>

            <button
              onClick={handleAddFund}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
            >
              <Wallet size={16} />
              הוספת קופה חדשה
            </button>
          </div>
        </div>

        {/* סיכום קופות */}
        <FundsSummary funds={funds} />

        {/* טבלת קופות */}
        <FundsTable
          funds={funds}
          categories={categories}
          budgetYears={budgetYears}
          onEditFund={handleEditFund}
          onDeleteFund={handleDeleteFund}
          onActivateFund={handleActivateFund}
          onDeactivateFund={handleDeactivateFund}
          onUpdateBudget={handleUpdateBudget}
        />

        {/* מודל עריכה */}
        <FundModal
          isOpen={isFundModalOpen}
          onClose={handleModalClose} // שימוש ב-handler המעודכן
          onAddFund={createFund}
          onEditFund={updateFund}
          editingFund={editingFund}
          fundId={fundId}
          categories={categories}
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

export default Funds;