import React, { useState } from 'react';
import { Plus, Heart, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface QuickAddButtonsProps {
  onAddTithe: (amount: number, description: string) => void;
  onAddDebt: (amount: number, description: string) => void;
  onAddTask: (description: string) => void;
}

const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({ onAddTithe, onAddDebt, onAddTask }) => {
  const [activeForm, setActiveForm] = useState<'tithe' | 'debt' | 'task' | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (type: 'tithe' | 'debt' | 'task') => {
    if (type === 'task' && description.trim()) {
      onAddTask(description.trim());
    } else if ((type === 'tithe' || type === 'debt') && amount && description.trim()) {
      if (type === 'tithe') {
        onAddTithe(Number(amount), description.trim());
      } else {
        onAddDebt(Number(amount), description.trim());
      }
    }
    
    // איפוס הטופס
    setAmount('');
    setDescription('');
    setActiveForm(null);
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setActiveForm(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'tithe' | 'debt' | 'task') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(type);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* כפתור ראשי מהיר */}
      {!activeForm && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-blue-600" />
            <span className="text-sm font-bold text-gray-800">הוספה מהירה</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveForm('tithe')}
              className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              title="הוספת מעשר מהירה"
            >
              <Heart size={18} />
            </button>
            
            <button
              onClick={() => setActiveForm('debt')}
              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              title="הוספת חוב מהירה"
            >
              <AlertTriangle size={18} />
            </button>
            
            <button
              onClick={() => setActiveForm('task')}
              className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              title="הוספת משימה מהירה"
            >
              <CheckCircle2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* טופס מעשר מהיר */}
      {activeForm === 'tithe' && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-pink-300 p-4 w-80">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={20} className="text-pink-600" />
            <span className="text-sm font-bold text-pink-800">מעשר מהיר</span>
          </div>
          
          <div className="space-y-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'tithe')}
              placeholder="סכום"
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
              autoFocus
            />
            
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'tithe')}
              placeholder="תיאור (לדוגמה: תרומה למוסד)"
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit('tithe')}
                className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                הוספה
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            Enter = הוספה | Esc = ביטול
          </div>
        </div>
      )}

      {/* טופס חוב מהיר */}
      {activeForm === 'debt' && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-300 p-4 w-80">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-600" />
            <span className="text-sm font-bold text-red-800">חוב מהיר</span>
          </div>
          
          <div className="space-y-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'debt')}
              placeholder="סכום"
              className="w-full p-3 border-2 border-red-200 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
              autoFocus
            />
            
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'debt')}
              placeholder="תיאור (לדוגמה: הלוואה מבנק)"
              className="w-full p-3 border-2 border-red-200 rounded-lg text-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit('debt')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                הוספה
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            Enter = הוספה | Esc = ביטול
          </div>
        </div>
      )}

      {/* טופס משימה מהיר */}
      {activeForm === 'task' && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-300 p-4 w-80">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-purple-600" />
            <span className="text-sm font-bold text-purple-800">משימה מהירה</span>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, 'task')}
              placeholder="תיאור המשימה"
              className="w-full p-3 border-2 border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
              autoFocus
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit('task')}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                הוספה
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            Enter = הוספה | Esc = ביטול
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAddButtons;