import React, { useState } from 'react';
import { Plus, Heart, DollarSign, TrendingUp, Target } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-center gap-2 mb-5">
        <Heart size={18} className="text-rose-400" />
        <h3 className="text-lg font-semibold text-gray-700">מעשרות</h3>
      </div>
      
      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign size={12} className="text-gray-500" />
            <p className="text-xs font-medium text-gray-600">הכנסות</p>
          </div>
          <p className="text-sm font-semibold text-gray-700">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={12} className="text-gray-500" />
            <p className="text-xs font-medium text-gray-600">לתת ({tithePercentage}%)</p>
          </div>
          <p className="text-sm font-semibold text-amber-600">{formatCurrency(requiredTithe)}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp size={12} className="text-gray-500" />
            <p className="text-xs font-medium text-gray-600">נתרם</p>
          </div>
          <p className="text-sm font-semibold text-emerald-600">{formatCurrency(givenTithe)}</p>
        </div>
      </div>

      {/* חוב למעשרות */}
      <div className="mb-5 text-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={16} className="text-rose-400" />
          <p className="text-sm font-medium text-rose-700">חוב למעשרות</p>
        </div>
        <p className={`text-xl font-bold ${remainingTithe > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {formatCurrency(Math.max(0, remainingTithe))}
        </p>
      </div>

      {/* טופס הוספה */}
      <div className="space-y-3 p-3 bg-white border border-gray-100 rounded-lg">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="סכום"
          className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
        
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="תיאור"
          className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
        />
        
        <button
          onClick={handleAddTithe}
          disabled={!amount || !description.trim()}
          className={`w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            amount && description.trim()
              ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={14} />
          הוספה
        </button>
      </div>
    </div>
  );
};

export default TitheSection;