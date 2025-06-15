import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { AssetSnapshot } from '../../types';

interface AssetsSectionProps {
  snapshots: AssetSnapshot[];
  onAddSnapshot: (assets: Record<string, number>, liabilities: Record<string, number>, note: string) => void;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ snapshots, onAddSnapshot }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');

  // הגדרת רשימות קבועות
  const assetTypes = [
    { id: 'compensation', name: 'פיצויים' },
    { id: 'pension_naomi', name: 'קה״ש נעמי שכירה' },
    { id: 'pension_yossi', name: 'קה״ש יוסי' },
    { id: 'savings_children', name: 'חסכון לכל ילד' }
  ];

  const liabilityTypes = [
    { id: 'anchor', name: 'עוגן' },
    { id: 'gmach_glik', name: 'גמ״ח גליק' },
    { id: 'mortgage', name: 'משכנתא' }
  ];

  // State לכל סוג נכס והתחייבות
  const [assets, setAssets] = useState<Record<string, string>>(
    assetTypes.reduce((acc, type) => ({ ...acc, [type.id]: '' }), {})
  );
  
  const [liabilities, setLiabilities] = useState<Record<string, string>>(
    liabilityTypes.reduce((acc, type) => ({ ...acc, [type.id]: '' }), {})
  );

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
    // המרת הערכים למספרים
    const assetsNumbers = Object.keys(assets).reduce((acc, key) => {
      const value = assets[key];
      acc[key] = value ? Number(value) : 0;
      return acc;
    }, {} as Record<string, number>);

    const liabilitiesNumbers = Object.keys(liabilities).reduce((acc, key) => {
      const value = liabilities[key];
      acc[key] = value ? Number(value) : 0;
      return acc;
    }, {} as Record<string, number>);

    onAddSnapshot(assetsNumbers, liabilitiesNumbers, note);
    
    // איפוס הטופס
    setAssets(assetTypes.reduce((acc, type) => ({ ...acc, [type.id]: '' }), {}));
    setLiabilities(liabilityTypes.reduce((acc, type) => ({ ...acc, [type.id]: '' }), {}));
    setNote('');
    setIsAdding(false);
  };

  const handleAssetChange = (assetId: string, value: string) => {
    setAssets(prev => ({ ...prev, [assetId]: value }));
  };

  const handleLiabilityChange = (liabilityId: string, value: string) => {
    setLiabilities(prev => ({ ...prev, [liabilityId]: value }));
  };

  // חישוב סכומים מהנתונים האחרונים
  const totalAssets = latestSnapshot?.assets ? 
    Object.values(latestSnapshot.assets).reduce((sum, amount) => sum + amount, 0) : 
    latestSnapshot?.totalSavings || 0;

  const totalLiabilities = latestSnapshot?.liabilities ? 
    Object.values(latestSnapshot.liabilities).reduce((sum, amount) => sum + amount, 0) : 
    latestSnapshot?.totalLiabilities || 0;

  const netWorth = totalAssets - totalLiabilities;
  
  const previousTotalAssets = previousSnapshot?.assets ? 
    Object.values(previousSnapshot.assets).reduce((sum, amount) => sum + amount, 0) : 
    previousSnapshot?.totalSavings || 0;

  const previousTotalLiabilities = previousSnapshot?.liabilities ? 
    Object.values(previousSnapshot.liabilities).reduce((sum, amount) => sum + amount, 0) : 
    previousSnapshot?.totalLiabilities || 0;

  const previousNetWorth = previousTotalAssets - previousTotalLiabilities;
  const netWorthChange = latestSnapshot && previousSnapshot ? netWorth - previousNetWorth : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl shadow-xl p-8 border-2 border-slate-200 w-full max-w-4xl">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {/* עמודת נכסים */}
            <div>
              <h4 className="text-lg font-bold text-emerald-700 mb-4">נכסים</h4>
              <div className="space-y-3">
                {assetTypes.map(asset => (
                  <div key={asset.id}>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{asset.name}</label>
                    <input
                      type="number"
                      value={assets[asset.id]}
                      onChange={(e) => handleAssetChange(asset.id, e.target.value)}
                      className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* עמודת התחייבויות */}
            <div>
              <h4 className="text-lg font-bold text-red-700 mb-4">התחייבויות</h4>
              <div className="space-y-3">
                {liabilityTypes.map(liability => (
                  <div key={liability.id}>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{liability.name}</label>
                    <input
                      type="number"
                      value={liabilities[liability.id]}
                      onChange={(e) => handleLiabilityChange(liability.id, e.target.value)}
                      className="w-full p-3 border-2 border-red-200 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
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
          {/* סיכום כללי */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <p className="text-sm text-emerald-700 font-bold mb-1">נכסים</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalAssets)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-sm text-red-700 font-bold mb-1">התחייבויות</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p>
            </div>
          </div>

          {/* פירוט נכסים והתחייבויות */}
          {latestSnapshot.assets && latestSnapshot.liabilities && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* פירוט נכסים */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="text-sm font-bold text-emerald-800 mb-3">פירוט נכסים</h4>
                <div className="space-y-2">
                  {assetTypes.map(asset => {
                    const amount = latestSnapshot.assets?.[asset.id] || 0;
                    if (amount > 0) {
                      return (
                        <div key={asset.id} className="flex justify-between items-center">
                          <span className="text-xs text-emerald-700">{asset.name}</span>
                          <span className="text-xs font-bold text-emerald-600">{formatCurrency(amount)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* פירוט התחייבויות */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="text-sm font-bold text-red-800 mb-3">פירוט התחייבויות</h4>
                <div className="space-y-2">
                  {liabilityTypes.map(liability => {
                    const amount = latestSnapshot.liabilities?.[liability.id] || 0;
                    if (amount > 0) {
                      return (
                        <div key={liability.id} className="flex justify-between items-center">
                          <span className="text-xs text-red-700">{liability.name}</span>
                          <span className="text-xs font-bold text-red-600">{formatCurrency(amount)}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* שווי נטו */}
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