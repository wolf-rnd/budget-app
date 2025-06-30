import React from 'react';
import { 
  Home, 
  TrendingDown, 
  TrendingUp, 
  Heart, 
  Wallet, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
import { ENV } from '../../config/env';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const menuItems = [
    {
      id: 'dashboard',
      name: 'דשבורד',
      icon: Home,
      description: 'מסך ראשי וסיכומים'
    },
    {
      id: 'expenses',
      name: 'הוצאות',
      icon: TrendingDown,
      description: 'ניהול וצפייה בהוצאות'
    },
    {
      id: 'income',
      name: 'הכנסות',
      icon: TrendingUp,
      description: 'ניהול וצפייה בהכנסות'
    },
    {
      id: 'charity',
      name: 'צדקה',
      icon: Heart,
      description: 'מעקב אחר מעשרות וצדקה'
    },
    {
      id: 'funds',
      name: 'קופות',
      icon: Wallet,
      description: 'ניהול קופות ותקציבים'
    },
    {
      id: 'excel',
      name: 'Excel',
      icon: FileSpreadsheet,
      description: 'גיליון אלקטרוני לחישובים'
    },
    {
      id: 'settings',
      name: 'הגדרות',
      icon: Settings,
      description: 'הגדרות מערכת'
    }
  ];

  return (
    <div className={`
      fixed top-0 right-0 h-full bg-white shadow-2xl z-40 transition-all duration-300 ease-in-out
      border-l border-gray-200
      ${isCollapsed ? 'w-16' : 'w-80'}
    `}>
      {/* כפתור צמצום/הרחבה */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-4 left-2 z-50 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-200 shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="text-gray-600" />
        ) : (
          <ChevronLeft size={16} className="text-gray-600" />
        )}
      </button>

      {/* כותרת עם לוגו */}
      <div className={`p-6 border-b border-gray-200 bg-gradient-to-l from-blue-50 to-indigo-50 ${isCollapsed ? 'px-3' : ''}`}>
        {!isCollapsed ? (
          <>
            {/* לוגו ושם האפליקציה */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                {/* לוגו עם אפקט צל - מחשבון במקום חזירון */}
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                  <Calculator size={24} className="text-white" />
                </div>
                {/* נקודות דקורטיביות */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full shadow-sm"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 leading-tight">{ENV.APP_NAME}</h2>
                <p className="text-xs text-emerald-600 font-medium">ניהול חכם</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            {/* לוגו מצומצם */}
            <div className="relative mx-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Calculator size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* רשימת התפריטים */}
      <nav className={`p-4 ${isCollapsed ? 'px-2' : ''}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink
                  to={`/${item.id}`}
                  className={({ isActive }) => `
                    w-full text-right rounded-xl transition-all duration-200 group relative flex items-center
                    ${isCollapsed ? 'p-3 justify-center' : 'p-4'}
                    ${isActive 
                      ? 'bg-gradient-to-l from-emerald-500 to-blue-600 text-white shadow-lg' 
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-md'
                    }
                  `}
                  title={isCollapsed ? item.name : ''}
                  end={item.id === 'dashboard'}
                >
                  {isCollapsed ? (
                    <div className="flex items-center justify-center w-full">
                      <Icon 
                        size={20} 
                        className={`transition-colors duration-200`} 
                      />
                    </div>
                  ) : (
                    <>
                      <Icon 
                        size={20} 
                        className={`mr-3 transition-colors duration-200`} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs mt-1 text-gray-500">
                          {item.description}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* פוטר */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-sm flex items-center justify-center">
                <Calculator size={10} className="text-white" />
              </div>
              <p className="text-xs text-gray-600 font-medium">{ENV.APP_NAME}</p>
            </div>
            <p className="text-xs text-gray-400">גרסה {ENV.APP_VERSION} • ניהול חכם</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;