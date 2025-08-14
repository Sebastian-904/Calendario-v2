
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { User, Role } from '../../types';
import Button from '../ui/Button';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  editingUser: User | null;
  currentUserRole: Role;
}

const UserModal: React.FC<UserModalProps> = ({ open, onClose, onSave, editingUser, currentUserRole }) => {
  const isEditing = !!editingUser;

  const getInitialState = useCallback(() => {
    return {
      id: editingUser?.id || `u${Math.random().toString(36).slice(2, 8)}`,
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      role: editingUser?.role || "cliente_miembro",
    };
  }, [editingUser]);

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
    if (form.name && form.email) {
      onSave(form);
    }
  }
  
  const canAssignAdmin = currentUserRole === 'admin' || currentUserRole === 'consultor';

  const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{isEditing ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Full Name</label>
            <input className={commonInputStyles} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., John Doe" />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Email</label>
            <input type="email" className={commonInputStyles} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g., john.doe@company.com" />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Role</label>
            <select 
              className={commonInputStyles} 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              disabled={editingUser?.role === 'consultor' || editingUser?.role === 'admin'}
            >
              {canAssignAdmin && <option value="cliente_admin">Client – Admin</option>}
              <option value="cliente_miembro">Client – Member</option>
            </select>
            {(editingUser?.role === 'consultor' || editingUser?.role === 'admin') && (
                <p className="text-xs text-zinc-500 mt-1">The Admin and Consultant roles cannot be changed.</p>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <Button title="Cancel" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button title="Save" onClick={handleSave}>Save User</Button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;