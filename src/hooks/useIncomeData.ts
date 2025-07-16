import { useState, useEffect, useCallback, useRef } from 'react';
import { Income, CreateIncomeRequest, UpdateIncomeRequest, IncomeSummary } from '../services/incomesService';
import { BudgetYear } from '../services/budgetYearsService';
import { FilterState, SortState, PaginationState, InlineEditState } from '../components/Income/types';
import { incomesService } from '../services/incomesService';
import { budgetYearsService } from '../services/budgetYearsService';
import { useBudgetYearStore } from '../store/budgetYearStore';

const ITEMS_PER_PAGE = 15;

export const useIncomeData = () => {
  // State
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    source: '',
    month: '',
    year: '',
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
    incomeId: null,
    field: null,
    value: '',
    originalValue: ''
  });

  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);
  const isLoadingMoreRef = useRef(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [budgetYearsData, summaryData] = await Promise.all([
        budgetYearsService.getAllBudgetYears(),
        incomesService.getIncomeSummary(selectedBudgetYearId || undefined)
      ]);

      setBudgetYears(budgetYearsData);
      setSummary(summaryData);

      await loadIncomesPage(1, true);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('שגיאה בטעינת נתוני ההכנסות');
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [selectedBudgetYearId]);

  // Load incomes page
  const loadIncomesPage = useCallback(async (page: number, reset: boolean = false) => {
    if (isLoadingMoreRef.current && !reset) {
      console.log('⚠️ Already loading, skipping request');
      return;
    }

    console.log(`📥 Loading incomes page ${page}, reset: ${reset}`);

    if (!reset) {
      isLoadingMoreRef.current = true;
    }

    setPagination(prev => ({ ...prev, loading: true }));

    try {
      const incomeFilters = {
        budget_year_id: selectedBudgetYearId || undefined,
        source: filters.source || undefined,
        month: filters.month ? Number(filters.month) : undefined,
        year: filters.year ? Number(filters.year) : undefined,
        search: filters.search || undefined,
        page,
        limit: ITEMS_PER_PAGE
      };

      const response = await incomesService.getAllIncomes(incomeFilters);

      let incomesData: Income[];
      let hasMoreData = false;
      let totalCount = 0;

      // if (response && typeof response === 'object' && 'data' in response) {
      //   incomesData = response.data || [];
      //   hasMoreData = response.hasMore || incomesData.length === ITEMS_PER_PAGE;
      //   totalCount = response.total || 0;
      // } else {
      incomesData = Array.isArray(response) ? response : [];
      hasMoreData = incomesData.length === ITEMS_PER_PAGE;
      totalCount = incomesData.length;
      // }

      console.log(`📊 Received ${incomesData.length} incomes, hasMore: ${hasMoreData}`);

      if (reset) {
        setIncomes(incomesData);
      } else {
        setIncomes(prev => [...prev, ...incomesData]);
      }

      setPagination(prev => ({
        ...prev,
        page,
        hasMore: hasMoreData,
        total: reset ? totalCount : prev.total + incomesData.length,
        loading: false
      }));

    } catch (error) {
      console.error('Failed to load incomes:', error);
      setError('שגיאה בטעינת הכנסות');
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
    setIncomes([]);
    setPagination({
      page: 1,
      hasMore: true,
      loading: false,
      total: 0
    });
    isLoadingMoreRef.current = false;
    await loadIncomesPage(1, true);
  }, [loadIncomesPage]);

  // Load more data
  const loadMoreData = useCallback(() => {
    if (pagination.hasMore && !pagination.loading && !isLoadingMoreRef.current) {
      console.log(`🔄 Loading more data - page ${pagination.page + 1}`);
      loadIncomesPage(pagination.page + 1);
    }
  }, [pagination.hasMore, pagination.loading, pagination.page, loadIncomesPage]);

  // Filter handlers
  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      source: '',
      month: '',
      year: '',
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
  const startInlineEdit = useCallback((incomeId: string, field: 'name' | 'amount' | 'source' | 'note', currentValue: string) => {
    setInlineEdit({
      incomeId,
      field,
      value: currentValue,
      originalValue: currentValue
    });
  }, []);

  const cancelInlineEdit = useCallback(() => {
    setInlineEdit({
      incomeId: null,
      field: null,
      value: '',
      originalValue: ''
    });
  }, []);

  const saveInlineEdit = useCallback(async () => {
    if (!inlineEdit.incomeId || !inlineEdit.field) return;

    const income = incomes.find(inc => inc.id === inlineEdit.incomeId);
    if (!income) return;

    try {
      let updatedValue: any = inlineEdit.value;

      if (inlineEdit.field === 'amount') {
        updatedValue = Number(inlineEdit.value);
        if (isNaN(updatedValue) || updatedValue <= 0) {
          return;
        }
      }

      const updateData: UpdateIncomeRequest = {
        name: inlineEdit.field === 'name' ? updatedValue : income.name,
        amount: inlineEdit.field === 'amount' ? updatedValue : income.amount,
        source: inlineEdit.field === 'source' ? updatedValue : income.source,
        note: inlineEdit.field === 'note' ? updatedValue : income.note,
        month: income.month,
        year: income.year,
        date: income.date
      };

      const updated = await incomesService.updateIncome(income.id, updateData);
      setIncomes(incomes.map(inc => inc.id === income.id ? updated : inc));

      cancelInlineEdit();
      console.log('✅ הכנסה עודכנה:', updated);
    } catch (error) {
      console.error('❌ Failed to update income:', error);
    }
  }, [inlineEdit, incomes, cancelInlineEdit]);

  // CRUD operations
  const createIncome = useCallback(async (newIncome: CreateIncomeRequest) => {
    try {
      const createdIncome = await incomesService.createIncome(newIncome);
      setIncomes(prev => [createdIncome, ...prev]);
      console.log('הכנסה חדשה נוספה:', createdIncome);
    } catch (error) {
      console.error('Failed to create income:', error);
    }
  }, []);

  const updateIncome = useCallback(async (id: string, updatedIncome: UpdateIncomeRequest) => {
    try {
      const updated = await incomesService.updateIncome(id, updatedIncome);
      setIncomes(incomes.map(income => income.id === id ? updated : income));
      console.log('הכנסה עודכנה:', updated);
    } catch (error) {
      console.error('Failed to update income:', error);
    }
  }, [incomes]);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      await incomesService.deleteIncome(id);
      setIncomes(incomes.filter(income => income.id !== id));
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  }, [incomes]);

  const getEditingIncome = useCallback((id: string): UpdateIncomeRequest | null => {
    const income = incomes.find(inc => inc.id === id);
    if (!income) return null;

    return {
      id: income.id,
      name: income.name,
      amount: income.amount,
      source: income.source,
      note: income.note,
      month: income.month,
      year: income.year,
      date: income.date
    };
  }, [incomes]);

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
    incomes,
    summary,
    budgetYears,
    loading,
    error,
    dataLoaded,
    filters,
    sort,
    pagination,
    inlineEdit,

    // Computed
    uniqueSources: Array.from(new Set(incomes.map(inc => inc.source).filter(Boolean))),

    // Actions
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