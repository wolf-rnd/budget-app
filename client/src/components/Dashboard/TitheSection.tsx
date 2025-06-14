import React, { useState } from 'react';
import { Plus, Heart, DollarSign, TrendingUp, Target, Gift } from 'lucide-react';
import { TitheGiven } from '../../types';

interface TitheSectionProps {
  totalIncome: number;
  tithePercentage: number;
  titheGiven: TitheGiven[];
  onAddTithe: (amount: number, description: string) => void;
}

const TitheSection: React.FC<TitheSectionProps> = ({ totalIncome, tithePercentage, titheGiven, onAddTithe }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-pink-500 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* דגש עיצובי - פסים אלכסוניים עדינים */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-100/60 to-transparent rounded-bl-full"></div>
      <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-pink-200/40 to-transparent rounded-bl-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart size={18} className="text-pink-600" />
          <h3 className="text-lg font-bold text-gray-800">מעשרות</h3>
        </div>
        
        {/* כרטיסי סיכום בשורה אחת */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* סה"כ הכנסות */}
          <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign size={12} className="text-blue-600" />
              <p className="text-xs font-bold text-gray-700">הכנסות</p>
            </div>
            <p className="text-xs font-bold text-gray-800">{formatCurrency(totalIncome)}</p>
          </div>
          
          {/* מעשר לתת */}
          <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={12} className="text-orange-600" />
              <p className="text-xs font-bold text-gray-700">לתת ({tithePercentage}%)</p>
            </div>
            <p className="text-xs font-bold text-orange-600">{formatCurrency(requiredTithe)}</p>
          </div>
          
          {/* נתרם */}
          <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={12} className="text-emerald-600" />
              <p className="text-xs font-bold text-gray-700">נתרם</p>
            </div>
            <p className="text-xs font-bold text-emerald-600">{formatCurrency(givenTithe)}</p>
          </div>
        </div>

        {/* רכיב סיכום נפרד - חוב למעשרות ללא רקע */}
        <div className="mb-4 text-center p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift size={16} className="text-pink-600" />
            <p className="text-xs font-bold text-pink-700">חוב למעשרות</p>
          </div>
          <p className={`text-xl font-bold ${remainingTithe > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(Math.max(0, remainingTithe))}
          </p>
        </div>

        {/* שדות הוספה מהירים */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="סכום"
              className="w-full p-2 border-2 border-gray-200 rounded text-xs focus:border-pink-400 focus:ring-1 focus:ring-pink-200 transition-all bg-white"
            />
            
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="תיאור"
              className="w-full p-2 border-2 border-gray-200 rounded text-xs focus:border-pink-400 focus:ring-1 focus:ring-pink-200 transition-all bg-white"
            />
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="הערה (אופציונלי)"
              className="flex-1 p-2 border-2 border-gray-200 rounded text-xs focus:border-pink-400 focus:ring-1 focus:ring-pink-200 transition-all bg-white"
            />
            
            <button
              onClick={handleAddTithe}
              disabled={!amount || !description.trim()}
              className={`px-3 py-2 rounded text-xs font-medium transition-all flex items-center justify-center ${
                amount && description.trim()
                  ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitheSection;