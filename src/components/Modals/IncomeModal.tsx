import React, { useState } from 'react';
import { X, TrendingUp, Plus, DollarSign, FileText, Building } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (income: {
    name: string;
    amount: number;
    source?: string;
    note?: string;
  }) => void;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onAddIncome }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [note, setNote] = useState('');

  // רשימת מקורות הכנסה נפוצים
  const commonSources = [
    'משכורת ראשית',
    'משכורת שנייה', 
    'פרילנס',
    'בונוס',
    'החזר מס',
    'מתנה',
    'השקעות',
    'אחר'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount) {
      const finalSource = source === 'אחר' ? customSource : source;
      
      onAddIncome({
        name: name.trim(),
        amount: Number(amount),
        source: finalSource.trim() || undefined,
        note: note.trim() || undefined
      });
      
      // איפוס הטופס
      setName('');
      setAmount('');
      setSource('');
      setCustomSource('');
      setNote('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onKeyDown={handleKeyPress}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* כותרת */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">הוספת הכנסה חדשה</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* תוכן הטופס */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* שם ההכנסה */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <FileText size={16} className="inline ml-2" />
              שם ההכנסה *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              placeholder="לדוגמה: משכורת חודש מאי, בונוס שנתי..."
              required
              autoFocus
            />
          </div>

          {/* סכום ומקור */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <DollarSign size={16} className="inline ml-2" />
                סכום *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Building size={16} className="inline ml-2" />
                מקור ההכנסה
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">בחר מקור (אופציונלי)</option>
                {commonSources.map(sourceOption => (
                  <option key={sourceOption} value={sourceOption}>
                    {sourceOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* מקור מותאם אישית */}
          {source === 'אחר' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                מקור מותאם אישית
              </label>
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                placeholder="הקלד את שם המקור..."
              />
            </div>
          )}

          {/* הערות */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              הערות
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              rows={3}
              placeholder="הערות נוספות על ההכנסה..."
            />
          </div>

          {/* כפתורי פעולה */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              הוספת הכנסה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;