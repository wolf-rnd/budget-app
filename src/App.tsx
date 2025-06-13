import { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Charity from './pages/Charity';
import Funds from './pages/Funds';
import Settings from './pages/Settings';
import { BudgetYear } from './types';
import { getActiveBudgetYear, getLatestBudgetYear } from './utils/budgetUtils';
import budgetYearsData from './data/budgetYears.json';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [budgetYears] = useState<BudgetYear[]>(budgetYearsData.budgetYears);
  const [selectedBudgetYear, setSelectedBudgetYear] = useState<BudgetYear | null>(null);

  // Initialize selected budget year
  useEffect(() => {
    const savedBudgetYearId = localStorage.getItem('selectedBudgetYearId');
    let initialBudgetYear: BudgetYear | null = null;

    if (savedBudgetYearId) {
      initialBudgetYear = budgetYears.find(year => year.id === savedBudgetYearId) || null;
    }

    if (!initialBudgetYear) {
      initialBudgetYear = getActiveBudgetYear(budgetYears) || getLatestBudgetYear(budgetYears);
    }

    setSelectedBudgetYear(initialBudgetYear);
  }, [budgetYears]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses selectedBudgetYear={selectedBudgetYear} />;
      case 'income':
        return <Income selectedBudgetYear={selectedBudgetYear} />;
      case 'charity':
        return <Charity />;
      case 'funds':
        return <Funds selectedBudgetYear={selectedBudgetYear} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;