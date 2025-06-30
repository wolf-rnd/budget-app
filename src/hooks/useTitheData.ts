import { useState, useEffect, useCallback, useRef } from 'react';
import { TitheGiven, CreateTitheRequest, UpdateTitheRequest, TitheSummary } from '../services/titheService';
import { FilterState, SortState, PaginationState, InlineEditState } from '../components/Charity/types';
import { titheService } from '../services/titheService';

const ITEMS_PER_PAGE = 15;

export const useTitheData = () => {
  // State
  const [tithes, setTithes] = useState<TitheGiven[]>([]);
  const [summary, setSummary] = useState<TitheSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
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
    titheId: null,
    field: null,
    value: '',
    originalValue: ''
  });

  const isLoadingMoreRef = useRef(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData] = await Promise.all([
        titheService.getTitheSummary()
      ]);

      setSummary(summaryData);

      await loadTithesPage(1, true);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('שגיאה בטעינת נתוני המעשרות');
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tithes page
  const loadTithesPage = useCallback(async (page: number, reset: boolean = false) => {
    if (isLoadingMoreRef.current && !reset) {
      console.log('⚠️ Already loading, skipping request');
      return;
    }

    console.log(`📥 Loading tithes page ${page}, reset: ${reset}`);

    if (!reset) {
      isLoadingMoreRef.current = true;
    }

    setPagination(prev => ({ ...prev, loading: true }));

    try {
      const titheFilters = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search || undefined,
        page,
        limit: ITEMS_PER_PAGE
      };

      const response = await titheService.getAllTithes(titheFilters);

      let tithesData: TitheGiven[];
      let hasMoreData = false;
      let totalCount = 0;

      // if (response && typeof response === 'object' && 'data' in response) {
      //   tithesData = response.data || [];
      //   hasMoreData = response.hasMore || tithesData.length === ITEMS_PER_PAGE;
      //   totalCount = response.total || 0;
      // } else {
      tithesData = Array.isArray(response) ? response : [];
      hasMoreData = tithesData.length === ITEMS_PER_PAGE;
      totalCount = tithesData.length;
      // }

      console.log(`📊 Received ${tithesData.length} tithes, hasMore: ${hasMoreData}`);

      if (reset) {
        setTithes(tithesData);
      } else {
        setTithes(prev => [...prev, ...tithesData]);
      }

      setPagination(prev => ({
        ...prev,
        page,
        hasMore: hasMoreData,
        total: reset ? totalCount : prev.total + tithesData.length,
        loading: false
      }));

    } catch (error) {
      console.error('Failed to load tithes:', error);
      setError('שגיאה בטעינת מעשרות');
      setPagination(prev => ({ ...prev, loading: false }));
    } finally {
      if (!reset) {
        isLoadingMoreRef.current = false;
      }
    }
  }, [filters, sort]);

  // Reset and reload data
  const resetAndLoadData = useCallback(async () => {
    console.log('🔄 Resetting and loading data');
    setTithes([]);
    setPagination({
      page: 1,
      hasMore: true,
      loading: false,
      total: 0
    });
    isLoadingMoreRef.current = false;
    await loadTithesPage(1, true);
  }, [loadTithesPage]);

  // Load more data
  const loadMoreData = useCallback(() => {
    if (pagination.hasMore && !pagination.loading && !isLoadingMoreRef.current) {
      console.log(`🔄 Loading more data - page ${pagination.page + 1}`);
      loadTithesPage(pagination.page + 1);
    }
  }, [pagination.hasMore, pagination.loading, pagination.page, loadTithesPage]);

  // Filter handlers
  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
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
  const startInlineEdit = useCallback((titheId: string, field: 'description' | 'amount' | 'note', currentValue: string) => {
    setInlineEdit({
      titheId,
      field,
      value: currentValue,
      originalValue: currentValue
    });
  }, []);

  const cancelInlineEdit = useCallback(() => {
    setInlineEdit({
      titheId: null,
      field: null,
      value: '',
      originalValue: ''
    });
  }, []);

  const saveInlineEdit = useCallback(async () => {
    if (!inlineEdit.titheId || !inlineEdit.field) return;

    const tithe = tithes.find(t => t.id === inlineEdit.titheId);
    if (!tithe) return;

    try {
      let updatedValue: any = inlineEdit.value;

      if (inlineEdit.field === 'amount') {
        updatedValue = Number(inlineEdit.value);
        if (isNaN(updatedValue) || updatedValue <= 0) {
          return;
        }
      }

      const updateData: UpdateTitheRequest = {
        description: inlineEdit.field === 'description' ? updatedValue : tithe.description,
        amount: inlineEdit.field === 'amount' ? updatedValue : tithe.amount,
        note: inlineEdit.field === 'note' ? updatedValue : tithe.note,
        date: tithe.date
      };

      const updated = await titheService.updateTithe(tithe.id, updateData);
      setTithes(tithes.map(t => t.id === tithe.id ? updated : t));

      cancelInlineEdit();
      console.log('✅ מעשר עודכן:', updated);
    } catch (error) {
      console.error('❌ Failed to update tithe:', error);
    }
  }, [inlineEdit, tithes, cancelInlineEdit]);

  // CRUD operations
  const createTithe = useCallback(async (newTithe: CreateTitheRequest) => {
    try {
      const createdTithe = await titheService.createTithe(newTithe);
      setTithes(prev => [createdTithe, ...prev]);
      console.log('מעשר חדש נוסף:', createdTithe);
    } catch (error) {
      console.error('Failed to create tithe:', error);
    }
  }, []);

  const updateTithe = useCallback(async (id: string, updatedTithe: UpdateTitheRequest) => {
    try {
      const updated = await titheService.updateTithe(id, updatedTithe);
      setTithes(tithes.map(tithe => tithe.id === id ? updated : tithe));
      console.log('מעשר עודכן:', updated);
    } catch (error) {
      console.error('Failed to update tithe:', error);
    }
  }, [tithes]);

  const deleteTithe = useCallback(async (id: string) => {
    try {
      await titheService.deleteTithe(id);
      setTithes(tithes.filter(tithe => tithe.id !== id));
    } catch (error) {
      console.error('Failed to delete tithe:', error);
    }
  }, [tithes]);

  const getEditingTithe = useCallback((id: string): UpdateTitheRequest | null => {
    const tithe = tithes.find(t => t.id === id);
    if (!tithe) return null;

    return {
      id: tithe.id,
      description: tithe.description,
      amount: tithe.amount,
      note: tithe.note,
      date: tithe.date
    };
  }, [tithes]);

  // Effects
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (dataLoaded) {
      resetAndLoadData();
    }
  }, [filters, sort, dataLoaded, resetAndLoadData]);

  return {
    // State
    tithes,
    summary,
    loading,
    error,
    dataLoaded,
    filters,
    sort,
    pagination,
    inlineEdit,

    // Actions
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