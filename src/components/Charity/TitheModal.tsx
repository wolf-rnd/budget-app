import React, { useState, useEffect } from 'react';
import { X, Heart, Plus } from 'lucide-react';
import { CreateTitheRequest, UpdateTitheRequest } from '../../services/titheService';

interface TitheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTithe?: (tithe: CreateTitheRequest) => void;
  onEditTithe?: (id: string, tithe: UpdateTitheRequest) => void;
  editingTithe?: UpdateTitheRequest | null;
}

const TitheModal: React.FC<TitheModalProps> = ({
  isOpen,
  onClose,
  onAddTithe,
  onEditTithe,
  editingTithe,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // עדכון הטופס כשנפתח במצב עריכה
  useEffect(() => {
    if (editingTithe) {
      setDescription(editingTithe.description || '');
      setAmount(editingTithe.amount?.toString() || '');
      setDate(editingTithe.date || new Date().toISOString().split('T')[0]);
      setNote(editingTithe.note || '');
    } else {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
  }, [editingTithe, isOpen]);

  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const cleanNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount || !date) {
      alert('תיאור, סכום ותאריך הם שדות חובה');
      return;
    }

    const titheData = {
      description: description.trim(),
      amount: Number(cleanNumber(amount)),
      date,
      note: note.trim() || undefined
    };

    if (editingTithe && onEditTithe) {
      onEditTithe(editingTithe.id!, titheData);
    } else if (onAddTithe) {
      onAddTithe(titheData);
    }

    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isEditing = !!editingTithe;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyPress}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* כותרת */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'עריכת מעשר' : 'הוספת מעשר חדש'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* תוכן הטופס */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* תיאור */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              תיאור המעשר *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
              placeholder="לדוגמה: תרומה למוסד חינוך, עזרה למשפחה..."
              required
              autoFocus
            />
          </div>

          {/* סכום ותאריך */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                סכום *
              </label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                placeholder="0"
                required
              />
              {amount && (
                <p className="text-xs text-gray-500 mt-1">
                  סכום: {amount} ש"ח
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                תאריך המעשר *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                required
              />
            </div>
          </div>

          {/* הערות */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              הערות
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
              rows={3}
              placeholder="הערות נוספות על המעשר..."
            />
          </div>

          {/* כפתורי פעולה */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              {isEditing ? 'עדכון מעשר' : 'הוספת מעשר'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TitheModal;