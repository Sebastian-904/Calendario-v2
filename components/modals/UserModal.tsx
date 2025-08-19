
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import type { User, Role } from '../../types';
import Button from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { predefinedAvatars } from '../../data/seedData';
import Avatar from '../shared/Avatar';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  editingUser: User | null;
  currentUserRole: Role;
}

const UserModal: React.FC<UserModalProps> = ({ open, onClose, onSave, editingUser, currentUserRole }) => {
  const { t } = useTranslation();
  const isEditing = !!editingUser;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialState = useCallback(() => {
    return {
      id: editingUser?.id || `u${Math.random().toString(36).slice(2, 8)}`,
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      role: editingUser?.role || "cliente_miembro",
      avatarUrl: editingUser?.avatarUrl,
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
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const canAssignAdmin = currentUserRole === 'admin' || currentUserRole === 'consultor';
  const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{isEditing ? t('user_modal.edit_title') : t('user_modal.new_title')}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title={t('general.close')}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar name={form.name} avatarUrl={form.avatarUrl} size="xl" />
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {t('user_modal.upload_photo')}
            </Button>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('user_modal.choose_avatar')}</label>
            <div className="grid grid-cols-6 gap-2">
              {predefinedAvatars.map((avatar, index) => (
                <button key={index} onClick={() => setForm(prev => ({ ...prev, avatarUrl: avatar }))}>
                  <img src={avatar} alt={`Avatar ${index + 1}`} className="w-12 h-12 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 transition-all" style={{boxShadow: form.avatarUrl === avatar ? `0 0 0 2px #10b981` : 'none'}}/>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('user_modal.full_name')}</label>
            <input className={commonInputStyles} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('user_modal.full_name_placeholder')} />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Email</label>
            <input type="email" className={commonInputStyles} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t('user_modal.email_placeholder')} />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('user_modal.role')}</label>
            <select 
              className={commonInputStyles} 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              disabled={editingUser?.role === 'consultor' || editingUser?.role === 'admin'}
            >
              {canAssignAdmin && <option value="cliente_admin">{t('user_modal.role_client_admin')}</option>}
              <option value="cliente_miembro">{t('user_modal.role_client_member')}</option>
            </select>
            {(editingUser?.role === 'consultor' || editingUser?.role === 'admin') && (
                <p className="text-xs text-zinc-500 mt-1">{t('user_modal.role_restriction_note')}</p>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <Button title={t('general.cancel')} variant="ghost" onClick={onClose}>{t('general.cancel')}</Button>
          <Button title={t('general.save')} onClick={handleSave}>{t('user_modal.save_user')}</Button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
