
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { User, Categories, CalendarEvent, AppPermissions } from '../../types';
import Button from '../ui/Button';
import { todayISO } from '../../utils/helpers';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CalendarEvent | Omit<CalendarEvent, 'id'>) => void;
  presetDate: string | null;
  editingEvent: CalendarEvent | null;
  users: User[];
  categories: Categories;
  permissions: AppPermissions;
}

const EventModal: React.FC<EventModalProps> = ({ open, onClose, onSave, presetDate, editingEvent, users, categories, permissions }) => {
  const isEditing = !!editingEvent;

  const getInitialState = useCallback(() => {
    return {
      title: editingEvent?.title || "",
      date: editingEvent?.date || presetDate || todayISO(),
      category: editingEvent?.category || Object.keys(categories)[0] || "fiscal",
      priority: editingEvent?.priority || 'Medium',
      assignee: editingEvent?.assignee || users?.[0]?.id || "",
      status: editingEvent?.status || 'Pending',
    };
  }, [editingEvent, presetDate, categories, users]);

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
    }
  }, [open, getInitialState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    if(form.title && form.date && form.assignee){
        onSave(isEditing ? { ...form, id: editingEvent.id } : form);
    }
  }

  const canSave = isEditing ? permissions.canEditEvents : permissions.canCreateEvents;

  const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{isEditing ? 'Edit Task / Event' : 'New Task / Event'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Title</label>
            <input className={commonInputStyles} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Monthly tax declaration" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Date</label>
              <input type="date" className={commonInputStyles} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Category</label>
              <select className={commonInputStyles} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.entries(categories).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Priority</label>
              <select className={commonInputStyles} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Assignee</label>
              <select className={commonInputStyles} value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                 {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Status</label>
            <select className={commonInputStyles} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <Button title="Cancel" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button title="Save" onClick={handleSave} disabled={!canSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
