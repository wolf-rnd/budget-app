import React, { useState } from 'react';
import { Plus, Heart, DollarSign, TrendingUp, Target, Eye, X } from 'lucide-react';
import { TitheGiven } from '../../types';

interface TitheSectionProps {
  totalIncome: number;
  tithePercentage: number;
  titheGiven: TitheGiven[];
  onAddTithe: (amount: number, description: string) => void;
}

interface TitheModalProps {
  isOpen: boolean;
  onClose: () => void;
  titheGiven: TitheGiven[];
}

const TitheModal: React.FC<TitheModalProps> = ({ isOpen, onClose, titheGiven }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">כל המעשרות</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {titheGiven.length > 0 ? (
              titheGiven.map(tithe => (
                <div key={tithe.id} className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-pink-800">{tithe.description}</p>
                      {tithe.note && (
                        <p className="text-xs text-pink-600 mt-1">{tithe.note}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{formatDate(tithe.date)}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm font-semibold text-pink-700">
                        {formatCurrency(tithe.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">אין מעשרות רשומים</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TitheSection: React.FC<TitheSectionProps> = ({ totalIncome, tithePercentage, titheGiven, onAddTithe }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);

  const requiredTithe = (totalIncome * tithePercentage) / 100;
  const givenTithe = titheGiven.reduce((sum, tithe) => sum + tithe.amount, 0);
  const remainingTithe = requiredTithe - givenTithe;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddTithe = () => {
    if (amount && description.trim()) {
      onAddTithe(Number(amount), description.trim());
      setAmount('');
      setDescription('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTithe();
    }
  };

  const showViewAllButton = titheGiven.length > 3;

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm p-4 border-r-4 border-pink-400 hover:shadow-md transition-all duration-300"
        style={{ overflow: 'hidden' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-400" />
            <h3 className="text-base font-semibold text-gray-700">מעשרות</h3>
          </div>

          {showViewAllButton && (
            <button
              onClick={() => setShowAllModal(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye size={12} />
              הצג הכל ({titheGiven.length})
            </button>
          )}
        </div>

        {/* כרטיסי סיכום */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign size={10} className="text-gray-500" />
              <p className="text-xs font-medium text-gray-600">הכנסות</p>
            </div>
            <p className="text-xs font-semibold text-gray-700">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={10} className="text-gray-500" />
              <p className="text-xs font-medium text-gray-600">לתת ({tithePercentage}%)</p>
            </div>
            <p className="text-xs font-semibold text-amber-600">{formatCurrency(requiredTithe)}</p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={10} className="text-gray-500" />
              <p className="text-xs font-medium text-gray-600">נתרם</p>
            </div>
            <p className="text-xs font-semibold text-emerald-600">{formatCurrency(givenTithe)}</p>
          </div>
        </div>

        {/* חוב למעשרות */}
        {/* חוב למעשרות - גרסה מוקטנת לגובה כולל 255px */}
        <div className="mb-4 p-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-100">
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-rose-400" />
              <span>חוב למעשרות</span>
            </div>
            <span className={`font-bold text-sm ${remainingTithe > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(Math.max(0, remainingTithe))}
            </span>
          </div>
        </div>


        {/* טופס הוספה */}
        <div className="p-2 bg-white border border-gray-100 rounded-lg">
          <div className="flex items-center gap-2">
            {/* שדה סכום */}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="סכום"
              className="w-24 p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
            />

            {/* שדה תיאור */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="תיאור"
              className="flex-1 p-2 border border-gray-200 rounded-md text-xs bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
            />

            {/* כפתור הוספה קטן */}
            <button
              onClick={handleAddTithe}
              disabled={!amount || !description.trim()}
              className={`p-2 rounded-md text-xs transition-all flex items-center justify-center ${amount && description.trim()
                ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Modal לכל המעשרות */}
      <TitheModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        titheGiven={titheGiven}
      />
    </>
  );
};

export default TitheSection;