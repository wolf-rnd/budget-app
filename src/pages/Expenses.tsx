import React, { useState, useMemo, useEffect } from 'react';
import { TrendingDown, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Undo2, X } from 'lucide-react';
import ExpenseModal from '../components/Modals/ExpenseModal';
import { filterExpensesByBudgetYear } from '../utils/budgetUtils';

// Import services instead of JSON data
import { CreateExpenseRequest, expensesService, GetExpenseRequest, UpdateExpenseRequest } from '../services/expensesService';
import { categoriesService, GetCategoryRequest } from '../services/categoriesService';
import { BudgetYear, budgetYearsService } from '../services/budgetYearsService';
import { useBudgetYearStore } from '../store/budgetYearStore';
import { mapObject } from '../utils/mappers';

interface UndoNotification {
  expenseId: string;
  expenseName: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

// אין צורך ב-selectedBudgetYear כ-prop, הכל מה-store

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<GetExpenseRequest[]>([]);
  const [categories, setCategories] = useState<GetCategoryRequest[]>([]);
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<UpdateExpenseRequest | null>(null);
  const [undoNotification, setUndoNotification] = useState<UndoNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFund, setSelectedFund] = useState('');

  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);
  const itemsPerPage = 10;

  // קיבוץ והרחבה
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'fund'>('none');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  // ברירת מחדל: כל הקבוצות פתוחות כשמשנים קיבוץ
  useEffect(() => {
    if (groupBy === 'none') return;
    const allGroups = Object.keys(groupedExpenses);
    setExpandedGroups(Object.fromEntries(allGroups.map(g => [g, true])));
    // eslint-disable-next-line
  }, [groupBy]);


  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesData, budgetYearsData] = await Promise.all([
        categoriesService.getAllCategories(),
        budgetYearsService.getAllBudgetYears()
      ]);

      setCategories(categoriesData);
      setBudgetYears(budgetYearsData);
      const expensesData = await expensesService.getAllExpenses(
        selectedBudgetYearId ? { budget_year_id: selectedBudgetYearId } : undefined
      );
      setExpenses(expensesData);
    } catch (err) {
      console.error('Failed to load expenses data:', err);
      setError('שגיאה בטעינת נתוני ההוצאות');
    } finally {
      setLoading(false);
    }
  };

  const currentBudgetYear = selectedBudgetYearId;

  const fundColors: Record<string, string> = {
    'קופת שוטף': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'תקציב שנתי': 'bg-blue-100 text-blue-800 border-blue-300',
    'תקציב מורחב': 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const uniqueFunds = Array.from(new Set(categories.map(cat => cat.fund)));
  // אין צורך בסינון לפי שנת תקציב בקליינט – הסינון מתבצע בשרת
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const categoryMatch = !selectedCategory || expense.categories?.name === selectedCategory;
      const fundMatch = !selectedFund || expense.funds?.name === selectedFund;
      return categoryMatch && fundMatch;
    });
  }, [expenses, selectedCategory, selectedFund]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const groupedExpenses = useMemo(() => {
    if (groupBy === 'none') return {};
    const key = groupBy === 'category' ? 'categories' : 'funds';
    return filteredExpenses.reduce((groups, expense) => {
      const groupName = expense[key]?.name || 'לא ידוע';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(expense);
      return groups;
    }, {} as Record<string, GetExpenseRequest[]>);
  }, [filteredExpenses, groupBy]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedFund, currentBudgetYear]);

  React.useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleExpenseModalSubmit = async (newExpense: CreateExpenseRequest) => {
    try {
      const createdExpense = await expensesService.createExpense(newExpense);
      setExpenses([createdExpense, ...expenses]);
      console.log('הוצאה חדשה נוספה:', createdExpense);
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleEditExpense = (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      // שימוש בפונקציה הגנרית להמרה
      const editingExpense = mapObject<typeof expense, UpdateExpenseRequest>(expense, [
        'id', 'name', 'amount', 'category_id', 'fund_id', 'date', 'note', 'budget_year_id'
      ]);
      setEditingExpense(editingExpense);
      setIsExpenseModalOpen(true);
    }
  };

  const handleExpenseEditSubmit = async (id: string, updatedExpense: UpdateExpenseRequest) => {
    try {
      const updated = await expensesService.updateExpense(id, updatedExpense);
      setExpenses(expenses.map(expense =>
        expense.id === id ? updated : expense
      ));
      console.log('הוצאה עודכנה:', updated);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === id);
    if (!expenseToDelete) return;

    try {
      await expensesService.deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));

      const timeoutId = setTimeout(() => {
        setUndoNotification(null);
        console.log('מחיקה סופית של הוצאה:', expenseToDelete.name);
      }, 3000);

      setUndoNotification({
        expenseId: id,
        expenseName: expenseToDelete.name,
        timeoutId
      });
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleUndo = async () => {
    if (undoNotification) {
      try {
        // כאן נוכל להוסיף קריאה ל-API לשחזור ההוצאה
        // לעת עתה נטען מחדש את הנתונים
        await loadData();

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedFund('');
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההוצאות</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={28} className="text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הוצאות</h1>
              <p className="text-gray-600">
                ניהול וצפייה בהוצאות - {budgetYears.find(year => year.is_active)?.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
              >
                <option value="">כל הקטגוריות</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">קופה</label>
              <select
                value={selectedFund}
                onChange={(e) => setSelectedFund(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
              >
                <option value="">כל הקופות</option>
                {uniqueFunds.map(fund => (
                  <option key={fund} value={fund}>
                    {fund}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                נקה פילטרים
              </button>
              <button
                onClick={handleAddExpense}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus size={16} />
                הוספת הוצאה
              </button>
            </div>
          </div>

          {(selectedCategory || selectedFund) && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span>פילטרים פעילים:</span>
                {selectedCategory && (
                  // <span className={`px-2 py-1 rounded-full text-xs border ${expense.categories?.color_class || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                  <span className={`px-2 py-1 rounded-full text-xs border 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {selectedCategory}
                  </span>
                )}
                {selectedFund && (
                  // <span className={`px-2 py-1 rounded-full text-xs border ${fundColors[selectedFund] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                  <span className={`px-2 py-1 rounded-full text-xs border 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {selectedFund}
                  </span>
                )}
                <span className="text-amber-600">
                  ({filteredExpenses.length} תוצאות)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                רשימת הוצאות ({filteredExpenses.length} הוצאות)
              </h2>
              <div className="text-sm text-gray-500">
                עמוד {currentPage} מתוך {totalPages}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קטגוריה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קופה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הערה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentExpenses.length > 0 ? (
                  currentExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{expense.name}</div>

                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${expense.categories?.color_class || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {expense.categories?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${expense.funds?.color_class || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {expense.funds?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {expense.note || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditExpense(expense.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="עריכה"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="מחיקה"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <TrendingDown size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">אין הוצאות להצגה</p>
                        <p className="text-sm">נסה לשנות את הפילטרים או להוסיף הוצאה חדשה</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  מציג {startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} מתוך {filteredExpenses.length} הוצאות
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${page === currentPage
                          ? 'bg-amber-500 text-white'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onAddExpense={handleExpenseModalSubmit}
          onEditExpense={handleExpenseEditSubmit}
          categories={categories}
          editingExpense={editingExpense}
        />

        {undoNotification && (
          <div className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-red-500 animate-slide-up z-50 max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Trash2 size={16} className="flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">הוצאה נמחקה!</p>
                  <p className="text-xs opacity-90 break-words">"{undoNotification.expenseName}"</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleUndo}
                  className="bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <Undo2 size={12} />
                  ביטול
                </button>

                <button
                  onClick={handleCloseNotification}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="mt-2 w-full bg-red-500 rounded-full h-1">
              <div className="bg-white h-1 rounded-full animate-progress-bar"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;