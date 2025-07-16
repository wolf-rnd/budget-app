import React, { useState, useRef, useEffect } from 'react';
import { X, TrendingUp, Plus, DollarSign, FileText, Building, ChevronDown, Calendar } from 'lucide-react';
import { CreateIncomeRequest, UpdateIncomeRequest } from '../../services/incomesService';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome?: (income: CreateIncomeRequest) => void;
  onEditIncome?: (id: string, income: UpdateIncomeRequest) => void;
  editingIncome?: UpdateIncomeRequest | null;
}

const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onAddIncome,
  onEditIncome,
  editingIncome,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSources, setFilteredSources] = useState<string[]>([]);
  const [savedSources, setSavedSources] = useState<string[]>([]);
  
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // רשימת מקורות הכנסה נפוצים
  const defaultSources = [
    'משכורת ראשית',
    'משכורת שנייה', 
    'פרילנס',
    'בונוס',
    'החזר מס',
    'מתנה',
    'השקעות',
    'שיעורים פרטיים',
    'וולף',
    'מלכי'
  ];

  // טעינת מקורות שמורים מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem('incomeSources');
    if (saved) {
      setSavedSources(JSON.parse(saved));
    }
  }, []);

  // עדכון הטופס כשנפתח במצב עריכה
  useEffect(() => {
    if (editingIncome) {
      setName(editingIncome.name || '');
      setAmount(formatNumber(editingIncome.amount?.toString() || ''));
      setDate(editingIncome.date || new Date().toISOString().split('T')[0]);
      setSource(editingIncome.source || '');
      setNote(editingIncome.note || '');
    } else {
      setName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setSource('');
      setNote('');
    }
  }, [editingIncome, isOpen]);

  // שמירת מקורות ב-localStorage
  const saveSource = (newSource: string) => {
    if (newSource.trim() && !savedSources.includes(newSource.trim())) {
      const updatedSources = [...savedSources, newSource.trim()];
      setSavedSources(updatedSources);
      localStorage.setItem('incomeSources', JSON.stringify(updatedSources));
    }
  };

  // כל המקורות הזמינים
  const allSources = [...defaultSources, ...savedSources];

  // סינון מקורות לפי הטקסט שהוקלד
  useEffect(() => {
    if (source.trim()) {
      const filtered = allSources.filter(s => 
        s.toLowerCase().includes(source.toLowerCase())
      );
      setFilteredSources(filtered);
    } else {
      setFilteredSources(allSources);
    }
  }, [source, savedSources]);

  // עיצוב מספרים עם פסיקים
  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  // הסרת פסיקים למספר נקי
  const cleanNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSource(e.target.value);
    setShowSuggestions(true);
  };

  const handleSourceSelect = (selectedSource: string) => {
    setSource(selectedSource);
    setShowSuggestions(false);
  };

  const handleSourceFocus = () => {
    setShowSuggestions(true);
  };

  const handleSourceBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount && date) {
      // שמירת מקור חדש אם הוקלד
      if (source.trim()) {
        saveSource(source.trim());
      }

      const incomeData: CreateIncomeRequest = {
        name: name.trim(),
        amount: Number(cleanNumber(amount)),
        date,
        source: source.trim() || undefined,
        note: note.trim() || undefined
      };

      if (editingIncome && onEditIncome) {
        onEditIncome(editingIncome.id!, incomeData);
      } else if (onAddIncome) {
        onAddIncome(incomeData);
      }
      
      // איפוס הטופס
      setName('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setSource('');
      setNote('');
      setShowSuggestions(false);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isEditing = !!editingIncome;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onKeyDown={handleKeyPress}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* כותרת */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'עריכת הכנסה' : 'הוספת הכנסה חדשה'}
              </h2>
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
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                placeholder="0"
                required
              />
              {amount && (
                <p className="text-xs text-gray-500 mt-1">
                  סכום: {amount} ש"ח
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Building size={16} className="inline ml-2" />
                מקור ההכנסה
              </label>
              <div className="relative">
                <input
                  ref={sourceInputRef}
                  type="text"
                  value={source}
                  onChange={handleSourceChange}
                  onFocus={handleSourceFocus}
                  onBlur={handleSourceBlur}
                  className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 pl-10"
                  placeholder="הקלד או בחר מקור..."
                />
                <ChevronDown 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
              </div>
              
              {/* רשימת הצעות */}
              {showSuggestions && filteredSources.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 bg-white border-2 border-emerald-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1"
                >
                  {filteredSources.map((sourceOption, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSourceSelect(sourceOption)}
                      className="w-full text-right px-3 py-2 hover:bg-emerald-50 text-sm border-b border-emerald-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{sourceOption}</span>
                        {savedSources.includes(sourceOption) && (
                          <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                            שמור
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* תאריך */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="inline ml-2" />
              תאריך קבלת ההכנסה *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              required
            />
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
              {isEditing ? 'עדכון הכנסה' : 'הוספת הכנסה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;