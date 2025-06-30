import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Check, Star, X, CheckCircle2, Undo2 } from 'lucide-react';
import { Task } from '../../types';
import { tasksService } from '../../services/tasksService';

interface TasksSectionProps {
  tasks: Task[];
  onAddTask: (title: string, important: boolean) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

interface UndoNotification {
  taskId: string;
  taskTitle: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

const TasksSection: React.FC<TasksSectionProps> = ({ 
  tasks: initialTasks, 
  onAddTask: onAddTaskProp, 
  onUpdateTask: onUpdateTaskProp, 
  onDeleteTask: onDeleteTaskProp 
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [undoNotification, setUndoNotification] = useState<UndoNotification | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  
  // מניעת קריאות כפולות
  const loadedRef = useRef(false);
  const isCreatingRef = useRef(false);

  // טעינת משימות מה-API בטעינה ראשונית - רק פעם אחת
  useEffect(() => {
    if (loadedRef.current) return;
    
    const loadTasks = async () => {
      try {
        setLoading(true);
        const apiTasks = await tasksService.getAllTasks({ completed: false });
        setTasks(apiTasks);
        loadedRef.current = true;
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks(initialTasks);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []); // ללא תלויות

  // עדכון tasks כשמגיעים נתונים חדשים מהרכיב האב
  useEffect(() => {
    if (loadedRef.current) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  const handleAddTask = useCallback(async () => {
    if (!newTitle.trim() || isCreatingRef.current) return;
    
    isCreatingRef.current = true; // מניעת קריאות כפולות
    
    try {
      setLoading(true);
      const createdTask = await tasksService.createTask({
        title: newTitle.trim(),
        important: false,
        completed: false
      });
      
      setTasks(prevTasks => [...prevTasks, createdTask]);
      setNewTitle('');
      onAddTaskProp(newTitle.trim(), false);
    } catch (error) {
      console.error('Failed to create task:', error);
      onAddTaskProp(newTitle.trim(), false);
      setNewTitle('');
    } finally {
      setLoading(false);
      isCreatingRef.current = false; // איפוס הדגל
    }
  }, [newTitle, onAddTaskProp]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  }, [handleAddTask]);

  const handleTaskCompletion = useCallback(async (task: Task) => {
    if (!task.completed) {
      try {
        setLoading(true);
        const updatedTask = await tasksService.updateTask(task.id, { completed: true });
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === task.id ? updatedTask : t)
        );
        
        const timeoutId = setTimeout(async () => {
          try {
            await tasksService.deleteTask(task.id);
            setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
            setUndoNotification(null);
          } catch (error) {
            console.error('Failed to delete task:', error);
          }
        }, 3000);

        setUndoNotification({
          taskId: task.id,
          taskTitle: task.title,
          timeoutId
        });

        onUpdateTaskProp(task.id, { completed: true });
      } catch (error) {
        console.error('Failed to update task:', error);
        onUpdateTaskProp(task.id, { completed: true });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const updatedTask = await tasksService.updateTask(task.id, { completed: false });
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === task.id ? updatedTask : t)
        );
        onUpdateTaskProp(task.id, { completed: false });
      } catch (error) {
        console.error('Failed to update task:', error);
        onUpdateTaskProp(task.id, { completed: false });
      } finally {
        setLoading(false);
      }
    }
  }, [onUpdateTaskProp]);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setLoading(true);
      const updatedTask = await tasksService.updateTask(id, updates);
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === id ? updatedTask : t)
      );
      onUpdateTaskProp(id, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
      onUpdateTaskProp(id, updates);
    } finally {
      setLoading(false);
    }
  }, [onUpdateTaskProp]);

  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await tasksService.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
      onDeleteTaskProp(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      onDeleteTaskProp(id);
    } finally {
      setLoading(false);
    }
  }, [onDeleteTaskProp]);

  const handleUndo = useCallback(async () => {
    if (undoNotification) {
      try {
        setLoading(true);
        const updatedTask = await tasksService.updateTask(undoNotification.taskId, { completed: false });
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === undoNotification.taskId ? updatedTask : t)
        );
        
        clearTimeout(undoNotification.timeoutId);
        setUndoNotification(null);
        onUpdateTaskProp(undoNotification.taskId, { completed: false });
      } catch (error) {
        console.error('Failed to undo task completion:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [undoNotification, onUpdateTaskProp]);

  const handleCloseNotification = useCallback(() => {
    if (undoNotification) {
      clearTimeout(undoNotification.timeoutId);
      setUndoNotification(null);
    }
  }, [undoNotification]);

  useEffect(() => {
    return () => {
      if (undoNotification) {
        clearTimeout(undoNotification.timeoutId);
      }
    };
  }, [undoNotification]);

  const visibleTasks = tasks.filter(task => {
    if (task.completed && undoNotification && undoNotification.taskId === task.id) {
      return false;
    }
    return !task.completed;
  });

  return (
    <div 
      className="relative bg-white rounded-xl  flex flex-col shadow-sm p-5 border-r-4 border-purple-400 hover:shadow-md transition-all duration-300"
      style={{ height: '700px', overflow: 'hidden' }}
    >
      <div className="flex items-center justify-center gap-2 mb-5">
        <CheckCircle2 size={18} className="text-violet-400" />
        <h3 className="text-lg font-semibold text-gray-700">תזכורות</h3>
        {loading && (
          <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      {/* רשימת המשימות */}
      <div className="flex-1 overflow-y-auto" >
        {visibleTasks.length > 0 ? (
          visibleTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                task.important
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm'
                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => handleTaskCompletion(task)}
                disabled={loading}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {task.completed && <Check size={12} />}
              </button>
              
              <button
                onClick={() => handleUpdateTask(task.id, { important: !task.important })}
                disabled={loading}
                className={`flex-shrink-0 transition-all duration-200 ${
                  task.important 
                    ? 'text-amber-500 scale-110' 
                    : 'text-gray-300 hover:text-amber-400 hover:scale-105'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Star 
                  size={task.important ? 16 : 14} 
                  fill={task.important ? 'currentColor' : 'none'} 
                />
              </button>
              
              <span className={`flex-1 transition-all break-words min-w-0 ${
                task.completed 
                  ? 'line-through text-gray-500 text-sm' 
                  : task.important
                    ? 'text-amber-800 font-semibold text-sm'
                    : 'text-gray-700 text-sm'
              }`}>
                {task.title}
              </span>
              
              <button
                onClick={() => handleDeleteTask(task.id)}
                disabled={loading}
                className={`flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <X size={12} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={14} className="text-gray-400" />
            </div>
            <p className="text-xs font-medium">אין משימות רשומות</p>
          </div>
        )}
      </div>

      {/* טופס הוספה */}
      <div className="space-y-3 p-3 bg-white border border-gray-100 rounded-lg mt-auto">
        <textarea
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          placeholder="תיאור המשימה..."
          rows={2}
          className={`w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all resize-none ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        
        <button
          onClick={handleAddTask}
          disabled={!newTitle.trim() || loading}
          className={`w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            newTitle.trim() && !loading
              ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={14} />
          הוספה
        </button>
      </div>

      {/* נוטיפיקציה של ביטול */}
      {undoNotification && (
        <div className="absolute bottom-4 left-4 right-4 bg-emerald-500 text-white p-3 rounded-lg shadow-lg animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">המשימה הושלמה!</p>
                <p className="text-xs opacity-90 break-words">"{undoNotification.taskTitle}"</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleUndo}
                disabled={loading}
                className={`bg-white text-emerald-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Undo2 size={12} />
                ביטול
              </button>
              
              <button
                onClick={handleCloseNotification}
                className="text-white hover:text-emerald-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          <div className="mt-2 w-full bg-emerald-400 rounded-full h-1">
            <div className="bg-white h-1 rounded-full animate-progress-bar"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksSection;