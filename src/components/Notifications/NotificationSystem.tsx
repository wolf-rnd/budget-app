import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, AlertCircle, Wifi, WifiOff, Server, Clock, CheckCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  status?: number;
  endpoint?: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      autoHide: true, // כל הנוטיפיקציות נסגרות אוטומטית
      duration: notification.type === 'success' ? 2000 : 4000, // הצלחה: 2 שניות, שגיאה: 4 שניות
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 2)]); // מקסימום 3 נוטיפיקציות

    // Auto-hide notification
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, newNotification.duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification, clearAll } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.length > 1 && (
        <div className="flex justify-between items-center mb-1 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm border text-xs">
          <span className="text-gray-600 font-medium">
            {notifications.length} התראות
          </span>
          <button
            onClick={clearAll}
            className="text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            נקה הכל
          </button>
        </div>
      )}
      
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        if (notification.status === 0 || notification.message.includes('network') || notification.message.includes('socket')) {
          return <WifiOff size={16} className="text-red-500" />;
        }
        if (notification.status && notification.status >= 500) {
          return <Server size={16} className="text-red-500" />;
        }
        if (notification.status === 408 || notification.message.includes('timeout')) {
          return <Clock size={16} className="text-red-500" />;
        }
        return <AlertCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'info':
        return <Wifi size={16} className="text-blue-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // נוטיפיקציית הצלחה - קטנה וקומפקטית
  if (notification.type === 'success') {
    return (
      <div
        className={`
          transform transition-all duration-300 ease-out
          ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          ${isRemoving ? 'scale-95' : 'scale-100'}
        `}
      >
        <div className={`
          rounded-lg border shadow-md p-3 backdrop-blur-sm
          ${getColorClasses()}
          hover:shadow-lg transition-all duration-200
        `}>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.title}</p>
            </div>
            
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
              title="סגור התראה"
            >
              <X size={12} />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-black/10 rounded-full h-1">
            <div 
              className="bg-current h-1 rounded-full animate-progress-bar opacity-40"
              style={{
                animationDuration: `${notification.duration}ms`
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // נוטיפיקציית שגיאה - גדולה יותר עם פרטים
  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
      `}
    >
      <div className={`
        rounded-lg border shadow-lg p-4 max-w-sm backdrop-blur-sm
        ${getColorClasses()}
        hover:shadow-xl transition-all duration-200
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold mb-1">{notification.title}</h4>
                
                <p className="text-sm opacity-90 break-words leading-relaxed">
                  {notification.message}
                </p>
                
                {notification.endpoint && (
                  <p className="text-xs opacity-60 mt-2 font-mono break-all bg-black/5 px-2 py-1 rounded">
                    {notification.endpoint}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleRemove}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/10"
                title="סגור התראה"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs opacity-60">
              <span className="font-medium">
                {notification.timestamp.toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-black/10 rounded-full h-1.5">
          <div 
            className="bg-current h-1.5 rounded-full animate-progress-bar opacity-40"
            style={{
              animationDuration: `${notification.duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
};