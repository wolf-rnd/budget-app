import React, { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Save, Download, Upload, RefreshCw, Calculator, Plus, Trash2 } from 'lucide-react';

// Import Luckysheet types
declare global {
  interface Window {
    luckysheet: any;
  }
}

const Excel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedSheets, setSavedSheets] = useState<string[]>([]);

  // Initialize Luckysheet
  useEffect(() => {
    const initLuckysheet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load Luckysheet CSS and JS
        await loadLuckysheetsAssets();

        // Initialize Luckysheet
        if (window.luckysheet && containerRef.current) {
          // Clear any existing content
          containerRef.current.innerHTML = '';

          // Load saved data if exists
          const savedData = localStorage.getItem('luckysheet-data');
          let initialData = [];

          if (savedData) {
            try {
              initialData = JSON.parse(savedData);
            } catch (e) {
              console.warn('Failed to parse saved data, using default');
            }
          }

          // Default sheet if no saved data
          if (initialData.length === 0) {
            initialData = [{
              name: "חישובים משפחתיים",
              color: "",
              index: 0,
              status: 1,
              order: 0,
              hide: 0,
              row: 50,
              column: 26,
              defaultRowHeight: 19,
              defaultColWidth: 73,
              celldata: [
                // Header row
                { r: 0, c: 0, v: { v: "פריט", ct: { fa: "General", t: "g" }, m: "פריט", bg: "#4472C4", fc: "#FFFFFF", bl: 1, fs: 12 } },
                { r: 0, c: 1, v: { v: "סכום", ct: { fa: "General", t: "g" }, m: "סכום", bg: "#4472C4", fc: "#FFFFFF", bl: 1, fs: 12 } },
                { r: 0, c: 2, v: { v: "הערות", ct: { fa: "General", t: "g" }, m: "הערות", bg: "#4472C4", fc: "#FFFFFF", bl: 1, fs: 12 } },
                
                // Sample data
                { r: 1, c: 0, v: { v: "הכנסות חודשיות", ct: { fa: "General", t: "g" }, m: "הכנסות חודשיות" } },
                { r: 1, c: 1, v: { v: 15000, ct: { fa: "General", t: "n" }, m: "15000" } },
                { r: 1, c: 2, v: { v: "משכורת + הכנסות נוספות", ct: { fa: "General", t: "g" }, m: "משכורת + הכנסות נוספות" } },
                
                { r: 2, c: 0, v: { v: "הוצאות קבועות", ct: { fa: "General", t: "g" }, m: "הוצאות קבועות" } },
                { r: 2, c: 1, v: { v: 8000, ct: { fa: "General", t: "n" }, m: "8000" } },
                { r: 2, c: 2, v: { v: "משכנתא + חשמל + מים", ct: { fa: "General", t: "g" }, m: "משכנתא + חשמל + מים" } },
                
                { r: 3, c: 0, v: { v: "הוצאות משתנות", ct: { fa: "General", t: "g" }, m: "הוצאות משתנות" } },
                { r: 3, c: 1, v: { v: 3000, ct: { fa: "General", t: "n" }, m: "3000" } },
                { r: 3, c: 2, v: { v: "מזון + בילויים + דלק", ct: { fa: "General", t: "g" }, m: "מזון + בילויים + דלק" } },
                
                { r: 5, c: 0, v: { v: "יתרה חודשית", ct: { fa: "General", t: "g" }, m: "יתרה חודשית", bg: "#70AD47", fc: "#FFFFFF", bl: 1 } },
                { r: 5, c: 1, v: { v: "=B2-B3-B4", ct: { fa: "General", t: "n" }, m: "4000", f: "=B2-B3-B4", bg: "#70AD47", fc: "#FFFFFF", bl: 1 } },
                { r: 5, c: 2, v: { v: "חישוב אוטומטי", ct: { fa: "General", t: "g" }, m: "חישוב אוטומטי", bg: "#70AD47", fc: "#FFFFFF" } },
              ],
              config: {
                merge: {},
                rowlen: {},
                columnlen: {},
                rowhidden: {},
                colhidden: {},
                borderInfo: [],
                authority: {}
              },
              scrollLeft: 0,
              scrollTop: 0,
              luckysheet_select_save: [{ row: [0, 0], column: [0, 0] }],
              calcChain: [],
              isPivotTable: false,
              pivotTable: {},
              filter_select: {},
              filter: null,
              luckysheet_alternateformat_save: [],
              luckysheet_alternateformat_save_modelCustom: [],
              luckysheet_conditionformat_save: {},
              frozen: {},
              chart: [],
              zoomRatio: 1,
              image: [],
              showGridLines: 1,
              dataVerification: {}
            }];
          }

          const options = {
            container: 'luckysheet-container',
            title: 'גיליון חישובים משפחתי',
            lang: 'he',
            data: initialData,
            showinfobar: false,
            showsheetbar: true,
            showstatisticBar: true,
            enableAddRow: true,
            enableAddCol: true,
            userInfo: false,
            myFolderUrl: '',
            devicePixelRatio: window.devicePixelRatio,
            functionButton: '<button class="btn btn-primary btn-sm" onclick="saveData()">💾 שמירה</button>',
            showConfigWindowResize: true,
            forceCalculation: false,
            plugins: ['chart'],
            hook: {
              updated: function() {
                // Auto-save on changes
                setTimeout(() => {
                  saveData();
                }, 1000);
              }
            }
          };

          window.luckysheet.create(options);
          
          // Add global save function
          (window as any).saveData = saveData;
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize Luckysheet:', err);
        setError('שגיאה בטעינת הגיליון האלקטרוני');
        setIsLoading(false);
      }
    };

    initLuckysheet();

    // Cleanup
    return () => {
      if (window.luckysheet && window.luckysheet.destroy) {
        try {
          window.luckysheet.destroy();
        } catch (e) {
          console.warn('Failed to destroy Luckysheet:', e);
        }
      }
    };
  }, []);

  // Load saved sheets list
  useEffect(() => {
    const sheets = Object.keys(localStorage)
      .filter(key => key.startsWith('luckysheet-saved-'))
      .map(key => key.replace('luckysheet-saved-', ''));
    setSavedSheets(sheets);
  }, []);

  // Load Luckysheet assets
  const loadLuckysheetsAssets = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.luckysheet) {
        resolve();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css';
      document.head.appendChild(cssLink);

      const cssLink2 = document.createElement('link');
      cssLink2.rel = 'stylesheet';
      cssLink2.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css';
      document.head.appendChild(cssLink2);

      const cssLink3 = document.createElement('link');
      cssLink3.rel = 'stylesheet';
      cssLink3.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css';
      document.head.appendChild(cssLink3);

      const cssLink4 = document.createElement('link');
      cssLink4.rel = 'stylesheet';
      cssLink4.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/assets/iconfont/iconfont.css';
      document.head.appendChild(cssLink4);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Luckysheet'));
      document.head.appendChild(script);
    });
  };

  // Save data to localStorage
  const saveData = () => {
    try {
      if (window.luckysheet && window.luckysheet.getAllSheets) {
        const data = window.luckysheet.getAllSheets();
        localStorage.setItem('luckysheet-data', JSON.stringify(data));
        console.log('✅ נתונים נשמרו בהצלחה');
      }
    } catch (error) {
      console.error('❌ שגיאה בשמירת נתונים:', error);
    }
  };

  // Save with custom name
  const saveWithName = () => {
    const name = prompt('שם הגיליון:');
    if (name && window.luckysheet && window.luckysheet.getAllSheets) {
      try {
        const data = window.luckysheet.getAllSheets();
        localStorage.setItem(`luckysheet-saved-${name}`, JSON.stringify(data));
        setSavedSheets(prev => [...prev.filter(s => s !== name), name]);
        alert(`✅ הגיליון "${name}" נשמר בהצלחה`);
      } catch (error) {
        alert('❌ שגיאה בשמירת הגיליון');
      }
    }
  };

  // Load saved sheet
  const loadSheet = (name: string) => {
    try {
      const data = localStorage.getItem(`luckysheet-saved-${name}`);
      if (data && window.luckysheet) {
        const parsedData = JSON.parse(data);
        window.luckysheet.destroy();
        
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            const options = {
              container: 'luckysheet-container',
              title: `גיליון: ${name}`,
              lang: 'he',
              data: parsedData,
              showinfobar: false,
              showsheetbar: true,
              showstatisticBar: true,
              enableAddRow: true,
              enableAddCol: true,
              userInfo: false,
              devicePixelRatio: window.devicePixelRatio,
              functionButton: '<button class="btn btn-primary btn-sm" onclick="saveData()">💾 שמירה</button>',
              hook: {
                updated: function() {
                  setTimeout(() => saveData(), 1000);
                }
              }
            };
            window.luckysheet.create(options);
            (window as any).saveData = saveData;
          }
        }, 100);
      }
    } catch (error) {
      alert('❌ שגיאה בטעינת הגיליון');
    }
  };

  // Delete saved sheet
  const deleteSheet = (name: string) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את הגיליון "${name}"?`)) {
      localStorage.removeItem(`luckysheet-saved-${name}`);
      setSavedSheets(prev => prev.filter(s => s !== name));
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (window.luckysheet && window.luckysheet.exportLuckyToExcel) {
      try {
        window.luckysheet.exportLuckyToExcel('גיליון-חישובים-משפחתי.xlsx');
      } catch (error) {
        alert('❌ שגיאה בייצוא לאקסל');
      }
    }
  };

  // Create new sheet
  const createNewSheet = () => {
    if (confirm('האם אתה בטוח שברצונך ליצור גיליון חדש? (הנתונים הנוכחיים יאבדו)')) {
      localStorage.removeItem('luckysheet-data');
      window.location.reload();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <FileSpreadsheet size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת Excel</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <p className="text-gray-600">חישובים משפחתיים ותכנון תקציב</p>
              </div>
            </div>

            {/* כלי עבודה */}
            <div className="flex items-center gap-2">
              <button
                onClick={saveData}
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
                onClick={exportToExcel}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
                title="ייצוא לאקסל"
              >
                <Download size={16} />
                ייצוא
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
                {savedSheets.map(name => (
                  <div key={name} className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-1">
                    <button
                      onClick={() => loadSheet(name)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      title={`טען גיליון: ${name}`}
                    >
                      📊 {name}
                    </button>
                    <button
                      onClick={() => deleteSheet(name)}
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

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">טוען גיליון אלקטרוני...</h2>
              <p className="text-gray-600">אנא המתן בזמן טעינת הרכיב</p>
            </div>
          </div>
        )}

        {/* Luckysheet Container */}
        <div className="mx-4 mb-4">
          <div 
            id="luckysheet-container" 
            ref={containerRef}
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
            style={{ 
              height: 'calc(100vh - 200px)', 
              minHeight: '600px',
              display: isLoading ? 'none' : 'block'
            }}
          />
        </div>

        {/* הוראות שימוש */}
        {!isLoading && (
          <div className="mx-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Calculator size={20} />
              הוראות שימוש
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">פונקציות בסיסיות:</h4>
                <ul className="space-y-1">
                  <li>• <strong>=SUM(A1:A10)</strong> - סכום טווח</li>
                  <li>• <strong>=AVERAGE(A1:A10)</strong> - ממוצע</li>
                  <li>• <strong>=MAX(A1:A10)</strong> - ערך מקסימלי</li>
                  <li>• <strong>=MIN(A1:A10)</strong> - ערך מינימלי</li>
                  <li>• <strong>=COUNT(A1:A10)</strong> - ספירת תאים</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">טיפים:</h4>
                <ul className="space-y-1">
                  <li>• לחץ פעמיים על תא לעריכה</li>
                  <li>• גרור לבחירת טווח תאים</li>
                  <li>• Ctrl+C/V להעתקה והדבקה</li>
                  <li>• הנתונים נשמרים אוטומטית</li>
                  <li>• ניתן ליצור גרפים ותרשימים</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Excel;