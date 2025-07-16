import { useState, useEffect, useCallback } from 'react';
import { GetFundRequest, CreateFundRequest, UpdateFundRequest, UpdateFundBudgetRequest } from '../services/fundsService';
import { GetCategoryRequest } from '../services/categoriesService';
import { BudgetYear } from '../services/budgetYearsService';
import { fundsService } from '../services/fundsService';
import { categoriesService } from '../services/categoriesService';
import { budgetYearsService } from '../services/budgetYearsService';
import { useBudgetYearStore } from '../store/budgetYearStore';

export const useFundsData = () => {
  // State
  const [funds, setFunds] = useState<GetFundRequest[]>([]);
  const [categories, setCategories] = useState<GetCategoryRequest[]>([]);
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [fundsData, categoriesData, budgetYearsData] = await Promise.all([
        fundsService.getAllFunds(selectedBudgetYearId || undefined),
        categoriesService.getAllCategories(),
        budgetYearsService.getAllBudgetYears()
      ]);

      setFunds(fundsData);
      setCategories(categoriesData);
      setBudgetYears(budgetYearsData);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load funds data:', err);
      setError('שגיאה בטעינת נתוני הקופות');
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [selectedBudgetYearId]);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      const fundsData = await fundsService.getAllFunds(selectedBudgetYearId || undefined);
      setFunds(fundsData);
    } catch (err) {
      console.error('Failed to refresh funds data:', err);
    }
  }, [selectedBudgetYearId]);

  // Refresh categories - פונקציה חדשה לרענון קטגוריות
  const refreshCategories = useCallback(async () => {
    try {
      const categoriesData = await categoriesService.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to refresh categories data:', err);
    }
  }, []);

  // CRUD operations
  const createFund = useCallback(async (newFund: CreateFundRequest) => {
    try {
      const createdFund = await fundsService.createFund(newFund);
      setFunds(prev => [...prev, createdFund]);
      console.log('קופה חדשה נוספה:', createdFund);
    } catch (error) {
      console.error('Failed to create fund:', error);
    }
  }, []);

  const updateFund = useCallback(async (id: string, updatedFund: UpdateFundRequest) => {
    try {
      const updated = await fundsService.updateFund(id, updatedFund);
      setFunds(prev => prev.map(fund => fund.id === id ? updated : fund));
      console.log('קופה עודכנה:', updated);
    } catch (error) {
      console.error('Failed to update fund:', error);
    }
  }, []);

  const deleteFund = useCallback(async (id: string) => {
    try {
      await fundsService.deleteFund(id);
      setFunds(prev => prev.filter(fund => fund.id !== id));
      console.log('קופה נמחקה:', id);
    } catch (error) {
      console.error('Failed to delete fund:', error);
    }
  }, []);

  const updateFundBudget = useCallback(async (fundId: string, budgetYearId: string, budgetData: UpdateFundBudgetRequest) => {
    try {
      const updated = await fundsService.updateFundBudget(fundId, budgetYearId, budgetData);
      setFunds(prev => prev.map(fund => fund.id === fundId ? updated : fund));
      console.log('תקציב קופה עודכן:', updated);
    } catch (error) {
      console.error('Failed to update fund budget:', error);
    }
  }, []);

  const activateFund = useCallback(async (id: string) => {
    try {
      const updated = await fundsService.activateFund(id);
      setFunds(prev => prev.map(fund => fund.id === id ? updated : fund));
      console.log('קופה הופעלה:', updated);
    } catch (error) {
      console.error('Failed to activate fund:', error);
    }
  }, []);

  const deactivateFund = useCallback(async (id: string) => {
    try {
      const updated = await fundsService.deactivateFund(id);
      setFunds(prev => prev.map(fund => fund.id === id ? updated : fund));
      console.log('קופה הושבתה:', updated);
    } catch (error) {
      console.error('Failed to deactivate fund:', error);
    }
  }, []);

  const getEditingFund = useCallback((id: string): UpdateFundRequest | null => {
    const fund = funds.find(f => f.id === id);
    if (!fund) return null;
    
    return {
      name: fund.name,
      type: fund.type,
      level: fund.level,
      include_in_budget: fund.include_in_budget,
      categories: fund.categories || []
    };
  }, [funds]);

  // Effects
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (dataLoaded) {
      refreshData();
    }
  }, [selectedBudgetYearId, dataLoaded, refreshData]);

  return {
    // State
    funds,
    categories,
    budgetYears,
    loading,
    error,
    dataLoaded,
    
    // Actions
    createFund,
    updateFund,
    deleteFund,
    updateFundBudget,
    activateFund,
    deactivateFund,
    getEditingFund,
    refreshData,
    refreshCategories // פונקציה חדשה לרענון קטגוריות
  };
};