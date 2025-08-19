import React, { useState, useEffect, useRef } from 'react';
import { X, FileUp, Keyboard, Upload, Trash2 } from 'lucide-react';
import type { Company } from '../../types.ts';
import Button from '../ui/Button.tsx';
import { useTranslation } from '../../hooks/useTranslation.tsx';

interface CompaniesModalProps {
  open: boolean;
  onClose: () => void;
  companies: Company[];
  setCompanies: (c: Company[]) => void;
  editId: string | null;
  setEditId: (id: string | null) => void;
  setCompanyId: (id: string) => void;
  onStartImport: () => void;
}

const CompaniesModal: React.FC<CompaniesModalProps> = ({ open, onClose, companies, setCompanies, editId, setEditId, setCompanyId, onStartImport }) => {
  const { t } = useTranslation();
  const isEditing = !!editId;
  const isCreating = !editId;
  
  const initialFormState: Company = { id: `c${Math.random().toString(36).slice(2, 8)}`, name: "", country: "MX", rfc: "", logoUrl: undefined };
  const [form, setForm] = useState<Company>(initialFormState);
  const [creationStep, setCreationStep] = useState(0); // 0: choice, 1: form
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const editingCompany = companies.find(c => c.id === editId);
      if (editingCompany) {
        setForm(editingCompany);
        setCreationStep(1); // Go directly to form if editing
      } else {
        setForm(initialFormState);
        setCreationStep(0); // Start at choice screen for new company
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
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700";

  const renderContent = () => {
    if (isCreating && creationStep === 0) {
      return (
        <div className="p-8 text-center space-y-6">
          <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">{t('company_modal.new_title')}</h3>
          <p className="text-zinc-600 dark:text-zinc-400">{t('company_modal.creation_choice_subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button
              onClick={onStartImport}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <FileUp className="w-10 h-10" />
              <span className="font-semibold">{t('company_modal.import_from_excel')}</span>
              <span className="text-xs text-zinc-500">{t('company_modal.import_from_excel_desc')}</span>
            </button>
            <button
              onClick={() => setCreationStep(1)}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Keyboard className="w-10 h-10" />
              <span className="font-semibold">{t('company_modal.create_manually')}</span>
               <span className="text-xs text-zinc-500">{t('company_modal.create_manually_desc')}</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
              <div className="flex-grow space-y-4">
                <div>
                  <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('company_modal.company_name')}</label>
                  <input className={commonInputStyles} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('company_modal.country')}</label>
                    <input className={commonInputStyles} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('company_modal.tax_id')}</label>
                    <input className={commonInputStyles} value={form.rfc || ""} onChange={(e) => setForm({ ...form, rfc: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                  <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5">{t('company_modal.logo')}</label>
                  <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <span className="text-xs text-zinc-500">{t('company_modal.no_logo')}</span>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
                  <div className="flex items-center justify-center mt-2 gap-1">
                      <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={() => fileInputRef.current?.click()} title={t('company_modal.upload_logo')}><Upload className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="p-1 h-auto text-rose-500" onClick={() => setForm(prev => ({...prev, logoUrl: undefined}))} title={t('company_modal.remove_logo')}><Trash2 className="w-4 h-4" /></Button>
                  </div>
              </div>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <div>
            {isEditing && (
              <Button title={t('general.delete') + " " + t('general.company')} className="text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/50" variant="ghost" onClick={handleDelete}>{t('general.delete')}</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button title={t('general.cancel')} variant="ghost" onClick={onClose}>{t('general.cancel')}</Button>
            <Button title={t('general.save')} onClick={handleSave}>{t('event_modal.save_changes')}</Button>
          </div>
        </div>
      </>
    );
  };
  
  const modalTitle = isEditing ? t('company_modal.edit_title') : t('company_modal.new_title');

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{modalTitle}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title={t('general.close')}><X className="w-5 h-5" /></button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CompaniesModal;