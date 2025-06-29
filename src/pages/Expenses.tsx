import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { TrendingDown, Plus, Edit, Trash2, Undo2, X, Search, Filter, SortAsc, SortDesc, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import ExpenseModal from '../components/Modals/ExpenseModal';

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

interface FilterState {
  category: string;
  fund: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  search: string;
}

interface SortState {
  field: 'date' | 'name' | 'amount' | 'category' | 'fund';
  direction: 'asc' | 'desc';
}

type GroupBy = 'none' | 'category' | 'fund';

interface PaginationState {
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

const ITEMS_PER_PAGE = 15;

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<GetExpenseRequest[]>([]);
  const [categories, setCategories] = useState<GetCategoryRequest[]>([]);
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<UpdateExpenseRequest | null>(null);
  const [undoNotification, setUndoNotification] = useState<UndoNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // מצבי פילטור, מיון וקיבוץ
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    fund: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [sort, setSort] = useState<SortState>({
    field: 'date',
    direction: 'desc'
  });

  const [groupBy, setGroupBy] = useState<GroupBy>('fund'); // ברירת מחדל: קיבוץ לפי קופה
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    hasMore: true,
    loading: false,
    total: 0
  });

  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);
  
  // Refs for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false); // מניעת קריאות כפולות

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reset pagination when filters/sort change
  useEffect(() => {
    resetAndLoadData();
  }, [filters, sort, selectedBudgetYearId]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (groupBy !== 'none') {
      // נקה observer כשיש קיבוץ
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // נקה observer קיים
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // צור observer חדש
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        console.log('🔍 Intersection Observer:', {
          isIntersecting: target.isIntersecting,
          hasMore: pagination.hasMore,
          loading: pagination.loading,
          isLoadingMore: isLoadingMoreRef.current
        });

        if (target.isIntersecting && pagination.hasMore && !pagination.loading && !isLoadingMoreRef.current) {
          console.log('🚀 Triggering loadMoreData');
          loadMoreData();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    // התחבר לאלמנט
    if (loadingRef.current && observerRef.current) {
      console.log('📌 Observing loading element');
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination.hasMore, pagination.loading, groupBy]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesData, budgetYearsData] = await Promise.all([
        categoriesService.getAllCategories(),
        budgetYearsService.getAllBudgetYears()
      ]);

      setCategories(categoriesData);
      setBudgetYears(budgetYearsData);
      
      // Load first page of expenses
      await loadExpensesPage(1, true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('שגיאה בטעינת נתוני ההוצאות');
    } finally {
      setLoading(false);
    }
  };

  const resetAndLoadData = useCallback(async () => {
    console.log('🔄 Resetting and loading data');
    setExpenses([]);
    setPagination({
      page: 1,
      hasMore: true,
      loading: false,
      total: 0
    });
    isLoadingMoreRef.current = false;
    await loadExpensesPage(1, true);
  }, []);

  const loadExpensesPage = async (page: number, reset: boolean = false) => {
    if (isLoadingMoreRef.current && !reset) {
      console.log('⚠️ Already loading, skipping request');
      return;
    }

    console.log(`📥 Loading expenses page ${page}, reset: ${reset}`);
    
    if (!reset) {
      isLoadingMoreRef.current = true;
    }

    setPagination(prev => ({ ...prev, loading: true }));

    try {
      const expenseFilters = {
        budget_year_id: selectedBudgetYearId || undefined,
        category: filters.category || undefined,
        fund: filters.fund || undefined,
        min_amount: filters.minAmount ? Number(filters.minAmount) : undefined,
        max_amount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        search: filters.search || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sort_field: sort.field,
        sort_direction: sort.direction
      };

      console.log('📤 Sending request with filters:', expenseFilters);

      const response = await expensesService.getAllExpenses(expenseFilters);
      
      // טיפול בתגובה - בדוק אם זה ExpenseResponse או רשימה רגילה
      let expensesData: GetExpenseRequest[];
      let hasMoreData = false;
      let totalCount = 0;

      if (response && typeof response === 'object' && 'data' in response) {
        // תגובה מובנית עם pagination
        expensesData = response.data || [];
        hasMoreData = response.hasMore || expensesData.length === ITEMS_PER_PAGE;
        totalCount = response.total || 0;
      } else {
        // תגובה פשוטה - רשימה
        expensesData = Array.isArray(response) ? response : [];
        hasMoreData = expensesData.length === ITEMS_PER_PAGE;
        totalCount = expensesData.length;
      }

      console.log(`📊 Received ${expensesData.length} expenses, hasMore: ${hasMoreData}`);
      
      if (reset) {
        setExpenses(expensesData);
      } else {
        setExpenses(prev => [...prev, ...expensesData]);
      }

      setPagination(prev => ({
        ...prev,
        page,
        hasMore: hasMoreData,
        total: reset ? totalCount : prev.total + expensesData.length,
        loading: false
      }));

    } catch (error) {
      console.error('Failed to load expenses:', error);
      setError('שגיאה בטעינת הוצאות');
      setPagination(prev => ({ ...prev, loading: false }));
    } finally {
      if (!reset) {
        isLoadingMoreRef.current = false;
      }
    }
  };

  const loadMoreData = useCallback(() => {
    if (pagination.hasMore && !pagination.loading && !isLoadingMoreRef.current) {
      console.log(`🔄 Loading more data - page ${pagination.page + 1}`);
      loadExpensesPage(pagination.page + 1);
    } else {
      console.log('❌ Cannot load more:', {
        hasMore: pagination.hasMore,
        loading: pagination.loading,
        isLoadingMore: isLoadingMoreRef.current
      });
    }
  }, [pagination.hasMore, pagination.loading, pagination.page]);

  const uniqueFunds = Array.from(new Set(categories.map(cat => cat.fund)));

  // קיבוץ הוצאות - רק לנתונים שכבר נטענו
  const groupedExpenses = useMemo(() => {
    if (groupBy === 'none') return {};
    
    const key = groupBy === 'category' ? 'categories' : 'funds';
    return expenses.reduce((groups, expense) => {
      const groupName = expense[key]?.name || 'לא ידוע';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(expense);
      return groups;
    }, {} as Record<string, GetExpenseRequest[]>);
  }, [expenses, groupBy]);

  // חישוב סכומים לקבוצות
  const groupSums = useMemo(() => {
    const sums: Record<string, number> = {};
    Object.entries(groupedExpenses).forEach(([groupName, groupExpenses]) => {
      sums[groupName] = groupExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    });
    return sums;
  }, [groupedExpenses]);

  // ברירת מחדל: כל הקבוצות פתוחות כשמשנים קיבוץ
  useEffect(() => {
    if (groupBy === 'none') return;
    const allGroups = Object.keys(groupedExpenses);
    setExpandedGroups(Object.fromEntries(allGroups.map(g => [g, true])));
  }, [groupBy, groupedExpenses]);

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

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (field: SortState['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      fund: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleExpenseModalSubmit = async (newExpense: CreateExpenseRequest) => {
    try {
      const createdExpense = await expensesService.createExpense(newExpense);
      setExpenses(prev => [createdExpense, ...prev]);
      console.log('הוצאה חדשה נוספה:', createdExpense);
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleEditExpense = (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
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

  const getSortIcon = (field: SortState['field']) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const renderExpenseRow = (expense: GetExpenseRequest) => (
    <tr key={expense.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(expense.date)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="font-medium">{expense.name}</div>
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
  );

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
            onClick={loadInitialData}
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 mx-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={28} className="text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הוצאות</h1>
              <p className="text-gray-600">
                ניהול וצפייה בהוצאות - {budgetYears.find(year => year.is_active)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* רכיב חיפוש ופילטרים - STICKY */}
        <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200 mx-4 rounded-lg mb-6">
          <div className="p-6">
            {/* כלי בקרה עליונים */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {/* חיפוש */}
                <div className="relative">
                  <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="חיפוש..."
                    className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 w-64"
                  />
                </div>

                {/* כפתור פילטרים */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters 
                      ? 'bg-amber-100 border-amber-300 text-amber-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={16} />
                  פילטרים
                </button>

                {/* קיבוץ */}
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                >
                  <option value="none">ללא קיבוץ</option>
                  <option value="category">קיבוץ לפי קטגוריה</option>
                  <option value="fund">קיבוץ לפי קופה</option>
                </select>
              </div>

              <button
                onClick={handleAddExpense}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus size={16} />
                הוספת הוצאה
              </button>
            </div>

            {/* פילטרים מתקדמים */}
            {showFilters && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
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
                      value={filters.fund}
                      onChange={(e) => handleFilterChange('fund', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    >
                      <option value="">כל הקופות</option>
                      {uniqueFunds.map(fund => (
                        <option key={fund} value={fund}>
                          {fund}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">סכום מינימלי</label>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">סכום מקסימלי</label>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      placeholder="∞"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">מתאריך</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">עד תאריך</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end gap-2">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      נקה פילטרים
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* סיכום פילטרים פעילים */}
            {Object.values(filters).some(value => value) && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <span>פילטרים פעילים:</span>
                  {filters.category && (
                    <span className="px-2 py-1 rounded-full text-xs border bg-gray-100 text-gray-800 border-gray-300">
                      קטגוריה: {filters.category}
                    </span>
                  )}
                  {filters.fund && (
                    <span className="px-2 py-1 rounded-full text-xs border bg-gray-100 text-gray-800 border-gray-300">
                      קופה: {filters.fund}
                    </span>
                  )}
                  {filters.search && (
                    <span className="px-2 py-1 rounded-full text-xs border bg-gray-100 text-gray-800 border-gray-300">
                      חיפוש: {filters.search}
                    </span>
                  )}
                  <span className="text-amber-600">
                    ({expenses.length} תוצאות נטענו{pagination.hasMore ? ', עוד נתונים זמינים' : ''})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* תוכן הטבלה */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mx-4">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                רשימת הוצאות ({expenses.length} הוצאות נטענו)
                {groupBy !== 'none' && ` - מקובצות לפי ${groupBy === 'category' ? 'קטגוריה' : 'קופה'}`}
              </h2>
              <div className="text-sm text-gray-500">
                {groupBy === 'none' ? (
                  <div className="text-center">
                    <div>📊 Pagination: צד שרת</div>
                    <div>🔄 Infinite Scroll: {pagination.hasMore ? 'זמין' : 'הסתיים'}</div>
                    <div>📄 עמוד: {pagination.page}</div>
                  </div>
                ) : (
                  `${Object.keys(groupedExpenses).length} קבוצות`
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-30">
                <tr>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('date')}
                  >
                    <div className="flex items-center gap-1">
                      תאריך
                      {getSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center gap-1">
                      שם
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('category')}
                  >
                    <div className="flex items-center gap-1">
                      קטגוריה
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('fund')}
                  >
                    <div className="flex items-center gap-1">
                      קופה
                      {getSortIcon('fund')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('amount')}
                  >
                    <div className="flex items-center gap-1">
                      סכום
                      {getSortIcon('amount')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הערה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupBy === 'none' ? (
                  // תצוגה רגילה ללא קיבוץ - עם infinite scroll
                  expenses.length > 0 ? (
                    expenses.map(renderExpenseRow)
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <TrendingDown size={48} className="text-gray-300" />
                          <p className="text-lg font-medium">אין הוצאות להצגה</p>
                          <p className="text-sm">נסה לשנות את הפילטרים או להוסיף הוצאה חדשה</p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  // תצוגה מקובצת
                  Object.keys(groupedExpenses).length > 0 ? (
                    Object.entries(groupedExpenses).map(([groupName, groupExpenses]) => (
                      <React.Fragment key={groupName}>
                        {/* כותרת הקבוצה */}
                        <tr className="bg-gray-100 hover:bg-gray-200 cursor-pointer" onClick={() => toggleGroup(groupName)}>
                          <td colSpan={7} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {expandedGroups[groupName] ? (
                                  <ChevronDown size={16} className="text-gray-600" />
                                ) : (
                                  <ChevronUp size={16} className="text-gray-600" />
                                )}
                                <span className="font-semibold text-gray-800">
                                  {groupName} ({groupExpenses.length} הוצאות)
                                </span>
                              </div>
                              <span className="font-bold text-amber-600">
                                {formatCurrency(groupSums[groupName])}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {/* שורות הקבוצה */}
                        {expandedGroups[groupName] && groupExpenses.map(renderExpenseRow)}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <TrendingDown size={48} className="text-gray-300" />
                          <p className="text-lg font-medium">אין הוצאות להצגה</p>
                          <p className="text-sm">נסה לשנות את הפילטרים או להוסיף הוצאה חדשה</p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Loading indicator for infinite scroll - רק במצב ללא קיבוץ */}
          {groupBy === 'none' && (
            <div 
              ref={loadingRef}
              className="px-6 py-4 border-t border-gray-200 bg-gray-50"
            >
              {pagination.loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin text-amber-600" />
                  <span className="text-sm text-gray-600">טוען עוד נתונים...</span>
                </div>
              ) : pagination.hasMore ? (
                <div className="text-center text-sm text-gray-500">
                  <div className="mb-2">🔄 גלול למטה לטעינת עוד נתונים</div>
                  <div className="text-xs text-gray-400">
                    נטענו {expenses.length} מתוך {pagination.total > 0 ? pagination.total : '?'} הוצאות
                  </div>
                </div>
              ) : expenses.length > 0 ? (
                <div className="text-center text-sm text-gray-500">
                  ✅ כל הנתונים נטענו ({expenses.length} הוצאות)
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* מודלים */}
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

        {/* נוטיפיקציית ביטול */}
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