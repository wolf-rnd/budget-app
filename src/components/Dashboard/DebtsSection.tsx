import React, { useState } from 'react';
import { Plus, AlertTriangle, CreditCard, X, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Debt } from '../../types';

interface DebtsSectionProps {
  debts: Debt[];
  onAddDebt: (amount: number, description: string, note: string, type: 'owed_to_me' | 'i_owe') => void;
  onDeleteDebt: (id: string) => void;
}

const DebtsSection: React.FC<DebtsSectionProps> = ({ debts, onAddDebt, onDeleteDebt }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');

  // הפרדת החובות לשני סוגים
  const debtsOwedToMe = debts.filter(debt => debt.type === 'owed_to_me');
  const debtsIOwe = debts.filter(debt => debt.type === 'i_owe' || !debt.type); // תאימות לאחור

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddDebt = (type: 'owed_to_me' | 'i_owe') => {
    if (amount && description.trim()) {
      onAddDebt(Number(amount), description.trim(), note.trim(), type);
      setAmount('');
      setDescription('');
      setNote('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'owed_to_me' | 'i_owe') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDebt(type);
    }
  };

  const DebtsList = ({ debts, type, emptyMessage }: { 
    debts: Debt[], 
    type: 'owed_to_me' | 'i_owe',
    emptyMessage: string 
  }) => (
    <div className="space-y-1">
      {debts.length > 0 ? (
        debts.map(debt => (
          <div key={debt.id} className={`p-1.5 bg-white rounded-lg shadow-sm border-r-2 hover:shadow-md transition-all duration-200 ${
            type === 'owed_to_me' ? 'border-green-500 hover:border-green-600' : 'border-red-500 hover:border-red-600'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {type === 'owed_to_me' ? (
                    <ArrowLeft size={10} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <ArrowRight size={10} className="text-red-500 flex-shrink-0" />
                  )}
                  <p className="text-xs font-medium text-gray-800 truncate">{debt.description}</p>
                </div>
                {debt.note && (
                  <p className="text-xs text-gray-600 opacity-75 truncate mr-3 mt-0.5">{debt.note}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <div className="text-left">
                  <span className={`text-xs font-bold block ${
                    type === 'owed_to_me' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(debt.amount)}
                  </span>
                </div>
                
                <button
                  onClick={() => onDeleteDebt(debt.id)}
                  className={`transition-colors p-0.5 rounded-md ${
                    type === 'owed_to_me' 
                      ? 'text-green-500 hover:text-green-700 hover:bg-green-50' 
                      : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                  }`}
                  title="מחיקת חוב"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={`text-center py-3 rounded-lg border ${
          type === 'owed_to_me' 
            ? 'text-green-600 bg-green-50 border-green-200' 
            : 'text-gray-600 bg-gray-50 border-gray-200'
        }`}>
          {type === 'owed_to_me' ? (
            <ArrowLeft size={16} className="mx-auto mb-2 opacity-50 text-green-500" />
          ) : (
            <AlertTriangle size={16} className="mx-auto mb-2 opacity-50 text-gray-500" />
          )}
          <p className="text-xs font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  const AddDebtForm = ({ type }: { type: 'owed_to_me' | 'i_owe' }) => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, type)}
          placeholder="סכום"
          className={`w-full p-2 border-2 rounded text-xs transition-all bg-white ${
            type === 'owed_to_me'
              ? 'border-green-200 focus:border-green-400 focus:ring-1 focus:ring-green-200'
              : 'border-red-200 focus:border-red-400 focus:ring-1 focus:ring-red-200'
          }`}
        />
        
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, type)}
          placeholder="תיאור"
          className={`w-full p-2 border-2 rounded text-xs transition-all bg-white ${
            type === 'owed_to_me'
              ? 'border-green-200 focus:border-green-400 focus:ring-1 focus:ring-green-200'
              : 'border-red-200 focus:border-red-400 focus:ring-1 focus:ring-red-200'
          }`}
        />
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, type)}
          placeholder="הערה (אופציונלי)"
          className={`flex-1 p-2 border-2 rounded text-xs transition-all bg-white ${
            type === 'owed_to_me'
              ? 'border-green-200 focus:border-green-400 focus:ring-1 focus:ring-green-200'
              : 'border-red-200 focus:border-red-400 focus:ring-1 focus:ring-red-200'
          }`}
        />
        
        <button
          onClick={() => handleAddDebt(type)}
          disabled={!amount || !description.trim()}
          className={`px-3 py-2 rounded text-xs font-medium transition-all flex items-center justify-center ${
            amount && description.trim()
              ? type === 'owed_to_me'
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-orange-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* דגש עיצובי */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-100/60 to-transparent rounded-bl-full"></div>
      <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-orange-200/40 to-transparent rounded-bl-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CreditCard size={18} className="text-orange-600" />
          <h3 className="text-lg font-bold text-gray-800">חובות</h3>
        </div>

        {/* שתי עמודות של חובות */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* עמודה שמאלית - חייבים לי */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <ArrowLeft size={14} className="text-green-600" />
              <h4 className="text-sm font-bold text-green-700">חייבים לי</h4>
            </div>
            <div className="mb-3">
              <DebtsList 
                debts={debtsOwedToMe} 
                type="owed_to_me"
                emptyMessage="אין חובות שחייבים לי"
              />
            </div>
            <AddDebtForm type="owed_to_me" />
          </div>

          {/* עמודה ימנית - אני חייבת */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <ArrowRight size={14} className="text-red-600" />
              <h4 className="text-sm font-bold text-red-700">אני חייבת</h4>
            </div>
            <div className="mb-3">
              <DebtsList 
                debts={debtsIOwe} 
                type="i_owe"
                emptyMessage="אין חובות שאני חייבת"
              />
            </div>
            <AddDebtForm type="i_owe" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtsSection;