import React, { useState } from 'react';
import { X, TrendingDown, Plus, DollarSign, FileText, Tag, Calendar } from 'lucide-react';
import { BudgetYear, Category, Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense?: (expense: {
    name: string;
    amount: number;
    category: string;
    fund: string;
    date: string;
    note?: string;
  }) => void;
  onEditExpense?: (id: string, expense: {
    name: string;
    amount: number;
    category: string;
    fund: string;
    date: string;
    note?: string;
  }) => void;
  categories: Category[];
  editingExpense?: Expense | null;
  selectedBudgetYear: BudgetYear | null; // prop חדש
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onEditExpense,
  categories,
  editingExpense,
  selectedBudgetYear // prop חדש
}) => {
  const [name, setName] = useState(editingExpense?.name || '');
  const [amount, setAmount] = useState(editingExpense?.amount.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState(editingExpense?.category || '');
  const [selectedFund, setSelectedFund] = useState(editingExpense?.fund || '');
  const [takenFromMainFund, setTakenFromMainFund] = useState(false);
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(editingExpense?.note || '');

  React.useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(formatNumber(editingExpense.amount.toString()));
      setSelectedCategory(editingExpense.category);
      setSelectedFund(editingExpense.fund || '');
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
      setTakenFromMainFund(false);
    } else {
      setName('');
      setAmount('');
      setSelectedCategory('');
      setSelectedFund('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setTakenFromMainFund(false);
    }
  }, [editingExpense, isOpen]);

  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const cleanNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ודא ש-selectedBudgetYear קיים ב-props
    if (!selectedBudgetYear) {
      alert('יש לבחור שנת תקציב');
      return;
    }

    // הגנה נוספת: ודא של-selectedBudgetYear יש id
    if (!selectedBudgetYear.id) {
      alert('שנת התקציב שנבחרה אינה תקינה');
      return;
    }
    const selectedCategoryObj = categories.find(cat => cat.name === selectedCategory);
    const categoryId = selectedCategoryObj ? selectedCategoryObj.id : undefined;
    // אם יש לך מערך funds עם id ו-name, תוכל לעשות אותו דבר לפאנד
    // const selectedFundObj = funds?.find(fund => fund.name === selectedFund);
    // const fundId = selectedFundObj ? selectedFundObj.id : undefined;

    const expenseData: CreateExpenseRequest = {
      name: name.trim(),
      amount: Number(cleanNumber(amount)),
      budget_year_id: selectedBudgetYear.id,
      category_id: categoryId,
      fund_id: selectedCategoryObj?.fund_id || 0,
      date,
      note: note.trim() || undefined
      // ניתן להוסיף שדות נוספים במידת הצורך
    };

    if (editingExpense && onEditExpense) {
      onEditExpense(editingExpense.id, expenseData);
    } else if (onAddExpense) {
      onAddExpense(expenseData);
    }
    onClose();
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

   if (!isOpen) return null;

  const isEditing = !!editingExpense;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyPress}
      onClick={handleOverlayClick}
    >

      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingDown size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'עריכת הוצאה' : 'הוספת הוצאה חדשה'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <FileText size={16} className="inline ml-2" />
              שם ההוצאה *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-amber-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              placeholder="לדוגמה: קניות במכולת, דלק לרכב..."
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <DollarSign size={16} className="inline ml-2" />
                סכום *
              </label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full p-3 border-2 border-amber-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                placeholder="0"
                required
              />
              {amount && (
                <p className="text-xs text-gray-500 mt-1">
                  סכום: {amount} ש"ח
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Tag size={16} className="inline ml-2" />
                קטגוריה (אופציונלי)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value) {
                    // אם בוחרים קטגוריה, קופה תתמלא אוטומטית
                    const cat = categories.find(cat => cat.name === e.target.value);
                    if (cat) setSelectedFund(cat.funds?.name || cat.fund || '');
                  }
                }}
                className="w-full p-3 border-2 border-amber-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                required
              >
                <option value="">בחר קטגוריה (לא חובה)</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name} (מקופת: {category.funds?.name || category.fund})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                קופה
              </label>
              <select
                value={selectedFund ?? ''}
                onChange={(e) => setSelectedFund(e.target.value)}
                className="w-full p-3 border-2 border-amber-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                disabled={!!selectedCategory} // אם בחרו קטגוריה, הקופה נבחרת אוטומטית
              >
                <option value="">בחר קופה</option>
                {[...new Set(categories.map(cat => cat.funds?.name || cat.fund))].map(fundName => (
                  <option key={fundName} value={fundName}>{fundName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="inline ml-2" />
              תאריך ההוצאה *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border-2 border-amber-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              הערות
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border-2 border-amber-200 rounded-lg text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              rows={3}
              placeholder="הערות נוספות על ההוצאה..."
            />
          </div>

          {selectedCategory && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  הסכום יחוסר מקופת: {categories.find(cat => cat.name === selectedCategory)?.fund}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={takenFromMainFund}
                onChange={() => setTakenFromMainFund(!takenFromMainFund)}
                className="form-checkbox h-5 w-5 text-amber-600"
              />
              <span className="text-sm font-medium text-gray-700">נלקח מהשוטף</span>
            </label>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              {isEditing ? 'עדכון הוצאה' : 'הוספת הוצאה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default ExpenseModal;