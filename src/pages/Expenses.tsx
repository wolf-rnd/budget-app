import React, { useState, useMemo } from 'react';
import { TrendingDown, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Undo2, X } from 'lucide-react';
import { Expense, Category } from '../types';
import ExpenseModal from '../components/Modals/ExpenseModal';

// Import data
import expensesData from '../data/expenses.json';
import categoriesData from '../data/categories.json';

interface UndoNotification {
  expenseId: string;
  expenseName: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(expensesData.expenses);
  const [categories] = useState<Category[]>(categoriesData.categories);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [undoNotification, setUndoNotification] = useState<UndoNotification | null>(null);
  
  // פילטורים
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFund, setSelectedFund] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // צבעים לקטגוריות וקופות
  const categoryColors: Record<string, string> = {
    'מזון': 'bg-green-100 text-green-800 border-green-300',
    'תחבורה': 'bg-blue-100 text-blue-800 border-blue-300',
    'בילויים קטנים': 'bg-purple-100 text-purple-800 border-purple-300',
    'שירותים': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'תקשורת': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'ביגוד': 'bg-pink-100 text-pink-800 border-pink-300',
    'ריהוט': 'bg-orange-100 text-orange-800 border-orange-300',
    'מתנות': 'bg-red-100 text-red-800 border-red-300',
    'דיור': 'bg-gray-100 text-gray-800 border-gray-300',
    'ביטוח': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'בריאות': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'חינוך': 'bg-violet-100 text-violet-800 border-violet-300',
    'נופש': 'bg-teal-100 text-teal-800 border-teal-300',
    'תחזוקה': 'bg-amber-100 text-amber-800 border-amber-300',
    'השקעות קטנות': 'bg-lime-100 text-lime-800 border-lime-300',
    'שונות': 'bg-slate-100 text-slate-800 border-slate-300'
  };

  const fundColors: Record<string, string> = {
    'קופת שוטף': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'תקציב שנתי': 'bg-blue-100 text-blue-800 border-blue-300',
    'תקציב מורחב': 'bg-purple-100 text-purple-800 border-purple-300'
  };

  // קבלת רשימת קופות ייחודיות
  const uniqueFunds = Array.from(new Set(categories.map(cat => cat.fund)));

  // סינון הוצאות
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const categoryMatch = !selectedCategory || expense.category === selectedCategory;
      const fundMatch = !selectedFund || expense.fund === selectedFund;
      return categoryMatch && fundMatch;
    });
  }, [expenses, selectedCategory, selectedFund]);

  // חישוב pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  // איפוס עמוד כשמשנים פילטר
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedFund]);

  // ניקוי טיימר בעת unmount
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
    setIsExpenseModalOpen(true);
  };

  const handleExpenseModalSubmit = (newExpense: {
    name: string;
    amount: number;
    category: string;
    fund: string;
    date: string;
    note?: string;
  }) => {
    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: newExpense.amount,
      category: newExpense.category,
      fund: newExpense.fund,
      date: newExpense.date,
      note: newExpense.note
    };
    
    setExpenses([expense, ...expenses]);
    console.log('הוצאה חדשה נוספה:', newExpense);
  };

  const handleEditExpense = (id: string) => {
    console.log('עריכת הוצאה:', id);
    // TODO: פתיחת מודל עריכה
  };

  const handleDeleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === id);
    if (!expenseToDelete) return;

    // מחיקה מיידית
    setExpenses(expenses.filter(expense => expense.id !== id));

    // יצירת טיימר של 3 שניות - אחרי זה המחיקה הופכת סופית
    const timeoutId = setTimeout(() => {
      setUndoNotification(null);
      console.log('מחיקה סופית של הוצאה:', expenseToDelete.name);
    }, 3000);

    setUndoNotification({
      expenseId: id,
      expenseName: expenseToDelete.name,
      timeoutId
    });
  };

  const handleUndo = () => {
    if (undoNotification) {
      // החזרת ההוצאה למקומה
      const expenseToRestore = expensesData.expenses.find(expense => expense.id === undoNotification.expenseId);
      if (expenseToRestore) {
        setExpenses(prevExpenses => [expenseToRestore, ...prevExpenses]);
      }
      
      // ביטול הטיימר
      clearTimeout(undoNotification.timeoutId);
      
      // הסתרת הנוטיפיקציה
      setUndoNotification(null);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={28} className="text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הוצאות</h1>
              <p className="text-gray-600">ניהול וצפייה בכל ההוצאות</p>
            </div>
          </div>

          {/* כלי סינון */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* פילטר קטגוריה */}
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

            {/* פילטר קופה */}
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

            {/* כפתורים */}
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

          {/* מידע על פילטרים פעילים */}
          {(selectedCategory || selectedFund) && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span>פילטרים פעילים:</span>
                {selectedCategory && (
                  <span className={`px-2 py-1 rounded-full text-xs border ${categoryColors[selectedCategory] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {selectedCategory}
                  </span>
                )}
                {selectedFund && (
                  <span className={`px-2 py-1 rounded-full text-xs border ${fundColors[selectedFund] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
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

        {/* טבלת הוצאות */}
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
                          {expense.note && (
                            <div className="text-xs text-gray-500 mt-1">{expense.note}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${categoryColors[expense.category] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${fundColors[expense.fund] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                          {expense.fund}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">
                        {formatCurrency(expense.amount)}
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

          {/* Pagination */}
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
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                  
                  {/* מספרי עמודים */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          page === currentPage
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
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages 
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

        {/* מודל הוספת הוצאה */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onAddExpense={handleExpenseModalSubmit}
          categories={categories}
        />

        {/* נוטיפיקציה של ביטול מחיקה */}
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
            
            {/* פס התקדמות */}
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