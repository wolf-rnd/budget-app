import React, { useState } from 'react';
import { Plus, AlertTriangle, CreditCard, TrendingDown, X, Trash2 } from 'lucide-react';
import { Debt } from '../../types';

interface DebtsSectionProps {
  debts: Debt[];
  onAddDebt: (amount: number, description: string, note: string) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtsSection: React.FC<DebtsSectionProps> = ({ debts, onAddDebt, onDeleteDebt }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);

  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddDebt = () => {
    if (amount && description.trim()) {
      onAddDebt(Number(amount), description.trim(), note.trim());
      setAmount('');
      setDescription('');
      setNote('');
    }
  };

  const handleDeleteDebt = (debtId: string) => {
    setDeletingDebtId(debtId);
  };

  const confirmDeleteDebt = () => {
    if (deletingDebtId) {
      onDeleteDebt(deletingDebtId);
      setDeletingDebtId(null);
    }
  };

  const cancelDeleteDebt = () => {
    setDeletingDebtId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDebt();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-red-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* דגש עיצובי - פס אלכסוני עדין */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-100/60 to-transparent rounded-bl-full"></div>
      <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-red-200/40 to-transparent rounded-bl-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-red-600" />
          <h3 className="text-lg font-bold text-gray-800">חובות</h3>
        </div>
        
        {/* רכיב סיכום נפרד - סה"כ חובות ללא רקע */}
        <div className="mb-4 text-center p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard size={16} className="text-red-600" />
            <p className="text-xs font-bold text-red-700">סה״כ חובות</p>
          </div>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebts)}</p>
        </div>
        
        {/* רשימת החובות - עיצוב משופר וקומפקטי יותר */}
        <div className="mb-4">
          {debts.length > 0 ? (
            <div className="space-y-1">
              {debts.map(debt => (
                <div key={debt.id} className="p-2 bg-white rounded-lg shadow-sm border-r-2 border-red-500 hover:shadow-md hover:border-red-600 transition-all duration-200 group">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-gray-800 truncate">{debt.description}</p>
                      </div>
                      {debt.note && (
                        <p className="text-xs text-gray-600 opacity-75 truncate mr-3 mt-0.5">{debt.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <div className="text-left">
                        <span className="text-xs font-bold text-red-600 block">{formatCurrency(debt.amount)}</span>
                      </div>
                      
                      {/* כפתור מחיקה - מופיע בהובר */}
                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md"
                        title="מחיקת חוב"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
              <AlertTriangle size={16} className="mx-auto mb-2 opacity-50 text-green-500" />
              <p className="text-sm font-medium text-green-600">אין חובות רשומים</p>
              <p className="text-xs text-green-500">מצב כלכלי טוב! 👍</p>
            </div>
          )}
        </div>

        {/* שדות הוספה מהירים */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="סכום"
              className="w-full p-2 border-2 border-gray-200 rounded text-xs focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-all bg-white"
            />
            
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="תיאור"
              className="w-full p-2 border-2 border-gray-200 rounded text-xs focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-all bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="הערה (אופציונלי)"
              className="flex-1 p-2 border-2 border-gray-200 rounded text-xs focus:border-red-400 focus:ring-1 focus:ring-red-200 transition-all bg-white"
            />
            
            <button
              onClick={handleAddDebt}
              disabled={!amount || !description.trim()}
              className={`px-3 py-2 rounded text-xs font-medium transition-all flex items-center justify-center ${
                amount && description.trim()
                  ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* מודל אישור מחיקה */}
      {deletingDebtId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                מחיקת חוב
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                האם אתה בטוח שברצונך למחוק את החוב? פעולה זו לא ניתנת לביטול.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDeleteDebt}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDeleteDebt}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  מחיקה
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsSection;