import React, { useState } from 'react';
import { X, TrendingUp, Plus, Calendar, DollarSign, FileText, Hash } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (income: {
    name: string;
    amount: number;
    month: number;
    year: number;
    date: string;
    source: string;
    note?: string;
  }) => void;
}

const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, onAddIncome }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const months = [
    { value: 1, label: 'ינואר' },
    { value: 2, label: 'פברואר' },
    { value: 3, label: 'מרץ' },
    { value: 4, label: 'אפריל' },
    { value: 5, label: 'מאי' },
    { value: 6, label: 'יוני' },
    { value: 7, label: 'יולי' },
    { value: 8, label: 'אוגוסט' },
    { value: 9, label: 'ספטמבר' },
    { value: 10, label: 'אוקטובר' },
    { value: 11, label: 'נובמבר' },
    { value: 12, label: 'דצמבר' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount && source.trim()) {
      onAddIncome({
        name: name.trim(),
        amount: Number(amount),
        month,
        year,
        date,
        source: source.trim(),
        note: note.trim() || undefined
      });
      
      // איפוס הטופס
      setName('');
      setAmount('');
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
      setDate(new Date().toISOString().split('T')[0]);
      setSource('');
      setNote('');
      setIsRecurring(false);
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
          {/* שורה ראשונה - שם ההכנסה */}
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
              placeholder="לדוגמה: משכורת ראשית, פרילנס, בונוס..."
              required
              autoFocus
            />
          </div>

          {/* שורה שנייה - סכום ומקור */}
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
                <Hash size={16} className="inline ml-2" />
                מקור ההכנסה *
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                placeholder="לדוגמה: חברה, לקוח, פרויקט..."
                required
              />
            </div>
          </div>

          {/* שורה שלישית - תאריך */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="inline ml-2" />
              תאריך קבלת ההכנסה *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                const selectedDate = new Date(e.target.value);
                setMonth(selectedDate.getMonth() + 1);
                setYear(selectedDate.getFullYear());
              }}
              className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>

          {/* שורה רביעית - חודש ושנה */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                חודש
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                שנה
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                min="2020"
                max="2030"
              />
            </div>
          </div>

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

          {/* אפשרות הכנסה חוזרת */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-emerald-800">
              הכנסה חוזרת (תתווסף אוטומטית בחודש הבא)
            </label>
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