import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Charity from './pages/Charity';
import Funds from './pages/Funds';
// import Excel from './pages/Excel';
import Settings from './pages/Settings';
import { NotificationProvider } from './components/Notifications/NotificationSystem';
import './index.css';

import { useEffect } from 'react';
import { useBudgetYearStore } from './store/budgetYearStore';
import { budgetYearsService } from './services/budgetYearsService';

function App() {
  const setBudgetYears = useBudgetYearStore(state => state.setBudgetYears);
  const setSelectedBudgetYearId = useBudgetYearStore(state => state.setSelectedBudgetYearId);
  const selectedBudgetYearId = useBudgetYearStore(state => state.selectedBudgetYearId);

  useEffect(() => {
    const fetchBudgetYears = async () => {
      const years = await budgetYearsService.getAllBudgetYears();
      setBudgetYears(years);
      if (!selectedBudgetYearId) {
        const active = years.find(y => y.is_active) || years[0];
        if (active) setSelectedBudgetYearId(active.id);
      }
    };
    fetchBudgetYears();
    // eslint-disable-next-line
  }, []);

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/charity" element={<Charity />} />
            <Route path="/funds" element={<Funds />} />
            {/* <Route path="/excel" element={<Excel />} /> */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;