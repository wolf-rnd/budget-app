import React from 'react';
import { Trash2, Undo2, X } from 'lucide-react';
import { UndoNotification as UndoNotificationType } from './types';

interface UndoNotificationProps {
  notification: UndoNotificationType | null;
  onUndo: () => void;
  onClose: () => void;
}

const UndoNotification: React.FC<UndoNotificationProps> = ({
  notification,
  onUndo,
  onClose
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-lg shadow-lg border-2 border-emerald-500 animate-slide-up z-50 max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Trash2 size={16} className="flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">הכנסה נמחקה!</p>
            <p className="text-xs opacity-90 break-words">"{notification.incomeName}"</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onUndo}
            className="bg-white text-emerald-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <Undo2 size={12} />
            ביטול
          </button>

          <button
            onClick={onClose}
            className="text-white hover:text-emerald-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 w-full bg-emerald-500 rounded-full h-1">
        <div className="bg-white h-1 rounded-full animate-progress-bar"></div>
      </div>
    </div>
  );
};

export default UndoNotification;