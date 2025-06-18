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
      autoHide: notification.autoHide ?? (notification.type === 'success'),
      duration: notification.duration ?? (notification.type === 'error' ? 0 : 6000),
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    // Auto-hide notification if enabled
    if (newNotification.autoHide && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
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
    <div className="fixed top-4 left-4 z-50 space-y-3 max-w-md">
      {notifications.length > 1 && (
        <div className="flex justify-between items-center mb-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border">
          <span className="text-xs text-gray-600 font-medium">
            {notifications.length} התראות
          </span>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
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
    // Animate in
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
          return <WifiOff size={20} className="text-red-500" />;
        }
        if (notification.status && notification.status >= 500) {
          return <Server size={20} className="text-red-500" />;
        }
        if (notification.status === 408 || notification.message.includes('timeout')) {
          return <Clock size={20} className="text-red-500" />;
        }
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'info':
        return <Wifi size={20} className="text-blue-500" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return <AlertCircle size={20} className="text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!notification.status) return '';
    
    const statusTexts: Record<number, string> = {
      400: 'בקשה שגויה',
      401: 'לא מורשה',
      403: 'אין הרשאה',
      404: 'לא נמצא',
      408: 'תם הזמן הקצוב',
      429: 'יותר מדי בקשות',
      500: 'שגיאת שרת פנימית',
      502: 'שרת לא זמין',
      503: 'שירות לא זמין',
      504: 'תם הזמן הקצוב לשרת'
    };

    return statusTexts[notification.status] || `שגיאה ${notification.status}`;
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-red-50 border-red-300 text-red-800 shadow-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800 shadow-yellow-100';
      case 'info':
        return 'bg-blue-50 border-blue-300 text-blue-800 shadow-blue-100';
      case 'success':
        return 'bg-green-50 border-green-300 text-green-800 shadow-green-100';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800 shadow-gray-100';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
      `}
    >
      <div className={`
        rounded-xl border-2 shadow-lg p-4 max-w-md backdrop-blur-sm
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
                <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                  {notification.title}
                  {notification.status && (
                    <span className="text-xs font-normal opacity-75 bg-black/10 px-2 py-0.5 rounded-full">
                      {notification.status}
                    </span>
                  )}
                </h4>
                
                <p className="text-sm opacity-90 break-words leading-relaxed">
                  {notification.message}
                </p>
                
                {notification.status && (
                  <p className="text-xs opacity-75 mt-2 font-medium bg-black/5 px-2 py-1 rounded">
                    {getStatusText()}
                  </p>
                )}
                
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
                <X size={16} />
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
              
              {notification.autoHide && notification.duration > 0 && (
                <span className="bg-black/10 px-2 py-0.5 rounded">נסגר אוטומטי</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-hide */}
        {notification.autoHide && notification.duration > 0 && (
          <div className="mt-3 w-full bg-black/10 rounded-full h-1.5">
            <div 
              className="bg-current h-1.5 rounded-full animate-progress-bar opacity-40"
              style={{
                animationDuration: `${notification.duration}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};