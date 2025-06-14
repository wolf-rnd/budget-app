import React, { useState } from 'react';
import { X, Heart, Plus } from 'lucide-react';

interface TitheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTithe: (amount: number, description: string, note: string) => void;
}

const TitheModal: React.FC<TitheModalProps> = ({ isOpen, onClose, onAddTithe }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description) {
      onAddTithe(Number(amount), description, note);
      setAmount('');
      setDescription('');
      setNote('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart size={24} className="text-white" />
              <h2 className="text-xl font-bold text-white">הוספת מעשר</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              סכום המעשר *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              תיאור *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
              placeholder="לדוגמה: תרומה למוסד חינוך"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              הערה
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border-2 border-pink-200 rounded-lg text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
              rows={3}
              placeholder="הערות נוספות..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-pink-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              הוספה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TitheModal;