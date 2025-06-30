import React, { useState } from 'react';
import { Plus, CreditCard, Trash2, ArrowLeft, ArrowRight, Eye, X } from 'lucide-react';
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debtsOwedToMe.length > 0 ? (
                  <ul className="space-y-2">
                    {debtsOwedToMe.map(debt => (
                      <li key={debt.id} className="group flex items-start gap-3 py-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{debt.description}</p>
                              {debt.note && (
                                <p className="text-xs text-gray-600 mt-1">{debt.note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                              <span className="text-sm font-semibold text-emerald-700">
                                {formatCurrency(debt.amount)}
                              </span>
                              <button
                                onClick={() => onDeleteDebt(debt.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-8">אין חובות שחייבים לי</p>
                )}
              </div>
            </div>

            {/* אני חייבת */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                אני חייבת ({debtsIOwe.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debtsIOwe.length > 0 ? (
                  <ul className="space-y-2">
                    {debtsIOwe.map(debt => (
                      <li key={debt.id} className="group flex items-start gap-3 py-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{debt.description}</p>
                              {debt.note && (
                                <p className="text-xs text-gray-600 mt-1">{debt.note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 mr-3">
                              <span className="text-sm font-semibold text-red-700">
                                {formatCurrency(debt.amount)}
                              </span>
                              <button
                                onClick={() => onDeleteDebt(debt.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
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

// רשימת חובות עם bullets
const DebtsList = ({ debts, type, emptyMessage, onDeleteDebt }: { 
  debts: Debt[], 
  type: 'owed_to_me' | 'i_owe',
  emptyMessage: string,
  onDeleteDebt: (id: string) => void,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  return (
    <div className="space-y-1">
      {debts.length > 0 ? (
        <ul className="space-y-1">
          {debts.map(debt => (
            <li key={debt.id} className="group flex items-start gap-2 py-1">
              {/* Bullet point - אדום לאני חייבת, ירוק לחייבים לי */}
              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                type === 'owed_to_me' ? 'bg-emerald-500' : 'bg-red-500'
              }`}></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-relaxed">{debt.description}</p>
                    {debt.note && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{debt.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 mr-2">
                    <span className={`text-xs font-semibold ${
                      type === 'owed_to_me' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(debt.amount)}
                    </span>
                    
                    <button
                      onClick={() => onDeleteDebt(debt.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-all duration-200"
                      title="מחיקת חוב"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-400">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            {type === 'owed_to_me' ? (
              <ArrowLeft size={12} className="text-gray-400" />
            ) : (
              <ArrowRight size={12} className="text-gray-400" />
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
    <div className="space-y-2 p-2 bg-white border border-gray-100 rounded-lg">
      <div className="space-y-2">
        <input
          type="number"
          value={form.amount}
          onChange={(e) => onUpdateForm('amount', e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="סכום"
          className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
        
        <input
          type="text"
          value={form.description}
          onChange={(e) => onUpdateForm('description', e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="תיאור"
          className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
        
        <input
          type="text"
          value={form.note}
          onChange={(e) => onUpdateForm('note', e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="הערה (אופציונלי)"
          className="w-full p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
      </div>
      
      <button
        onClick={onAddDebt}
        disabled={!form.amount || !form.description.trim()}
        className={`w-full py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${
          form.amount && form.description.trim()
            ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Plus size={12} />
        הוספה
      </button>
    </div>
  );
};

  /**
   * Renders a section that shows debts owed to and by the user.
   * 
   * The component renders two columns: one for debts owed to the user,
   * and one for debts owed by the user. Each column contains a list
   * of debts, and a form to add a new debt. The form includes fields
   * for the debt amount, description, and an optional note.
   * 
   * When the user submits the form, the `onAddDebt` callback is called
   * with the debt amount, description, note, and type (either
   * "owed_to_me" or "i_owe").
   * 
   * The component also renders a button to view all debts, which opens
   * a modal with a list of all debts. The user can delete debts from
   * this modal.
   * 
   * @param {DebtsSectionProps} props - The component props.
   * @param {Debt[]} props.debts - The list of debts to render.
   * @param {(amount: number, description: string, note: string, type: 'owed_to_me' | 'i_owe') => void} props.onAddDebt - The callback to call when the user submits the debt form.
   * @param {(debtId: string) => void} props.onDeleteDebt - The callback to call when the user deletes a debt.
   * @returns {React.ReactElement} The rendered component.
   */
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
      <div 
        className="bg-white rounded-xl shadow-sm p-4 border-r-4 border-orange-400 hover:shadow-md transition-all duration-300" 
        style={{ height: '700px', overflow: 'hidden' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-gray-500" />
            <h3 className="text-base font-semibold text-gray-700">חובות</h3>
          </div>
          
          {showViewAllButton && (
            <button
              onClick={() => setShowAllModal(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye size={12} />
              הצג הכל ({totalDebts})
            </button>
          )}
        </div>
  
        {/* שתי עמודות של חובות */}
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* עמודה שמאלית - חייבים לי */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <h4 className="text-xs font-medium text-gray-600">חייבים לי</h4>
            </div>
  
            <div className="flex-1 flex flex-col overflow-hidden">
              <div style={{ maxHeight: '430px', overflowY: 'auto' }}>
                <DebtsList 
                  debts={debtsOwedToMe} 
                  type="owed_to_me"
                  emptyMessage="אין חובות שחייבים לי"
                  onDeleteDebt={onDeleteDebt}
                />
              </div>
  
              <div className="mt-auto pt-2">
                <AddDebtForm 
                  type="owed_to_me" 
                  form={owedToMeForm}
                  onUpdateForm={updateOwedToMeForm}
                  onAddDebt={() => handleAddDebt('owed_to_me')}
                  onKeyPress={(e) => handleKeyPress(e, 'owed_to_me')}
                />
              </div>
            </div>
          </div>
  
          {/* עמודה ימנית - אני חייבת */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <h4 className="text-xs font-medium text-gray-600">אני חייבת</h4>
            </div>
  
            <div className="flex-1 flex flex-col overflow-hidden">
              <div style={{ maxHeight: '430px', overflowY: 'auto' }}>
                <DebtsList 
                  debts={debtsIOwe} 
                  type="i_owe"
                  emptyMessage="אין חובות שאני חייבת"
                  onDeleteDebt={onDeleteDebt}
                />
              </div>
  
              <div className="mt-auto pt-2">
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