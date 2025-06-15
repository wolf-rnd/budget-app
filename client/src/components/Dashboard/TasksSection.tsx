import React, { useState, useEffect } from 'react';
import { Plus, Check, Star, X, CheckCircle2, Undo2, ListTodo } from 'lucide-react';
import { Task } from '../../types';

interface TasksSectionProps {
  tasks: Task[];
  onAddTask: (description: string, important: boolean) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

interface UndoNotification {
  taskId: string;
  taskDescription: string;
  timeoutId: NodeJS.Timeout;
}

const TasksSection: React.FC<TasksSectionProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState('');
  const [undoNotification, setUndoNotification] = useState<UndoNotification | null>(null);

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim(), false);
      setNewTask('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleTaskCompletion = (task: Task) => {
    if (!task.completed) {
      // המשימה מסומנת כבוצעה - מציגים נוטיפיקציה עם אפשרות ביטול
      onUpdateTask(task.id, { completed: true });
      
      // יצירת טיימר של 3 שניות - אחרי זה המשימה נמחקת
      const timeoutId = setTimeout(() => {
        onDeleteTask(task.id);
        setUndoNotification(null);
      }, 3000);

      setUndoNotification({
        taskId: task.id,
        taskDescription: task.description,
        timeoutId
      });
    } else {
      // המשימה מבוטלת מבוצע - פשוט מעדכנים
      onUpdateTask(task.id, { completed: false });
    }
  };

  const handleUndo = () => {
    if (undoNotification) {
      // ביטול הסימון כבוצע
      onUpdateTask(undoNotification.taskId, { completed: false });
      
      // ביטול הטיימר
      clearTimeout(undoNotification.timeoutId);
      
      // הסתרת הנוטיפיקציה
      setUndoNotification(null);
    }
  };

  const handleCloseNotification = () => {
    if (undoNotification) {
      clearTimeout(undoNotification.timeoutId);
      setUndoNotification(null);
    }
  };

  // ניקוי טיימר בעת unmount
  useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  // סינון המשימות - הסתרת משימות שמסומנות כבוצעות ויש להן נוטיפיקציה פעילה
  const visibleTasks = tasks.filter(task => {
    if (task.completed && undoNotification && undoNotification.taskId === task.id) {
      return false; // הסתרת המשימה בזמן הנוטיפיקציה
    }
    return !task.completed; // הצגת רק משימות שלא בוצעו
  });

  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4 border-r-4 border-purple-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* דגש עיצובי - פסים אלכסוניים עדינים */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100/60 to-transparent rounded-bl-full"></div>
      <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-bl from-purple-200/40 to-transparent rounded-bl-full"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800">תזכורות</h3>
        </div>
        
        {/* רשימת המשימות - עיצוב משופר ללא רקע */}
        <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
          {visibleTasks.length > 0 ? (
            visibleTasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-300 min-w-0 ${
                  task.completed 
                    ? 'bg-green-100 border-2 border-green-300' 
                    : task.important
                      ? 'bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-200 border-3 border-yellow-500 shadow-2xl ring-4 ring-yellow-300/50 transform scale-105'
                      : 'bg-white border border-gray-200 hover:shadow-md hover:border-purple-300'
                }`}
              >
                <button
                  onClick={() => handleTaskCompletion(task)}
                  className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  {task.completed && <Check size={10} />}
                </button>
                
                <button
                  onClick={() => onUpdateTask(task.id, { important: !task.important })}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    task.important 
                      ? 'text-yellow-600 scale-125 drop-shadow-lg animate-pulse' 
                      : 'text-gray-300 hover:text-yellow-500 hover:scale-110'
                  }`}
                >
                  <Star 
                    size={task.important ? 16 : 12} 
                    fill={task.important ? 'currentColor' : 'none'} 
                    className={task.important ? 'filter drop-shadow-md' : ''}
                  />
                </button>
                
                <span className={`flex-1 transition-all break-words min-w-0 ${
                  task.completed 
                    ? 'line-through text-gray-500 text-xs' 
                    : task.important
                      ? 'text-amber-900 font-black text-sm tracking-wide'
                      : 'text-gray-800 text-xs'
                }`}>
                  {task.important && '⚡ '}
                  {task.description}
                  {task.important && ' ⚡'}
                </span>
                
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle2 size={14} className="mx-auto mb-1 opacity-50 text-purple-500" />
              <p className="text-xs font-medium text-gray-600">אין משימות רשומות</p>
            </div>
          )}
        </div>

        {/* שדה הוספה */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="תיאור המשימה..."
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-xs focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition-all bg-white"
          />
          
          <button
            onClick={handleAddTask}
            disabled={!newTask.trim()}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
              newTask.trim()
                ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* נוטיפיקציה של ביטול */}
        {undoNotification && (
          <div className="absolute bottom-4 left-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg border-2 border-green-500 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">המשימה הושלמה!</p>
                  <p className="text-xs opacity-90 break-words">"{undoNotification.taskDescription}"</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleUndo}
                  className="bg-white text-green-600 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <Undo2 size={12} />
                  ביטול
                </button>
                
                <button
                  onClick={handleCloseNotification}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            {/* פס התקדמות */}
            <div className="mt-2 w-full bg-green-500 rounded-full h-1">
              <div className="bg-white h-1 rounded-full animate-progress-bar"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksSection;