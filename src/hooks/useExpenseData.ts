import { useState, useEffect, useCallback, useRef } from 'react';
import { GetExpenseRequest, CreateExpenseRequest, UpdateExpenseRequest } from '../services/expensesService';
import { GetCategoryRequest } from '../services/categoriesService';
import { BudgetYear } from '../services/budgetYearsService';
import { FilterState, SortState, PaginationState, InlineEditState } from '../components/Expenses/types';
import { expensesService } from '../services/expensesService';
import { categoriesService } from '../services/categoriesService';
import { budgetYearsService } from '../services/budgetYearsService';
import { useBudgetYearStore } from '../store/budgetYearStore';
import { mapObject } from '../utils/mappers';

const ITEMS_PER_PAGE = 15;

export const useExpenseData = () => {
  // State
  const [expenses, setExpenses] = useState<GetExpenseRequest[]>([]);
  const [categories, setCategories] = useState<GetCategoryRequest[]>([]);
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

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

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    hasMore: true,
    loading: false,
    total: 0
  });

  const [inlineEdit, setInlineEdit] = useState<InlineEditState>({
    expenseId: null,
    field: null,
    value: '',
    originalValue: ''
  });

  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);
  const isLoadingMoreRef = useRef(false);

  // Helper function to find category ID by name
  const findCategoryIdByName = useCallback((categoryName: string): string => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.id || '';
  }, [categories]);

  // Helper function to find fund ID by name
  const findFundIdByName = useCallback((fundName: string): string => {
    const category = categories.find(cat => cat.funds?.name === fundName);
    return category?.fund_id || '';
  }, [categories]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesData, budgetYearsData] = await Promise.all([
        categoriesService.getAllCategories(),
        budgetYearsService.getAllBudgetYears()
      ]);

      setCategories(categoriesData);
      setBudgetYears(budgetYearsData);

      await loadExpensesPage(1, true);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('שגיאה בטעינת נתוני ההוצאות');
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load expenses page
  const loadExpensesPage = useCallback(async (page: number, reset: boolean = false) => {
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

      const response = await expensesService.getAllExpenses(expenseFilters);

      let expensesData: GetExpenseRequest[];
      let hasMoreData = false;
      let totalCount = 0;

      // if (response && typeof response === 'object' && 'data' in response) {
      //   expensesData = response.data || [];
      //   hasMoreData = response.hasMore || expensesData.length === ITEMS_PER_PAGE;
      //   totalCount = response.total || 0;
      // } else {
      expensesData = Array.isArray(response) ? response : [];
      hasMoreData = expensesData.length === ITEMS_PER_PAGE;
      totalCount = expensesData.length;
      // }


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
  }, [selectedBudgetYearId, filters, sort]);

  // Reset and reload data
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
  }, [loadExpensesPage]);

  // Load more data
  const loadMoreData = useCallback(() => {
    if (pagination.hasMore && !pagination.loading && !isLoadingMoreRef.current) {
      console.log(`🔄 Loading more data - page ${pagination.page + 1}`);
      loadExpensesPage(pagination.page + 1);
    }
  }, [pagination.hasMore, pagination.loading, pagination.page, loadExpensesPage]);

  // Filter handlers
  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      fund: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  }, []);

  // Sort handlers
  const handleSortChange = useCallback((field: SortState['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Inline edit handlers
  const startInlineEdit = useCallback((expenseId: string, field: 'name' | 'amount' | 'note', currentValue: string) => {
    setInlineEdit({
      expenseId,
      field,
      value: currentValue,
      originalValue: currentValue
    });
  }, []);

  const cancelInlineEdit = useCallback(() => {
    setInlineEdit({
      expenseId: null,
      field: null,
      value: '',
      originalValue: ''
    });
  }, []);

  const saveInlineEdit = useCallback(async () => {
    if (!inlineEdit.expenseId || !inlineEdit.field) return;

    const expense = expenses.find(exp => exp.id === inlineEdit.expenseId);
    if (!expense) return;

    try {
      let updatedValue: any = inlineEdit.value;

      if (inlineEdit.field === 'amount') {
        updatedValue = Number(inlineEdit.value);
        if (isNaN(updatedValue) || updatedValue <= 0) {
          return;
        }
      }

      // 🔧 תיקון: המרת שמות לIDים
      const categoryId = findCategoryIdByName(expense.categories?.name || '');
      const fundId = findFundIdByName(expense.funds?.name || '');

      const updateData: UpdateExpenseRequest = {
        name: inlineEdit.field === 'name' ? updatedValue : expense.name,
        amount: inlineEdit.field === 'amount' ? updatedValue : expense.amount,
        category_id: categoryId, // 🔧 שליחת ID במקום שם
        fund_id: fundId, // 🔧 שליחת ID במקום שם
        date: expense.date,
        note: inlineEdit.field === 'note' ? updatedValue : expense.note,
      };

      console.log('🔍 Update data being sent:', {
        expenseId: expense.id,
        categoryName: expense.categories?.name,
        categoryId,
        fundName: expense.funds?.name,
        fundId,
        updateData
      });

      const updated = await expensesService.updateExpense(expense.id, updateData);
      setExpenses(expenses.map(exp => exp.id === expense.id ? updated : exp));

      cancelInlineEdit();
      console.log('✅ הוצאה עודכנה:', updated);
    } catch (error) {
      console.error('❌ Failed to update expense:', error);
    }
  }, [inlineEdit, expenses, cancelInlineEdit, findCategoryIdByName, findFundIdByName]);

  // CRUD operations
  const createExpense = useCallback(async (newExpense: CreateExpenseRequest) => {
    try {
      const createdExpense = await expensesService.createExpense(newExpense);
      setExpenses(prev => [createdExpense, ...prev]);
      console.log('הוצאה חדשה נוספה:', createdExpense);
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updatedExpense: UpdateExpenseRequest) => {
    try {
      const updated = await expensesService.updateExpense(id, updatedExpense);
      setExpenses(expenses.map(expense => expense.id === id ? updated : expense));
      console.log('הוצאה עודכנה:', updated);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  }, [expenses]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await expensesService.deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  }, [expenses]);

  const getEditingExpense = useCallback((id: string): UpdateExpenseRequest | null => {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return null;

    // 🔧 תיקון: המרת שמות לIDים גם כאן
    const categoryId = findCategoryIdByName(expense.categories?.name || '');
    const fundId = findFundIdByName(expense.funds?.name || '');

    return {
      name: expense.name,
      amount: expense.amount,
      category_id: categoryId, // 🔧 ID במקום שם
      fund_id: fundId, // 🔧 ID במקום שם
      date: expense.date,
      note: expense.note,
    };
  }, [expenses, findCategoryIdByName, findFundIdByName]);

  // Effects
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (dataLoaded) {
      resetAndLoadData();
    }
  }, [filters, sort, selectedBudgetYearId, dataLoaded, resetAndLoadData]);

  return {
    // State
    expenses,
    categories,
    budgetYears,
    loading,
    error,
    dataLoaded,
    filters,
    sort,
    pagination,
    inlineEdit,

    // Computed
    uniqueFunds: Array.from(new Set(categories.map(cat => cat.fund))),

    // Actions
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

    // Handlers for inline edit
    handleInlineEditChange: (value: string) => setInlineEdit(prev => ({ ...prev, value })),
    handleInlineEditKeyPress: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveInlineEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelInlineEdit();
      }
    }
  };
};