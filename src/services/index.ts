// Export all services for easy importing
export { authService } from './authService';
export { budgetYearsService } from './budgetYearsService';
export { fundsService } from './fundsService';
export { categoriesService } from './categoriesService';
export { incomesService } from './incomesService';
export { expensesService } from './expensesService';
export { titheService } from './titheService';
export { debtsService } from './debtsService';
export { tasksService } from './tasksService';
export { assetsService } from './assetsService';
export { dashboardService } from './dashboardService';
export { systemSettingsService } from './systemSettingsService';

// Export types
export type { LoginRequest, RegisterRequest, AuthResponse } from './authService';
export type { BudgetYear, CreateBudgetYearRequest, UpdateBudgetYearRequest } from './budgetYearsService';
export type { CreateFundRequest, UpdateFundRequest, UpdateFundBudgetRequest } from './fundsService';
export type { GetCategoryRequest as Category, CreateCategoryRequest, UpdateCategoryRequest } from './categoriesService';
export type { CreateIncomeRequest, UpdateIncomeRequest, IncomeFilters, IncomeSummary } from './incomesService';
export type { CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters, ExpenseSummary } from './expensesService';
export type { CreateTitheRequest, UpdateTitheRequest, TitheFilters, TitheSummary } from './titheService';
export type { CreateDebtRequest, UpdateDebtRequest, DebtFilters, DebtSummary } from './debtsService';
export type { CreateTaskRequest, UpdateTaskRequest, TaskFilters, TaskSummary } from './tasksService';
export type { CreateAssetSnapshotRequest, UpdateAssetSnapshotRequest, AssetFilters, AssetTrends } from './assetsService';
export type { DashboardSummary } from './dashboardService';
export type { SystemSetting, CreateSystemSettingRequest, UpdateSystemSettingRequest } from './systemSettingsService';

// Note: apiClient is deprecated - all services now use direct fetch calls
export { apiClient } from './api';