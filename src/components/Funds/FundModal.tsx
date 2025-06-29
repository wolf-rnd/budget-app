import React, { useState, useEffect } from 'react';
import { X, Wallet, Plus } from 'lucide-react';
import { CreateFundRequest, UpdateFundRequest } from '../../services/fundsService';
import { GetCategoryRequest } from '../../services/categoriesService';
import ColorBadge from '../UI/ColorBadge';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFund?: (fund: CreateFundRequest) => void;
  onEditFund?: (id: string, fund: UpdateFundRequest) => void;
  editingFund?: UpdateFundRequest | null;
  categories: GetCategoryRequest[];
}

const FundModal: React.FC<FundModalProps> = ({
  isOpen,
  onClose,
  onAddFund,
  onEditFund,
  editingFund,
  categories
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'annual' | 'savings'>('monthly');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [includeInBudget, setIncludeInBudget] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // עדכון הטופס כשנפתח במצב עריכה
  useEffect(() => {
    if (editingFund) {
      setName(editingFund.name || '');
      setType(editingFund.type || 'monthly');
      setLevel(editingFund.level || 1);
      setIncludeInBudget(editingFund.include_in_budget !== false);
      setSelectedCategories(editingFund.categories || []);
    } else {
      setName('');
      setType('monthly');
      setLevel(1);
      setIncludeInBudget(true);
      setSelectedCategories([]);
    }
  }, [editingFund, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('שם הקופה הוא שדה חובה');
      return;
    }

    const fundData = {
      name: name.trim(),
      type,
      level,
      include_in_budget: includeInBudget,
      categories: selectedCategories
    };

    if (editingFund && onEditFund) {
      onEditFund(editingFund.id!, fundData);
    } else if (onAddFund) {
      onAddFund(fundData);
    }

    onClose();
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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

  const isEditing = !!editingFund;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyPress}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* כותרת */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Wallet size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'עריכת קופה' : 'הוספת קופה חדשה'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* תוכן הטופס */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* שם הקופה */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              שם הקופה *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              placeholder="לדוגמה: קופת שוטף, תקציב שנתי..."
              required
              autoFocus
            />
          </div>

          {/* סוג ורמה */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                סוג הקופה *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'monthly' | 'annual' | 'savings')}
                className="w-full p-3 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="monthly">חודשי</option>
                <option value="annual">שנתי</option>
                <option value="savings">חיסכון</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                רמת תצוגה *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full p-3 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value={1}>רמה 1 (שוטף)</option>
                <option value={2}>רמה 2 (שנתי)</option>
                <option value={3}>רמה 3 (עודפים)</option>
              </select>
            </div>
          </div>

          {/* הגדרות נוספות */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeInBudget}
                onChange={(e) => setIncludeInBudget(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">כלול בתקציב הכולל</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              קופות הכלולות בתקציב ישפיעו על חישובי התקציב הכולל
            </p>
          </div>

          {/* בחירת קטגוריות */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              קטגוריות משויכות
            </label>
            <div className="max-h-48 overflow-y-auto border-2 border-blue-200 rounded-lg p-3">
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <ColorBadge color={category.color_class} size="sm">
                        {category.name}
                      </ColorBadge>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  אין קטגוריות זמינות. צור קטגוריות תחילה.
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              בחר את הקטגוריות שישויכו לקופה זו
            </p>
          </div>

          {/* סיכום בחירות */}
          {selectedCategories.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-bold text-blue-800 mb-2">
                קטגוריות נבחרות ({selectedCategories.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(categoryId => {
                  const category = categories.find(cat => cat.id === categoryId);
                  return category ? (
                    <ColorBadge key={categoryId} color={category.color_class} size="sm">
                      {category.name}
                    </ColorBadge>
                  ) : null;
                })}
              </div>
            </div>
          )}

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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              {isEditing ? 'עדכון קופה' : 'הוספת קופה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundModal;