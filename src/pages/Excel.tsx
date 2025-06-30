// import React, { useEffect, useRef, useState } from 'react';
// import { FileSpreadsheet, Download, Upload, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
// // import { createExcelConfig, downloadExcelFile, saveExcelFile, loadOnlyOfficeScript } from '../config/excelConfig';

// declare global {
//   interface Window {
//     DocsAPI: any;
//   }
// }

// const Excel: React.FC = () => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [docEditor, setDocEditor] = useState<any>(null);
//   const [loadingStep, setLoadingStep] = useState('מכין את Excel...');

//   useEffect(() => {
//     const initializeExcel = async () => {
//       try {
//         setLoadingStep('טוען ספריית OnlyOffice...');
        
//         // טעינת OnlyOffice API
//         // await loadOnlyOfficeScript();
        
//         setLoadingStep('מכין את הגיליון האלקטרוני...');
//         initializeEditor();
//       } catch (err) {
//         setError('שגיאה בהכנת Excel');
//         setIsLoading(false);
//       }
//     };

//     initializeExcel();
//   }, []);

//   const initializeEditor = () => {
//     if (!window.DocsAPI || !containerRef.current) {
//       setError('OnlyOffice API לא זמין');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setLoadingStep('יוצר גיליון חדש...');
      
//       // יצירת קונפיגורציה באמצעות הפונקציה מהקובץ הנפרד
//       const config = createExcelConfig();

//       setLoadingStep('מאתחל את העורך...');
      
//       const editor = new window.DocsAPI.DocEditor(containerRef.current, config);
//       setDocEditor(editor);
      
//       // הוספת event listeners
//       editor.attachEvent("onDocumentReady", () => {
//         setLoadingStep('Excel מוכן לשימוש!');
//         setTimeout(() => {
//           setIsLoading(false);
//         }, 500);
//       });

//       editor.attachEvent("onError", (event: any) => {
//         console.error('OnlyOffice Error:', event);
//         setError('שגיאה בטעינת Excel. נסה לרענן את הדף.');
//         setIsLoading(false);
//       });

//     } catch (err) {
//       console.error('Error initializing OnlyOffice:', err);
//       setError('שגיאה באתחול Excel');
//       setIsLoading(false);
//     }
//   };

//   const handleDownload = () => {
//     downloadExcelFile(docEditor);
//   };

//   const handleSave = () => {
//     saveExcelFile(docEditor);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <h2 className="text-xl font-bold text-gray-800 mb-2">{loadingStep}</h2>
//           <p className="text-gray-600 mb-4">מכין עבורך Excel מלא ואמיתי</p>
          
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-right">
//             <h3 className="font-semibold text-green-800 mb-2">מה תקבל:</h3>
//             <ul className="text-sm text-green-700 space-y-1">
//               <li>✅ Excel מלא עם כל התכונות</li>
//               <li>✅ נוסחאות מתקדמות</li>
//               <li>✅ גרפים וטבלאות</li>
//               <li>✅ שמירה והורדה</li>
//               <li>✅ ממשק זהה ל-Excel</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//             <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
//             <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת Excel</h2>
//             <p className="text-red-600 mb-4">{error}</p>
            
//             <div className="space-y-3">
//               <button
//                 onClick={() => window.location.reload()}
//                 className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 רענן את הדף
//               </button>
              
//               <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">
//                 <p className="font-semibold mb-1">סיבות אפשריות:</p>
//                 <ul className="text-right space-y-1">
//                   <li>• חיבור אינטרנט לא יציב</li>
//                   <li>• חסימת JavaScript</li>
//                   <li>• שרת OnlyOffice לא זמין</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-full mx-auto">
//         {/* כותרת העמוד */}
//         <div className="bg-white shadow-md p-4 mb-4 mx-4 mt-4 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <FileSpreadsheet size={28} className="text-green-600" />
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">Excel מלא ואמיתי</h1>
//                 <p className="text-gray-600">גיליון אלקטרוני מקצועי עם כל התכונות של Excel</p>
//               </div>
//             </div>

//             {/* כלי עבודה */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleSave}
//                 className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
//                 title="שמירה"
//               >
//                 <Save size={16} />
//                 שמירה
//               </button>

//               <button
//                 onClick={handleDownload}
//                 className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
//                 title="הורדה"
//               >
//                 <Download size={16} />
//                 הורדה
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* הודעת הצלחה */}
//         <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <CheckCircle size={20} className="text-green-600" />
//             <div>
//               <h3 className="font-semibold text-green-800">Excel אמיתי טעון בהצלחה! 🎉</h3>
//               <p className="text-sm text-green-700">
//                 זהו Excel מלא ואמיתי עם כל התכונות - נוסחאות, גרפים, עיצוב ועוד
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Excel Container */}
//         <div className="mx-4 mb-4 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
//           <div 
//             ref={containerRef}
//             className="w-full"
//             style={{ minHeight: '600px' }}
//           />
//         </div>

//         {/* הוראות שימוש */}
//         <div className="mx-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
//             <FileSpreadsheet size={20} />
//             זהו Excel אמיתי! 
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
//             <div>
//               <h4 className="font-semibold mb-2">תכונות מלאות:</h4>
//               <ul className="space-y-1">
//                 <li>• כל הנוסחאות של Excel</li>
//                 <li>• יצירת גרפים וטבלאות</li>
//                 <li>• עיצוב תאים מתקדם</li>
//                 <li>• מיון וסינון נתונים</li>
//                 <li>• פונקציות מתמטיות מורכבות</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-2">פעולות:</h4>
//               <ul className="space-y-1">
//                 <li>• שמירה אוטומטית</li>
//                 <li>• הורדה כקובץ Excel</li>
//                 <li>• העתקה והדבקה</li>
//                 <li>• ביטול וחזרה</li>
//                 <li>• הדפסה</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Excel;