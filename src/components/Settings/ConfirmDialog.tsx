import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;