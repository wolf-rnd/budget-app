import React from 'react';
import { Heart, Calculator } from 'lucide-react';
import { ENV } from '../../config/env';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* לוגו ושם */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Calculator size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{ENV.APP_NAME}</h3>
              <p className="text-xs text-gray-500">ניהול חכם</p>
            </div>
          </div>

          {/* זכויות יוצרים */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm text-gray-600">© {currentYear} כל הזכויות שמורות לנעמי מסינג</span>
              <Heart size={14} className="text-pink-500" />
            </div>
           
          </div>

          {/* מידע נוסף */}
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-400">גרסה {ENV.APP_VERSION}</p>
            <p className="text-xs text-gray-400">מערכת ניהול תקציב משפחתי</p>
          </div>
        </div>

        {/* קו הפרדה עדין */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400">
            נבנה באהבה למשפחה שלנו
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;