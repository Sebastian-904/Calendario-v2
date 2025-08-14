
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Categories, Template } from '../../types';
import Button from '../ui/Button';
import { classNames } from '../../utils/helpers';

interface TCModalProps {
  open: boolean;
  onClose: () => void;
  categories: Categories;
  setCategories: (c: Categories) => void;
  templates: Template[];
  setTemplates: (t: Template[]) => void;
}

const TemplatesCategoriesModal: React.FC<TCModalProps> = ({ open, onClose, categories, setCategories, templates, setTemplates }) => {
  const [catKey, setCatKey] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("fiscal");
  const [tplPriority, setTplPriority] = useState<Template['priority']>("Medium");

  useEffect(() => {
    if (Object.keys(categories).length && !categories[tplCategory]) {
      setTplCategory(Object.keys(categories)[0]);
    }
  }, [categories, tplCategory]);
  
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
  
  const handleAddCategory = () => {
    if (!catKey || !catLabel) return;
    const key = catKey.toLowerCase().replace(/\s+/g, '_');
    setCategories({ ...categories, [key]: { label: catLabel, dot: "bg-zinc-400" }});
    setCatKey("");
    setCatLabel("");
  };

  const handleAddTemplate = () => {
    if (!tplName) return;
    setTemplates([...templates, { id: `t${Math.random().toString(36).slice(2, 8)}`, name: tplName, category: tplCategory, priority: tplPriority }]);
    setTplName("");
  };

  const commonInputStyles = "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">Templates & Categories</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Categories</h4>
            <div className="space-y-2 mb-3 max-h-64 overflow-auto pr-2">
              {Object.entries(categories).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={classNames("w-2 h-2 rounded-full", v.dot)}></span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">{v.label} <span className="text-xs text-zinc-500 dark:text-zinc-400">({k})</span></span>
                  </div>
                  <button title="Delete category" onClick={() => { const copy = { ...categories }; delete copy[k]; setCategories(copy); }} className="text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 text-xs">Delete</button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
              <input title="Category Key" className={classNames("col-span-1", commonInputStyles)} placeholder="key" value={catKey} onChange={(e) => setCatKey(e.target.value)} />
              <input title="Category Label" className={classNames("col-span-2", commonInputStyles)} placeholder="Label" value={catLabel} onChange={(e) => setCatLabel(e.target.value)} />
              <div className="col-span-3">
                <Button title="Add Category" size="sm" className="w-full" onClick={handleAddCategory}>Add Category</Button>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-4">
            <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Templates</h4>
            <div className="space-y-2 mb-3 max-h-64 overflow-auto pr-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                  <div className="text-sm">
                    <div className="text-zinc-800 dark:text-zinc-100">{t.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.category} · priority {t.priority}</div>
                  </div>
                  <button title="Delete template" onClick={() => setTemplates(templates.filter(x => x.id !== t.id))} className="text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 text-xs">Delete</button>
                </div>
              ))}
              {templates.length === 0 && <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No templates yet.</div>}
            </div>
             <div className="grid grid-cols-1 gap-2 p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                <input title="Template Name" className={commonInputStyles} placeholder="Template Name" value={tplName} onChange={(e) => setTplName(e.target.value)} />
                 <div className="grid grid-cols-2 gap-2">
                    <select title="Category" className={commonInputStyles} value={tplCategory} onChange={(e) => setTplCategory(e.target.value)}>
                        {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select title="Priority" className={commonInputStyles} value={tplPriority} onChange={(e) => setTplPriority(e.target.value as any)}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <Button title="Add Template" size="sm" className="w-full" onClick={handleAddTemplate}>Add Template</Button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <Button title="Close" variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesCategoriesModal;