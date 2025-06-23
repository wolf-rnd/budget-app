import { useState } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Charity from './pages/Charity';
import Funds from './pages/Funds';
import Settings from './pages/Settings';
import { NotificationProvider } from './components/Notifications/NotificationSystem';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses />;
      case 'income':
        return <Income />;
      case 'charity':
        return <Charity />;
      case 'funds':
        return <Funds />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NotificationProvider>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </NotificationProvider>
  );
}

export default App;