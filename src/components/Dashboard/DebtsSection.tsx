import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Debt } from '../../types';

interface DebtsSectionProps {
  debts: Debt[];
  onAddDebt: (amount: number, description: string, note: string, type: 'owed_to_me' | 'i_owe') => void;
  onDeleteDebt: (id: string) => void;
}

interface DebtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  onDeleteDebt: (id: string) => void;
}

const DebtsModal: React.FC<DebtsModalProps> = ({ isOpen, onClose, debts, onDeleteDebt }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const debtsOwedToMe = debts.filter(debt => debt.type === 'owed_to_me');
  const debtsIOwe = debts.filter(debt => debt.type === 'i_owe' || !debt.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">כל החובות</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* חייבים לי */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                חייבים לי ({debtsOwedToMe.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {debtsOwedToMe.length > 0 ? (
                  debtsOwedToMe.map(debt => (
                    <div key={debt.id} className="group p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-emerald-800 truncate">{debt.description}</p>
                          {debt.note && (
                            <p className="text-xs text-emerald-600 mt-1">{debt.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-emerald-700">
                            {formatCurrency(debt.amount)}
                          </span>
                          <button
                            onClick={() => onDeleteDebt(debt.id)}
                            className="opacity-0 group-hover:opacity-100 text-emerald-400 hover:text-red-500 p-1 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">אין חובות שחייבים לי</p>
                )}
              </div>
            </div>

            {/* אני חייבת */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                אני חייבת ({debtsIOwe.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {debtsIOwe.length > 0 ? (
                  debtsIOwe.map(debt => (
                    <div key={debt.id} className="group p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{debt.description}</p>
                          {debt.note && (
                            <p className="text-xs text-slate-600 mt-1">{debt.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatCurrency(debt.amount)}
                          </span>
                          <button
                            onClick={() => onDeleteDebt(debt.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">אין חובות שאני חייבת</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// הוצאת הקומפוננטות החוצה כדי למנוע re-creation
const DebtsList = ({ debts, type, emptyMessage, onDeleteDebt, maxItems = 3 }: { 
  debts: Debt[], 
  type: 'owed_to_me' | 'i_owe',
  emptyMessage: string,
  onDeleteDebt: (id: string) => void,
  maxItems?: number
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayDebts = debts.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {displayDebts.length > 0 ? (
        displayDebts.map(debt => (
          <div key={debt.id} className="group p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {type === 'owed_to_me' ? (
                    <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
                  ) : (
                    <div className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                  )}
                  <p className="text-sm font-medium text-gray-800 truncate">{debt.description}</p>
                </div>
                {debt.note && (
                  <p className="text-xs text-gray-500 truncate mr-4">{debt.note}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm font-semibold ${
                  type === 'owed_to_me' ? 'text-emerald-600' : 'text-slate-600'
                }`}>
                  {formatCurrency(debt.amount)}
                </span>
                
                <button
                  onClick={() => onDeleteDebt(debt.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all duration-200"
                  title="מחיקת חוב"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-gray-400">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            {type === 'owed_to_me' ? (
              <ArrowLeft size={14} className="text-gray-400" />
            ) : (
              <ArrowRight size={14} className="text-gray-400" />
            )}
          </div>
          <p className="text-xs font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

const AddDebtForm = ({ 
  type, 
  form, 
  onUpdateForm, 
  onAddDebt, 
  onKeyPress 
}: { 
  type: 'owed_to_me' | 'i_owe',
  form: { amount: string, description: string, note: string },
  onUpdateForm: (field: string, value: string) => void,
  onAddDebt: () => void,
  onKeyPress: (e: React.KeyboardEvent) => void
}) => {
  return (
    <div className="space-y-3 p-3 bg-white border border-gray-100 rounded-lg">
      <div className="space-y-2">
        <input
          type="number"
          value={form.amount}
          onChange={(e) => onUpdateForm('amount', e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="סכום"
          className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
        
        <input
          type="text"
          value={form.description}
          onChange={(e) => onUpdateForm('description', e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="תיאור"
          className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
        
        <input
          type="text"
          value={form.note}
          onChange={(e) => onUpdateForm('note', e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="הערה (אופציונלי)"
          className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
      </div>
      
      <button
        onClick={onAddDebt}
        disabled={!form.amount || !form.description.trim()}
        className={`w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
          form.amount && form.description.trim()
            ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Plus size={14} />
        הוספה
      </button>
    </div>
  );
};

const DebtsSection: React.FC<DebtsSectionProps> = ({ debts, onAddDebt, onDeleteDebt }) => {
  // State נפרד לכל סוג חוב
  const [owedToMeForm, setOwedToMeForm] = useState({
    amount: '',
    description: '',
    note: ''
  });

  const [iOweForm, setIOweForm] = useState({
    amount: '',
    description: '',
    note: ''
  });

  const [showAllModal, setShowAllModal] = useState(false);

  // הפרדת החובות לשני סוגים
  const debtsOwedToMe = debts.filter(debt => debt.type === 'owed_to_me');
  const debtsIOwe = debts.filter(debt => debt.type === 'i_owe' || !debt.type); // תאימות לאחור

  const handleAddDebt = (type: 'owed_to_me' | 'i_owe') => {
    const form = type === 'owed_to_me' ? owedToMeForm : iOweForm;
    
    if (form.amount && form.description.trim()) {
      onAddDebt(Number(form.amount), form.description.trim(), form.note.trim(), type);
      
      // איפוס הטופס הספציפי
      if (type === 'owed_to_me') {
        setOwedToMeForm({ amount: '', description: '', note: '' });
      } else {
        setIOweForm({ amount: '', description: '', note: '' });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'owed_to_me' | 'i_owe') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDebt(type);
    }
  };

  const updateOwedToMeForm = (field: string, value: string) => {
    setOwedToMeForm(prev => ({ ...prev, [field]: value }));
  };

  const updateIOweForm = (field: string, value: string) => {
    setIOweForm(prev => ({ ...prev, [field]: value }));
  };

  const totalDebts = debts.length;
  const showViewAllButton = totalDebts > 6; // 3 מכל סוג

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-5 border-r-4 border-orange-400 hover:shadow-md transition-all duration-300" style={{ maxHeight: '500px', overflow: 'hidden' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-700">חובות</h3>
          </div>
          
          {showViewAllButton && (
            <button
              onClick={() => setShowAllModal(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye size={14} />
              הצג הכל ({totalDebts})
            </button>
          )}
        </div>

        {/* שתי עמודות של חובות */}
        <div className="grid grid-cols-2 gap-4">
          {/* עמודה שמאלית - חייבים לי */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              <h4 className="text-sm font-medium text-gray-600">חייבים לי</h4>
            </div>
            <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <DebtsList 
                debts={debtsOwedToMe} 
                type="owed_to_me"
                emptyMessage="אין חובות שחייבים לי"
                onDeleteDebt={onDeleteDebt}
                maxItems={3}
              />
            </div>
            <AddDebtForm 
              type="owed_to_me" 
              form={owedToMeForm}
              onUpdateForm={updateOwedToMeForm}
              onAddDebt={() => handleAddDebt('owed_to_me')}
              onKeyPress={(e) => handleKeyPress(e, 'owed_to_me')}
            />
          </div>

          {/* עמודה ימנית - אני חייבת */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <h4 className="text-sm font-medium text-gray-600">אני חייבת</h4>
            </div>
            <div className="mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <DebtsList 
                debts={debtsIOwe} 
                type="i_owe"
                emptyMessage="אין חובות שאני חייבת"
                onDeleteDebt={onDeleteDebt}
                maxItems={3}
              />
            </div>
            <AddDebtForm 
              type="i_owe" 
              form={iOweForm}
              onUpdateForm={updateIOweForm}
              onAddDebt={() => handleAddDebt('i_owe')}
              onKeyPress={(e) => handleKeyPress(e, 'i_owe')}
            />
          </div>
        </div>
      </div>

      {/* Modal לכל החובות */}
      <DebtsModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        debts={debts}
        onDeleteDebt={onDeleteDebt}
      />
    </>
  );
};

export default DebtsSection;