
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Company } from '../../types';
import Button from '../ui/Button';

interface CompaniesModalProps {
  open: boolean;
  onClose: () => void;
  companies: Company[];
  setCompanies: (c: Company[]) => void;
  editId: string | null;
  setEditId: (id: string | null) => void;
  setCompanyId: (id: string) => void;
}

const CompaniesModal: React.FC<CompaniesModalProps> = ({ open, onClose, companies, setCompanies, editId, setEditId, setCompanyId }) => {
  const isEditing = !!editId;
  const initialFormState = { id: `c${Math.random().toString(36).slice(2, 8)}`, name: "", country: "MX", rfc: "" };
  const [form, setForm] = useState<Company>(initialFormState);

  useEffect(() => {
    if (open) {
      const editingCompany = companies.find(c => c.id === editId);
      if (editingCompany) {
        setForm(editingCompany);
      } else {
        setForm(initialFormState);
      }
    }
  }, [open, editId, companies]);
  
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
    if (isEditing) {
      setCompanies(companies.map(c => c.id === editId ? form : c));
    } else {
      setCompanies([...companies, form]);
      setCompanyId(form.id);
    }
    setEditId(null);
    onClose();
  };

  const handleDelete = () => {
    if (!isEditing) return;
    const remainingCompanies = companies.filter(c => c.id !== editId);
    setCompanies(remainingCompanies);
    setEditId(null);
    setCompanyId(remainingCompanies[0]?.id || '');
    onClose();
  };

  const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{isEditing ? 'Edit Company' : 'Add New Company'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Company Name</label>
            <input className={commonInputStyles} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Country</label>
              <input className={commonInputStyles} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">Tax ID</label>
              <input className={commonInputStyles} value={form.rfc || ""} onChange={(e) => setForm({ ...form, rfc: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div>
            {isEditing && (
              <Button title="Delete company" className="text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/50" variant="ghost" onClick={handleDelete}>Delete</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button title="Cancel" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button title="Save" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesModal;