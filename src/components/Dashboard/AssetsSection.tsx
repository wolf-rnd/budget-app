// AssetsSection.tsx
import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

interface SnapshotValue {
  amount: number;
  invested: number;
}

interface AssetSnapshot {
  date: string;
  note: string;
  assets: Record<string, SnapshotValue>;
  liabilities: Record<string, SnapshotValue>;
}

interface AssetsSectionProps {
  snapshots: AssetSnapshot[];
  onAddSnapshot: (
    assets: Record<string, SnapshotValue>,
    liabilities: Record<string, SnapshotValue>,
    note: string
  ) => void;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ snapshots, onAddSnapshot }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');

  const assetTypes = [
    { id: 'compensation', name: 'פיצויים' },
    { id: 'pension_naomi', name: 'קה״ש נעמי שכירה' },
    { id: 'pension_yossi', name: 'קה״ש יוסי' },
    { id: 'savings_children', name: 'חסכון לכל ילד' },
  ];

  const liabilityTypes = [
    { id: 'anchor', name: 'עוגן' },
    { id: 'gmach_glik', name: 'גמ״ח גליק' },
    { id: 'mortgage', name: 'משכנתא' },
  ];

  const [assets, setAssets] = useState<Record<string, { amount: string; invested: string }>>(
    assetTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '', invested: '' } }), {})
  );

  const [liabilities, setLiabilities] = useState<Record<string, { amount: string; invested: string }>>(
    liabilityTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '', invested: '' } }), {})
  );

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const handleAddSnapshot = () => {
    const parsedAssets = Object.keys(assets).reduce((acc, key) => {
      acc[key] = {
        amount: Number(assets[key].amount || 0),
        invested: Number(assets[key].invested || 0),
      };
      return acc;
    }, {} as Record<string, SnapshotValue>);

    const parsedLiabilities = Object.keys(liabilities).reduce((acc, key) => {
      acc[key] = {
        amount: Number(liabilities[key].amount || 0),
        invested: Number(liabilities[key].invested || 0),
      };
      return acc;
    }, {} as Record<string, SnapshotValue>);

    onAddSnapshot(parsedAssets, parsedLiabilities, note);

    setAssets(assetTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '', invested: '' } }), {}));
    setLiabilities(liabilityTypes.reduce((acc, type) => ({ ...acc, [type.id]: { amount: '', invested: '' } }), {}));
    setNote('');
    setIsAdding(false);
  };

  const total = (records: Record<string, SnapshotValue>, field: 'amount' | 'invested') =>
    Object.values(records || {}).reduce((sum, val) => sum + val[field], 0);

  const totalAssets = total(latestSnapshot?.assets || {}, 'amount');
  const totalInvestedAssets = total(latestSnapshot?.assets || {}, 'invested');
  const totalLiabilities = total(latestSnapshot?.liabilities || {}, 'amount');
  const totalInvestedLiabilities = total(latestSnapshot?.liabilities || {}, 'invested');

  const netWorth = totalAssets - totalLiabilities;
  const investedNet = totalInvestedAssets - totalInvestedLiabilities;
  const netGain = netWorth - investedNet;

  const previousNetWorth = previousSnapshot
    ? total(previousSnapshot.assets, 'amount') - total(previousSnapshot.liabilities, 'amount')
    : 0;
  const netWorthChange = latestSnapshot && previousSnapshot ? netWorth - previousNetWorth : 0;

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <PieChart size={20} /> תמונת מצב נכסים
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1 text-sm rounded-md bg-slate-600 text-white flex items-center gap-1"
        >
          <Plus size={16} /> עדכון מצב
        </button>
      </div>

      {isAdding && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-emerald-700 font-bold mb-2">נכסים</h4>
            {assetTypes.map((type) => (
              <div key={type.id} className="mb-2">
                <label className="block text-sm font-semibold text-gray-600">{type.name}</label>
                <input
                  type="number"
                  placeholder="יתרה"
                  value={assets[type.id].amount}
                  onChange={(e) =>
                    setAssets((prev) => ({
                      ...prev,
                      [type.id]: {
                        ...prev[type.id],
                        amount: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-2 border border-emerald-300 rounded mb-1"
                />
                <input
                  type="number"
                  placeholder="השקעה בפועל"
                  value={assets[type.id].invested}
                  onChange={(e) =>
                    setAssets((prev) => ({
                      ...prev,
                      [type.id]: {
                        ...prev[type.id],
                        invested: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-2 border border-emerald-200 rounded"
                />
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-red-700 font-bold mb-2">התחייבויות</h4>
            {liabilityTypes.map((type) => (
              <div key={type.id} className="mb-2">
                <label className="block text-sm font-semibold text-gray-600">{type.name}</label>
                <input
                  type="number"
                  placeholder="יתרה"
                  value={liabilities[type.id].amount}
                  onChange={(e) =>
                    setLiabilities((prev) => ({
                      ...prev,
                      [type.id]: {
                        ...prev[type.id],
                        amount: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-2 border border-red-300 rounded mb-1"
                />
                <input
                  type="number"
                  placeholder="השקעה בפועל"
                  value={liabilities[type.id].invested}
                  onChange={(e) =>
                    setLiabilities((prev) => ({
                      ...prev,
                      [type.id]: {
                        ...prev[type.id],
                        invested: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-2 border border-red-200 rounded"
                />
              </div>
            ))}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">הערה</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="text-sm text-gray-600">ביטול</button>
            <button onClick={handleAddSnapshot} className="bg-slate-600 text-white px-4 py-1 rounded text-sm">
              שמירה
            </button>
          </div>
        </div>
      )}

      {latestSnapshot && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 text-center p-4 rounded">
              <p className="text-sm font-medium text-emerald-800">נכסים</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalAssets)}</p>
            </div>
            <div className="bg-red-50 text-center p-4 rounded">
              <p className="text-sm font-medium text-red-800">התחייבויות</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(totalLiabilities)}</p>
            </div>
          </div>
          <div className="bg-blue-50 text-center p-4 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-700">שווי נטו</p>
            <p className="text-xl font-bold text-blue-800">{formatCurrency(netWorth)}</p>
            {previousSnapshot && (
              <div className="flex justify-center items-center gap-2 mt-2">
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
            <div className="mt-2 text-sm text-gray-600">
              השקעה בפועל: <strong>{formatCurrency(investedNet)}</strong><br />
              תשואה מצטברת: <strong>{formatCurrency(netGain)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsSection;
