import React, { useState, useEffect } from 'react';
import { X, Wallet, Plus, Tag } from 'lucide-react';
import { CreateFundRequest, UpdateFundRequest } from '../../services/fundsService';
import { GetCategoryRequest, CreateCategoryRequest } from '../../services/categoriesService';
import { categoriesService } from '../../services/categoriesService';
import ColorBadge from '../UI/ColorBadge';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFund?: (fund: CreateFundRequest) => void;
  onEditFund?: (id: string, fund: UpdateFundRequest) => void;
  editingFund?: UpdateFundRequest | null;
  fundId: string,
  categories: GetCategoryRequest[];
}

const FundModal: React.FC<FundModalProps> = ({
  isOpen,
  fundId,
  onClose,
  onAddFund,
  onEditFund,
  editingFund,
  categories: initialCategories
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'annual' | 'savings'>('monthly');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [includeInBudget, setIncludeInBudget] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<GetCategoryRequest[]>(initialCategories);
  
  // State for adding new category
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // עדכון הקטגוריות כשמתעדכנות מהרכיב האב
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

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
    
    // איפוס טופס הוספת קטגוריה
    setShowAddCategory(false);
    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
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
      onEditFund(fundId, fundData);
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

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('שם הקטגוריה הוא שדה חובה');
      return;
    }

    if (!fundId) {
      alert('יש לשמור את הקופה תחילה לפני הוספת קטגוריות');
      return;
    }

    setIsCreatingCategory(true);

    try {
      const categoryData: CreateCategoryRequest = {
        name: newCategoryName.trim(),
        fund_id: fundId,
        color_class: newCategoryColor
      };

      const newCategory = await categoriesService.createCategory(categoryData);
      
      // עדכון רשימת הקטגוריות המקומית
      setCategories(prev => [...prev, newCategory]);
      
      // הוספה אוטומטית לרשימת הקטגוריות הנבחרות
      setSelectedCategories(prev => [...prev, newCategory.id]);
      
      // איפוס הטופס
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
      setShowAddCategory(false);
      
      console.log('✅ קטגוריה חדשה נוצרה:', newCategory);
    } catch (error) {
      console.error('❌ Failed to create category:', error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCancelAddCategory = () => {
    setShowAddCategory(false);
    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showAddCategory) {
        handleCancelAddCategory();
      } else {
        onClose();
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // צבעים מוגדרים מראש לבחירה
  const predefinedColors = [
    '#3b82f6', // כחול
    '#10b981', // ירוק
    '#f59e0b', // כתום
    '#ef4444', // אדום
    '#8b5cf6', // סגול
    '#06b6d4', // ציאן
    '#84cc16', // ירוק בהיר
    '#f97316', // כתום כהה
    '#ec4899', // ורוד
    '#6b7280'  // אפור
  ];

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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">
                קטגוריות משויכות
              </label>
              
              {/* כפתור הוספת קטגוריה חדשה */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  קטגוריה חדשה
                </button>
              )}
            </div>

            {/* טופס הוספת קטגוריה חדשה */}
            {showAddCategory && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  הוספת קטגוריה חדשה
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      שם הקטגוריה *
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full p-2 border border-green-300 rounded-md text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200"
                      placeholder="לדוגמה: מזון, תחבורה, בילויים..."
                      disabled={isCreatingCategory}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      צבע הקטגוריה
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="grid grid-cols-5 gap-1">
                        {predefinedColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewCategoryColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              newCategoryColor === color 
                                ? 'border-gray-800 scale-110' 
                                : 'border-gray-300 hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color }}
                            disabled={isCreatingCategory}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300"
                        disabled={isCreatingCategory}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelAddCategory}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                      disabled={isCreatingCategory}
                    >
                      ביטול
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={!newCategoryName.trim() || isCreatingCategory}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition-colors flex items-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isCreatingCategory ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          יוצר...
                        </>
                      ) : (
                        <>
                          <Plus size={12} />
                          הוסף קטגוריה
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* תצוגה מקדימה */}
                {newCategoryName.trim() && (
                  <div className="mt-3 p-2 bg-white rounded-md border border-green-200">
                    <p className="text-xs text-green-700 mb-1">תצוגה מקדימה:</p>
                    <ColorBadge color={newCategoryColor} size="sm">
                      {newCategoryName.trim()}
                    </ColorBadge>
                  </div>
                )}
              </div>
            )}

            {/* רשימת קטגוריות קיימות */}
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
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">אין קטגוריות זמינות</p>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      צור קטגוריה ראשונה
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              בחר את הקטגוריות שישויכו לקופה זו
              {!isEditing && (
                <span className="text-orange-600 font-medium"> (ניתן להוסיף קטגוריות חדשות רק לאחר שמירת הקופה)</span>
              )}
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