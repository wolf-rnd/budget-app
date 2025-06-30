import React, { useState } from 'react';
import { GetFundRequest } from '../../services/fundsService';
import { PlusCircle, Calendar, Wallet, TrendingUp, Gift, Coins, DollarSign, Target, Check, X } from 'lucide-react';
import ColorBadge from '../UI/ColorBadge';

interface FundsGridProps {
  funds: GetFundRequest[];
  currentDisplayMonth: number;
  onCloseDailyFund: (remainingAmount: number) => void;
  onAddMoneyToEnvelope: (amount: number) => void;
  onMonthChange: (month: number) => void;
}

const FundsGrid: React.FC<FundsGridProps> = ({ funds, currentDisplayMonth, onCloseDailyFund, onAddMoneyToEnvelope }) => {
  const [showEnvelopeInput, setShowEnvelopeInput] = useState(false);
  const [envelopeAmount, setEnvelopeAmount] = useState('');
  const [showClosureInput, setShowClosureInput] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState('');

  const level1Funds = funds.filter(fund => fund.level === 1);
  const level2Funds = funds.filter(fund => fund.level === 2);
  const level3Funds = funds.filter(fund => fund.level === 3);
  
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0.00';
    return amount.toLocaleString('he-IL');
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[monthNumber - 1];
  };

  const getCurrentMonth = () => {
    const currentDate = new Date();
    return currentDate.getMonth() + 1;
  };

  const getFundIcon = (fundName: string) => {
    if (fundName.includes('שוטף')) return <Wallet size={20} className="text-emerald-600" />;
    if (fundName.includes('שנתי')) return <Target size={18} className="text-indigo-600" />;
    if (fundName.includes('מורחב')) return <Target size={18} className="text-indigo-600" />;
    if (fundName.includes('בונוס')) return <Gift size={18} className="text-orange-600" />;
    if (fundName.includes('עודפים')) return <Coins size={18} className="text-yellow-600" />;
    return <DollarSign size={18} className="text-gray-600" />;
  };

  const handleEnvelopeSubmit = () => {
    if (envelopeAmount && Number(envelopeAmount) > 0) {
      onAddMoneyToEnvelope(Number(envelopeAmount));
      setEnvelopeAmount('');
      setShowEnvelopeInput(false);
    }
  };

  const handleEnvelopeCancel = () => {
    setEnvelopeAmount('');
    setShowEnvelopeInput(false);
  };

  const handleClosureSubmit = () => {
    if (remainingAmount && Number(remainingAmount) >= 0) {
      onCloseDailyFund(Number(remainingAmount));
      setRemainingAmount('');
      setShowClosureInput(false);
    }
  };

  const handleClosureCancel = () => {
    setRemainingAmount('');
    setShowClosureInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'envelope' | 'closure') => {
    if (e.key === 'Enter') {
      if (action === 'envelope') {
        handleEnvelopeSubmit();
      } else {
        handleClosureSubmit();
      }
    } else if (e.key === 'Escape') {
      if (action === 'envelope') {
        handleEnvelopeCancel();
      } else {
        handleClosureCancel();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* שורה ראשונה - קופת שוטף */}
      {level1Funds.map(fund => (
        <div key={fund.id} className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border-2 border-emerald-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* חצי עיגול עדין בפינה הימנית העליונה */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-200/40 to-transparent rounded-bl-full"></div>
          <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-bl from-emerald-300/30 to-transparent rounded-bl-full"></div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-full"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3">
              {getFundIcon(fund.name)}
              <div>
                <h3 className="text-lg font-bold text-emerald-800">{fund.name}</h3>
                <p className="text-sm text-emerald-600 font-medium">
                  חודש {getMonthName(currentDisplayMonth)} {String(currentDisplayMonth).padStart(2, '0')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!showEnvelopeInput && !showClosureInput ? (
                <>
                  <button
                    onClick={() => setShowEnvelopeInput(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <PlusCircle size={16} />
                    הוספה למעטפה
                  </button>
                  <button
                    onClick={() => setShowClosureInput(true)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <Calendar size={16} />
                    סגירת חודש
                  </button>
                </>
              ) : showEnvelopeInput ? (
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-md border-2 border-emerald-300">
                  <input
                    type="number"
                    value={envelopeAmount}
                    onChange={(e) => setEnvelopeAmount(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 'envelope')}
                    placeholder="סכום"
                    className="w-24 p-1 border border-emerald-200 rounded text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                    autoFocus
                  />
                  <button
                    onClick={handleEnvelopeSubmit}
                    className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600 transition-colors"
                    title="אישור"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleEnvelopeCancel}
                    className="bg-gray-400 text-white p-1 rounded hover:bg-gray-500 transition-colors"
                    title="ביטול"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-md border-2 border-orange-300">
                  <span className="text-xs text-gray-600 whitespace-nowrap">נותר במעטפה:</span>
                  <input
                    type="number"
                    value={remainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 'closure')}
                    placeholder="0"
                    className="w-20 p-1 border border-orange-200 rounded text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                    autoFocus
                  />
                  <button
                    onClick={handleClosureSubmit}
                    className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600 transition-colors"
                    title="סגירת חודש"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleClosureCancel}
                    className="bg-gray-400 text-white p-1 rounded hover:bg-gray-500 transition-colors"
                    title="ביטול"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 relative z-10">
            <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target size={16} className="text-emerald-600" />
                <p className="text-sm text-emerald-700 font-bold">תקציב</p>
              </div>
              <p className="text-lg font-bold text-gray-800 text-center">{formatCurrency(fund.amount)}</p>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-green-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-600" />
                <p className="text-sm text-green-700 font-bold">ניתן בפועל</p>
              </div>
              <p className="text-lg font-bold text-green-600 text-center">{formatCurrency(fund.amount_given || 0)}</p>
            </div>
            <div className="text-center p-4 bg-white/80 rounded-lg border-2 border-amber-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins size={16} className="text-amber-600" />
                <p className="text-sm text-amber-700 font-bold">נותר לתת</p>
              </div>
              <p className="text-lg font-bold text-amber-600 text-center">{formatCurrency(fund.amount - (fund.amount_given || 0))}</p>
            </div>
          </div>
        </div>
      ))}

      {/* שורה שנייה - קופות שנתיות */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {level2Funds.map(fund => (
          <div key={fund.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
              {getFundIcon(fund.name)}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{fund.name}</h3>
                {fund.color_class && (
                  <ColorBadge color={fund.color_class} size="sm" className="mt-1">
                    {fund.type === 'monthly' ? 'חודשי' : fund.type === 'annual' ? 'שנתי' : 'חיסכון'}
                  </ColorBadge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* תקציב */}
              <div className="p-1 bg-gray-50 rounded-lg border border-gray-200 w-[70px] h-full">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Target size={14} className="text-indigo-600" />
                  <p className="text-xs text-gray-600 font-medium">תקציב</p>
                </div>
                <p className="font-bold text-gray-800 text-center">{formatCurrency(fund.amount)}</p>
              </div>
              
              {/* מומש */}
              <div className="p-1 bg-gray-50 rounded-lg border border-gray-200 w-[70px] h-full">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <TrendingUp size={14} className="text-orange-600 rotate-180" />
                  <p className="text-xs text-gray-600 font-medium">מומש</p>
                </div>
                <p className="font-bold text-orange-600 text-center">{formatCurrency(fund.spent || 0)}</p>
              </div>
              
              {/* נותר */}
              <div className="p-1 bg-gray-50 rounded-lg border border-gray-200 w-[70px] h-full">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Coins size={14} className="text-green-600" />
                  <p className="text-xs text-gray-600 font-medium">נותר</p>
                </div>
                <p className="font-bold text-green-600 text-center">{formatCurrency(fund.amount - (fund.spent || 0))}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* שורה שלישית - קופות עודפים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {level3Funds.map(fund => (
          <div key={fund.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl hover:border-yellow-300 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              {getFundIcon(fund.name)}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{fund.name}</h3>
                {fund.color_class && (
                  <ColorBadge color={fund.color_class} size="sm" className="mt-1">
                    {fund.type === 'monthly' ? 'חודשי' : fund.type === 'annual' ? 'שנתי' : 'חיסכון'}
                  </ColorBadge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <DollarSign size={20} className="text-yellow-600" />
              <p className="text-xl font-bold text-gray-800 text-center">{formatCurrency(fund.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FundsGrid;