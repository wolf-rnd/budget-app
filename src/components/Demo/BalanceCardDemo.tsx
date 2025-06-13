import React from 'react';
import { CreditCard } from 'lucide-react';

const BalanceCardDemo: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // דוגמאות שונות של איזון חיובי
  const positiveBalances = [5000, 12500, 850, 25000];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          הדמיה: כרטיסית איזון בפלוס 💰
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {positiveBalances.map((balance, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <CreditCard className="mx-auto mb-2 text-gray-600" size={24} />
              <p className="text-xs text-gray-700 font-medium mb-1">איזון</p>
              <p className="text-lg font-bold text-gray-800">
                +{formatCurrency(balance)}
              </p>
            </div>
          ))}
        </div>

        {/* השוואה עם איזון שלילי */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">השוואה: פלוס מול מינוס</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* איזון חיובי */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-green-600">איזון חיובי ✅</h3>
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200 rounded-lg shadow-md">
                <CreditCard className="mx-auto mb-3 text-gray-600" size={32} />
                <p className="text-sm text-gray-700 font-medium mb-2">איזון</p>
                <p className="text-2xl font-bold text-gray-800">
                  +{formatCurrency(8500)}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>צבעים:</strong></p>
                <p>רקע: אפור בהיר</p>
                <p>גבול: אפור</p>
                <p>טקסט: אפור כהה</p>
              </div>
            </div>

            {/* איזון שלילי */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-red-600">איזון שלילי ⚠️</h3>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 rounded-lg shadow-md">
                <CreditCard className="mx-auto mb-3 text-red-600" size={32} />
                <p className="text-sm text-red-700 font-medium mb-2">איזון</p>
                <p className="text-2xl font-bold text-red-800">
                  -{formatCurrency(3200)}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>צבעים:</strong></p>
                <p>רקע: אדום בהיר</p>
                <p>גבול: אדום</p>
                <p>טקסט: אדום כהה</p>
              </div>
            </div>
          </div>
        </div>

        {/* פירוט הצבעים */}
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-800">פירוט הצבעים לאיזון חיובי</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">קלאסים של Tailwind:</h3>
              <div className="space-y-2 text-sm font-mono bg-white p-4 rounded-lg border">
                <p><span className="text-blue-600">רקע:</span> from-slate-50 to-gray-100</p>
                <p><span className="text-blue-600">גבול:</span> border-gray-200</p>
                <p><span className="text-blue-600">אייקון:</span> text-gray-600</p>
                <p><span className="text-blue-600">כותרת:</span> text-gray-700</p>
                <p><span className="text-blue-600">סכום:</span> text-gray-800</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">דוגמאות צבעים:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-slate-50 border border-gray-300 rounded"></div>
                  <span className="text-sm">slate-50 (רקע התחלה)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm">gray-100 (רקע סיום)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded"></div>
                  <span className="text-sm">gray-200 (גבול)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  <span className="text-sm">gray-600 (אייקון)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-800 rounded"></div>
                  <span className="text-sm">gray-800 (טקסט)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* הסבר על הבחירה */}
        <div className="mt-8 bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <h2 className="text-xl font-bold mb-4 text-green-800">למה אפור לאיזון חיובי? 🤔</h2>
          <div className="text-green-700 space-y-2">
            <p>✅ <strong>נייטרלי ומקצועי:</strong> אפור נותן מראה עסקי ורציני</p>
            <p>✅ <strong>לא מפריע:</strong> לא "צועק" כמו ירוק, אבל עדיין חיובי</p>
            <p>✅ <strong>קריא:</strong> ניגודיות טובה עם הטקסט</p>
            <p>✅ <strong>מאוזן:</strong> מתאים למערכת ניהול כספים רצינית</p>
            <p>⚠️ <strong>אדום למינוס:</strong> בולט ומזהיר כשיש בעיה</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCardDemo;