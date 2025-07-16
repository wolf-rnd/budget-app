import { useState, useEffect, useCallback } from 'react';
import { notesService, Note, CreateNoteRequest, UpdateNoteRequest } from '../services/notesService';

export const useNotesData = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // שליפה
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesService.getAllNotes();
      setNotes(data);
    } catch (err) {
      setError('שגיאה בטעינת פתקים');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // יצירה
  const addNote = useCallback(async (title: string, content: string) => {
    try {
      const newNote = await notesService.createNote({ title, content });
      setNotes(prev => [newNote, ...prev]);
    } catch (err) {
      setError('שגיאה ביצירת פתק');
    }
  }, []);

  // עדכון
  const updateNote = useCallback(async (id: string, title: string, content: string) => {
    try {
      const updated = await notesService.updateNote(id, { title, content });
      setNotes(prev => prev.map(note => note.id === id ? updated : note));
    } catch (err) {
      setError('שגיאה בעדכון פתק');
    }
  }, []);

  // מחיקה
  const deleteNote = useCallback(async (id: string) => {
    try {
      await notesService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError('שגיאה במחיקת פתק');
    }
  }, []);

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};
