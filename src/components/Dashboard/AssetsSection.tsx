import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { AssetSnapshot } from '../../types';

interface AssetsSectionProps {
  snapshots: AssetSnapshot[];
  onAddSnapshot: (savings: number, liabilities: number, note: string) => void;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ snapshots, onAddSnapshot }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [savings, setSavings] = useState('');
  const [liabilities, setLiabilities] = useState('');
  const [note, setNote] = useState('');

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];

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

  const handleAddSnapshot = () => {
    if (savings && liabilities) {
      onAddSnapshot(Number(savings), Number(liabilities), note);
      setSavings('');
      setLiabilities('');
      setNote('');
      setIsAdding(false);
    }
  };

  const netWorth = latestSnapshot ? latestSnapshot.totalSavings - latestSnapshot.totalLiabilities : 0;
  const previousNetWorth = previousSnapshot ? previousSnapshot.totalSavings - previousSnapshot.totalLiabilities : 0;
  const netWorthChange = latestSnapshot && previousSnapshot ? netWorth - previousNetWorth : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl shadow-xl p-8 border-2 border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <PieChart size={24} className="text-slate-600" />
          תמונת מצב נכסים
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus size={16} />
          עדכון מצב
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">חסכונות</label>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">התחייבויות</label>
              <input
                type="number"
                value={liabilities}
                onChange={(e) => setLiabilities(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="0"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">הערה</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              rows={2}
              placeholder="הערות..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              ביטול
            </button>
            <button
              onClick={handleAddSnapshot}
              className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 shadow-md"
            >
              שמירה
            </button>
          </div>
        </div>
      )}

      {latestSnapshot && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <p className="text-sm text-emerald-700 font-bold mb-1">חסכונות</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(latestSnapshot.totalSavings)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-sm text-red-700 font-bold mb-1">התחייבויות</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(latestSnapshot.totalLiabilities)}</p>
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-blue-700 font-bold mb-2">שווי נטו</p>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth)}
            </p>
            {previousSnapshot && (
              <div className="flex items-center justify-center gap-2 mt-2">
                {netWorthChange >= 0 ? (
                  <TrendingUp size={16} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-bold ${netWorthChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {netWorthChange >= 0 ? '+' : ''}{formatCurrency(netWorthChange)}
                </span>
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">עדכון אחרון: {formatDate(latestSnapshot.date)}</p>
            {latestSnapshot.note && (
              <p className="text-sm text-slate-700 mt-2 font-medium">{latestSnapshot.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsSection;