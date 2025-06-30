import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit3, Trash2, Save, FileText } from 'lucide-react';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [noteContents, setNoteContents] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<string, boolean>>({});
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Initialize note contents when notes change
  useEffect(() => {
    const contents: Record<string, string> = {};
    notes.forEach(note => {
      contents[note.id] = note.content;
    });
    setNoteContents(contents);
  }, [notes]);

  // Auto-focus on content when switching notes
  useEffect(() => {
    if (activeNoteId && contentRef.current) {
      contentRef.current.focus();
    }
  }, [activeNoteId]);

  // Auto-focus on title input when editing
  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitleId]);

  const handleAddNote = () => {
    if (newNoteTitle.trim()) {
      onAddNote(newNoteTitle.trim(), '');
      setNewNoteTitle('');
      setIsAddingNote(false);
    }
  };

  const handleKeyPressNewNote = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    } else if (e.key === 'Escape') {
      setIsAddingNote(false);
      setNewNoteTitle('');
    }
  };

  const handleContentChange = (noteId: string, content: string) => {
    setNoteContents(prev => ({ ...prev, [noteId]: content }));
    setHasUnsavedChanges(prev => ({ ...prev, [noteId]: true }));
  };

  const handleSaveNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      onUpdateNote(noteId, note.title, noteContents[noteId] || '');
      setHasUnsavedChanges(prev => ({ ...prev, [noteId]: false }));
    }
  };

  const handleTitleEdit = (noteId: string, currentTitle: string) => {
    setEditingTitleId(noteId);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = (noteId: string) => {
    if (editingTitle.trim()) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        onUpdateNote(noteId, editingTitle.trim(), note.content);
      }
    }
    setEditingTitleId(null);
    setEditingTitle('');
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent, noteId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave(noteId);
    } else if (e.key === 'Escape') {
      setEditingTitleId(null);
      setEditingTitle('');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הפתק?')) {
      onDeleteNote(noteId);
      if (activeNoteId === noteId) {
        setActiveNoteId(notes.length > 1 ? notes.find(n => n.id !== noteId)?.id || null : null);
      }
    }
  };

  const activeNote = notes.find(note => note.id === activeNoteId);

  // Auto-select first note if none selected
  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border-r-4 border-blue-400 hover:shadow-md transition-all duration-300">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-700">פתקים</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {notes.map(note => (
            <div
              key={note.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-all cursor-pointer min-w-0 ${
                activeNoteId === note.id
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveNoteId(note.id)}
            >
              {editingTitleId === note.id ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => handleTitleKeyPress(e, note.id)}
                  onBlur={() => handleTitleSave(note.id)}
                  className="bg-white border border-blue-300 rounded px-2 py-1 text-sm min-w-0 flex-1"
                  style={{ minWidth: '80px', maxWidth: '120px' }}
                />
              ) : (
                <>
                  <span 
                    className="text-sm font-medium truncate flex-1 min-w-0"
                    style={{ maxWidth: '100px' }}
                    title={note.title}
                  >
                    {note.title}
                  </span>
                  
                  {/* Unsaved indicator */}
                  {hasUnsavedChanges[note.id] && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" title="שינויים לא שמורים" />
                  )}
                  
                  {/* Tab actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTitleEdit(note.id, note.title);
                      }}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded"
                      title="עריכת שם"
                    >
                      <Edit3 size={12} />
                    </button>
                    
                    {notes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                        title="מחיקת פתק"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add new note tab */}
          {isAddingNote ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-b-2 border-green-500 rounded-t-lg">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={handleKeyPressNewNote}
                placeholder="שם הפתק"
                className="bg-white border border-green-300 rounded px-2 py-1 text-sm w-24"
                autoFocus
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteTitle.trim()}
                className="text-green-600 hover:text-green-700 p-1 rounded disabled:text-gray-400"
              >
                <Save size={12} />
              </button>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteTitle('');
                }}
                className="text-gray-400 hover:text-red-600 p-1 rounded"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-t-lg transition-all"
              title="פתק חדש"
            >
              <Plus size={14} />
              <span className="text-sm">חדש</span>
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="p-4">
        {activeNote ? (
          <div className="space-y-3">
            {/* Save button */}
            {hasUnsavedChanges[activeNote.id] && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-600 font-medium">יש שינויים לא שמורים</span>
                <button
                  onClick={() => handleSaveNote(activeNote.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Save size={14} />
                  שמירה
                </button>
              </div>
            )}

            {/* Content editor */}
            <textarea
              ref={contentRef}
              value={noteContents[activeNote.id] || ''}
              onChange={(e) => handleContentChange(activeNote.id, e.target.value)}
              placeholder="כתוב כאן את הפתק שלך... תוכל לכתוב חישובים, תזכירים או כל דבר אחר"
              className="w-full h-64 p-3 border border-gray-200 rounded-lg resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm leading-relaxed"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineHeight: '1.6'
              }}
            />

            {/* Footer info */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>נוצר: {new Date(activeNote.created_at).toLocaleDateString('he-IL')}</span>
              {activeNote.updated_at !== activeNote.created_at && (
                <span>עודכן: {new Date(activeNote.updated_at).toLocaleDateString('he-IL')}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-2">אין פתקים</p>
            <p className="text-sm">לחץ על "חדש" כדי ליצור פתק ראשון</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;