import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Calculator, 
  Upload,
  RefreshCw,
  Edit3,
  Check,
  X
} from 'lucide-react';

interface Cell {
  value: string | number;
  formula?: string;
  type: 'text' | 'number' | 'formula';
}

interface Sheet {
  name: string;
  data: Cell[][];
  id: string;
}

const Excel: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string>('');
  const [savedSheets, setSavedSheets] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const editInputRef = useRef<HTMLInputElement>(null);

  const ROWS = 20;
  const COLS = 10;

  // Initialize default sheet
  useEffect(() => {
    const initializeSheets = () => {
      setIsLoading(true);
      
      // Load saved sheets list
      const savedSheetsList = Object.keys(localStorage)
        .filter(key => key.startsWith('excel-sheet-'))
        .map(key => key.replace('excel-sheet-', ''));
      setSavedSheets(savedSheetsList);

      // Load last active sheet or create default
      const lastActiveSheet = localStorage.getItem('excel-last-active');
      let initialSheet: Sheet;

      if (lastActiveSheet && localStorage.getItem(`excel-sheet-${lastActiveSheet}`)) {
        try {
          initialSheet = JSON.parse(localStorage.getItem(`excel-sheet-${lastActiveSheet}`)!);
        } catch {
          initialSheet = createDefaultSheet();
        }
      } else {
        initialSheet = createDefaultSheet();
      }

      setSheets([initialSheet]);
      setActiveSheetId(initialSheet.id);
      setIsLoading(false);
    };

    // Simulate loading time
    setTimeout(initializeSheets, 500);
  }, []);

  // Auto-focus on edit input
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const createDefaultSheet = (): Sheet => {
    const data: Cell[][] = Array(ROWS).fill(null).map(() => 
      Array(COLS).fill(null).map(() => ({ value: '', type: 'text' as const }))
    );

    // Add sample budget data
    data[0][0] = { value: 'פריט תקציבי', type: 'text' };
    data[0][1] = { value: 'סכום', type: 'text' };
    data[0][2] = { value: 'הערות', type: 'text' };

    data[1][0] = { value: 'הכנסות חודשיות', type: 'text' };
    data[1][1] = { value: 15000, type: 'number' };
    data[1][2] = { value: 'משכורת + הכנסות נוספות', type: 'text' };

    data[2][0] = { value: 'הוצאות קבועות', type: 'text' };
    data[2][1] = { value: 8000, type: 'number' };
    data[2][2] = { value: 'משכנתא + חשמל + מים', type: 'text' };

    data[3][0] = { value: 'הוצאות משתנות', type: 'text' };
    data[3][1] = { value: 3000, type: 'number' };
    data[3][2] = { value: 'מזון + בילויים + דלק', type: 'text' };

    data[5][0] = { value: 'יתרה חודשית', type: 'text' };
    data[5][1] = { value: '=B2-B3-B4', formula: '=B2-B3-B4', type: 'formula' };
    data[5][2] = { value: 'חישוב אוטומטי', type: 'text' };

    return {
      id: 'default-sheet',
      name: 'תקציב משפחתי',
      data
    };
  };

  const getColumnLabel = (col: number): string => {
    return String.fromCharCode(65 + col); // A, B, C, etc.
  };

  const getCellReference = (row: number, col: number): string => {
    return `${getColumnLabel(col)}${row + 1}`;
  };

  const evaluateFormula = (formula: string, sheetData: Cell[][]): number => {
    try {
      // Simple formula evaluation
      let expression = formula.substring(1); // Remove '='
      
      // Replace cell references with values
      const cellRefRegex = /([A-Z])(\d+)/g;
      expression = expression.replace(cellRefRegex, (match, col, row) => {
        const colIndex = col.charCodeAt(0) - 65;
        const rowIndex = parseInt(row) - 1;
        
        if (rowIndex >= 0 && rowIndex < ROWS && colIndex >= 0 && colIndex < COLS) {
          const cell = sheetData[rowIndex][colIndex];
          if (cell.type === 'number') {
            return cell.value.toString();
          } else if (cell.type === 'formula') {
            return evaluateFormula(cell.formula!, sheetData).toString();
          }
        }
        return '0';
      });

      // Evaluate simple arithmetic
      return Function(`"use strict"; return (${expression})`)();
    } catch {
      return 0;
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const activeSheet = sheets.find(s => s.id === activeSheetId);
    if (!activeSheet) return;

    const cell = activeSheet.data[row][col];
    setEditingCell({ row, col });
    setEditValue(cell.formula || cell.value.toString());
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const activeSheet = sheets.find(s => s.id === activeSheetId);
    if (!activeSheet) return;

    const newSheets = sheets.map(sheet => {
      if (sheet.id === activeSheetId) {
        const newData = [...sheet.data];
        const { row, col } = editingCell;
        
        let cellType: 'text' | 'number' | 'formula' = 'text';
        let cellValue: string | number = editValue;
        let formula: string | undefined;

        if (editValue.startsWith('=')) {
          cellType = 'formula';
          formula = editValue;
          cellValue = evaluateFormula(editValue, newData);
        } else if (!isNaN(Number(editValue)) && editValue.trim() !== '') {
          cellType = 'number';
          cellValue = Number(editValue);
        }

        newData[row][col] = {
          value: cellValue,
          type: cellType,
          ...(formula && { formula })
        };

        return { ...sheet, data: newData };
      }
      return sheet;
    });

    setSheets(newSheets);
    setEditingCell(null);
    setEditValue('');

    // Auto-save
    saveCurrentSheet(newSheets.find(s => s.id === activeSheetId)!);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCellCancel();
    }
  };

  const saveCurrentSheet = (sheet?: Sheet) => {
    const sheetToSave = sheet || sheets.find(s => s.id === activeSheetId);
    if (sheetToSave) {
      localStorage.setItem(`excel-sheet-${sheetToSave.id}`, JSON.stringify(sheetToSave));
      localStorage.setItem('excel-last-active', sheetToSave.id);
    }
  };

  const saveWithName = () => {
    const name = prompt('שם הגיליון:');
    if (name) {
      const activeSheet = sheets.find(s => s.id === activeSheetId);
      if (activeSheet) {
        const newSheet = { ...activeSheet, id: name, name };
        localStorage.setItem(`excel-sheet-${name}`, JSON.stringify(newSheet));
        setSavedSheets(prev => [...prev.filter(s => s !== name), name]);
        alert(`✅ הגיליון "${name}" נשמר בהצלחה`);
      }
    }
  };

  const loadSheet = (sheetId: string) => {
    try {
      const data = localStorage.getItem(`excel-sheet-${sheetId}`);
      if (data) {
        const sheet: Sheet = JSON.parse(data);
        setSheets([sheet]);
        setActiveSheetId(sheet.id);
        localStorage.setItem('excel-last-active', sheet.id);
      }
    } catch {
      alert('❌ שגיאה בטעינת הגיליון');
    }
  };

  const deleteSheet = (sheetId: string) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את הגיליון "${sheetId}"?`)) {
      localStorage.removeItem(`excel-sheet-${sheetId}`);
      setSavedSheets(prev => prev.filter(s => s !== sheetId));
    }
  };

  const createNewSheet = () => {
    if (confirm('האם אתה בטוח שברצונך ליצור גיליון חדש?')) {
      const newSheet = createDefaultSheet();
      newSheet.id = `sheet-${Date.now()}`;
      newSheet.name = 'גיליון חדש';
      setSheets([newSheet]);
      setActiveSheetId(newSheet.id);
    }
  };

  const exportToCSV = () => {
    const activeSheet = sheets.find(s => s.id === activeSheetId);
    if (!activeSheet) return;

    const csvContent = activeSheet.data
      .map(row => 
        row.map(cell => {
          const value = cell.value.toString();
          return value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeSheet.name}.csv`;
    link.click();
  };

  const formatCellValue = (cell: Cell): string => {
    if (cell.type === 'number') {
      return typeof cell.value === 'number' ? cell.value.toLocaleString('he-IL') : cell.value.toString();
    }
    return cell.value.toString();
  };

  const getCellStyle = (row: number, col: number): string => {
    if (row === 0) return 'bg-blue-100 font-bold text-blue-800'; // Header row
    if (row === 5 && col <= 2) return 'bg-green-100 font-bold text-green-800'; // Result row
    return 'bg-white hover:bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען גיליון אלקטרוני...</h2>
          <p className="text-gray-600">מכין את הרכיב עבורך...</p>
        </div>
      </div>
    );
  }

  const activeSheet = sheets.find(s => s.id === activeSheetId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white shadow-md p-4 mb-4 mx-4 mt-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={28} className="text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">גיליון אלקטרוני</h1>
                <p className="text-gray-600">
                  {activeSheet ? `עובד על: ${activeSheet.name}` : 'חישובים משפחתיים ותכנון תקציב'}
                </p>
              </div>
            </div>

            {/* כלי עבודה */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveCurrentSheet()}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                title="שמירה מהירה"
              >
                <Save size={16} />
                שמירה
              </button>

              <button
                onClick={saveWithName}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                title="שמירה עם שם"
              >
                <Plus size={16} />
                שמור בשם
              </button>

              <button
                onClick={exportToCSV}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                title="ייצוא ל-CSV"
              >
                <Download size={16} />
                ייצוא CSV
              </button>

              <button
                onClick={createNewSheet}
                className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                title="גיליון חדש"
              >
                <RefreshCw size={16} />
                חדש
              </button>
            </div>
          </div>

          {/* גיליונות שמורים */}
          {savedSheets.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">גיליונות שמורים:</h3>
              <div className="flex flex-wrap gap-2">
                {savedSheets.map(sheetId => (
                  <div key={sheetId} className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1">
                    <button
                      onClick={() => loadSheet(sheetId)}
                      className={`text-sm font-medium ${
                        activeSheetId === sheetId 
                          ? 'text-green-700 bg-green-100 px-2 py-1 rounded' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                      title={`טען גיליון: ${sheetId}`}
                    >
                      📊 {sheetId}
                    </button>
                    <button
                      onClick={() => deleteSheet(sheetId)}
                      className="text-red-500 hover:text-red-700 ml-1"
                      title="מחק גיליון"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* הגיליון */}
        {activeSheet && (
          <div className="mx-4 mb-4 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calculator size={18} />
                {activeSheet.name}
              </h3>
            </div>

            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-12 h-8 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600"></th>
                    {Array.from({ length: COLS }, (_, col) => (
                      <th key={col} className="w-32 h-8 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600">
                        {getColumnLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: ROWS }, (_, row) => (
                    <tr key={row}>
                      <td className="w-12 h-8 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600 text-center">
                        {row + 1}
                      </td>
                      {Array.from({ length: COLS }, (_, col) => {
                        const cell = activeSheet.data[row][col];
                        const isEditing = editingCell?.row === row && editingCell?.col === col;
                        
                        return (
                          <td key={col} className={`w-32 h-8 border border-gray-300 p-1 ${getCellStyle(row, col)}`}>
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyPress}
                                  onBlur={handleCellSave}
                                  className="w-full h-6 px-1 text-xs border border-blue-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                />
                                <button
                                  onClick={handleCellSave}
                                  className="text-green-600 hover:text-green-800"
                                  title="שמירה"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={handleCellCancel}
                                  className="text-red-600 hover:text-red-800"
                                  title="ביטול"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => handleCellClick(row, col)}
                                className="w-full h-6 px-1 text-xs cursor-pointer flex items-center hover:bg-blue-50 rounded"
                                title={cell.formula ? `נוסחה: ${cell.formula}` : `${getCellReference(row, col)}: ${cell.value}`}
                              >
                                {formatCellValue(cell)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* הוראות שימוש */}
        <div className="mx-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Calculator size={20} />
            הוראות שימוש
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">נוסחאות בסיסיות:</h4>
              <ul className="space-y-1">
                <li>• <strong>=B2+B3</strong> - חיבור תאים</li>
                <li>• <strong>=B2-B3</strong> - חיסור תאים</li>
                <li>• <strong>=B2*B3</strong> - כפל תאים</li>
                <li>• <strong>=B2/B3</strong> - חילוק תאים</li>
                <li>• <strong>=B2+B3+B4</strong> - חיבור מספר תאים</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">טיפים:</h4>
              <ul className="space-y-1">
                <li>• לחץ על תא כדי לערוך אותו</li>
                <li>• Enter לשמירה, Escape לביטול</li>
                <li>• נוסחאות מתחילות ב-=</li>
                <li>• הנתונים נשמרים אוטומטית</li>
                <li>• ניתן לייצא ל-CSV</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Excel;