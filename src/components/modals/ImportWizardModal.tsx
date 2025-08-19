import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ImportWizardState, SheetData, MappedField, Company, User, CalendarEvent } from '../../types.ts';
import { useTranslation } from '../../hooks/useTranslation.tsx';
import * as XLSX from 'xlsx';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button.tsx';
import { classNames } from '../../utils/helpers.ts';

interface ImportWizardModalProps {
    state: ImportWizardState;
    setState: React.Dispatch<React.SetStateAction<ImportWizardState>>;
    onClose: () => void;
    onComplete: (data: { company: Company, users: User[], events: CalendarEvent[] }) => void;
}

interface ProcessedData {
    company: Partial<Company>;
    users: (Partial<User> & { originalEmail: string })[];
    tasks: (Partial<CalendarEvent> & { assignee_email: string; assignee: string; })[];
    validationErrors: { row: number, message: string, sheet: string }[];
}

const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
    const { t } = useTranslation();
    const steps = [
        t('import_wizard.steps.upload'), 
        t('import_wizard.steps.map'), 
        t('import_wizard.steps.validate'), 
        t('import_wizard.steps.summary')
    ];
    return (
        <div className="flex justify-between items-center px-8 pt-6 pb-4">
            {steps.map((label, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={classNames(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors",
                            index + 1 < step ? "bg-emerald-500 text-white" :
                            index + 1 === step ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200" :
                            "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                        )}>
                            {index + 1 < step ? <CheckCircle className="w-5 h-5" /> : index + 1}
                        </div>
                        <span className="text-xs mt-2 text-zinc-600 dark:text-zinc-400">{label}</span>
                    </div>
                    {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-zinc-200 dark:bg-zinc-700 mx-4"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const ImportWizardModal: React.FC<ImportWizardModalProps> = ({ state, setState, onClose, onComplete }) => {
    const { t } = useTranslation();
    const { step, file, sheets, mappings, show } = state;
    
    // Derived state for validation and summary steps
    const processedData = useMemo((): ProcessedData | null => {
        if (step < 3) return null;

        let company: Partial<Company> = {};
        let users: (Partial<User> & { originalEmail: string })[] = [];
        let tasks: (Partial<CalendarEvent> & { assignee_email: string })[] = [];
        let validationErrors: { row: number, message: string, sheet: string }[] = [];

        Object.entries(mappings).forEach(([sheetName, sheetMapping]) => {
            const sheet = sheets.find(s => s.name === sheetName);
            if (!sheet) return;

            sheet.data.forEach((row, rowIndex) => {
                let user: Partial<User> & { originalEmail: string } = { originalEmail: '' };
                let task: Partial<CalendarEvent> & { assignee_email: string } = { assignee_email: '' };
                let hasUserData = false;
                let hasTaskData = false;

                Object.entries(sheetMapping).forEach(([header, field]) => {
                    const value = row[header];
                    if (value === undefined || value === null) return;

                    switch (field) {
                        case 'company_name': company.name = String(value); break;
                        case 'company_rfc': company.rfc = String(value); break;
                        case 'user_name': user.name = String(value); hasUserData = true; break;
                        case 'user_email':
                            const email = String(value).toLowerCase();
                            if (/\S+@\S+\.\S+/.test(email)) {
                                user.email = email;
                                user.originalEmail = email;
                            } else {
                                validationErrors.push({ sheet: sheetName, row: rowIndex + 2, message: t('import_wizard.validate.invalid_email', { email }) });
                            }
                            hasUserData = true;
                            break;
                        case 'user_role':
                            const role = String(value);
                            if (role === 'cliente_admin' || role === 'cliente_miembro') {
                                user.role = role;
                            } else {
                                validationErrors.push({ sheet: sheetName, row: rowIndex + 2, message: t('import_wizard.validate.invalid_role', { name: user.name || 'N/A' }) });
                            }
                            hasUserData = true;
                            break;
                        case 'task_title': task.title = String(value); hasTaskData = true; break;
                        case 'task_date':
                            const dateStr = String(value);
                            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                                task.date = dateStr;
                            } else {
                                validationErrors.push({ sheet: sheetName, row: rowIndex + 2, message: t('import_wizard.validate.invalid_date', { title: task.title || 'N/A' }) });
                            }
                            hasTaskData = true;
                            break;
                        case 'task_category': task.category = String(value).toLowerCase(); hasTaskData = true; break;
                        case 'task_priority':
                            const priority = String(value);
                            if (['High', 'Medium', 'Low'].includes(priority)) {
                                task.priority = priority as 'High' | 'Medium' | 'Low';
                            }
                            hasTaskData = true;
                            break;
                        case 'task_assignee_email': task.assignee_email = String(value).toLowerCase(); hasTaskData = true; break;
                        case 'task_status':
                            const status = String(value);
                            if (['Pending', 'In Progress', 'Completed'].includes(status)) {
                                task.status = status as 'Pending' | 'In Progress' | 'Completed';
                            }
                             hasTaskData = true;
                            break;
                    }
                });

                if (hasUserData && user.email) {
                    const existingUser = users.find(u => u.email === user.email);
                    if (!existingUser) {
                        users.push({ ...user, id: `u-import-${users.length}`, role: user.role || 'cliente_miembro' });
                    }
                }
                if (hasTaskData && task.title) {
                    tasks.push({ ...task, id: `e-import-${tasks.length}`, status: task.status || 'Pending', category: task.category || 'fiscal', priority: task.priority || 'Medium' });
                }
            });
        });
        
        // Finalize tasks by linking assignee ID
        const finalTasks = tasks.map(task => {
            const assignee = users.find(u => u.originalEmail === task.assignee_email);
            if (task.assignee_email && !assignee) {
                 validationErrors.push({ sheet: 'N/A', row: 0, message: t('import_wizard.validate.assignee_not_found', { email: task.assignee_email, title: task.title || 'N/A' }) });
            }
            return { ...task, assignee: assignee?.id || '' };
        });

        if (!company.name) {
             validationErrors.unshift({ sheet: 'N/A', row: 0, message: t('import_wizard.validate.no_company_name') });
        }

        return { company, users, tasks: finalTasks, validationErrors };

    }, [step, sheets, mappings, t]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (show) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [show, onClose]);

    const handleNext = () => setState(s => ({ ...s, step: s.step + 1 }));
    const handleBack = () => setState(s => ({ ...s, step: s.step - 1 }));

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const selectedFile = files[0];
            setState(s => ({ ...s, file: selectedFile, sheets: [], mappings: {} })); // Reset sheets/mappings

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const parsedSheets: SheetData[] = workbook.SheetNames.map(name => {
                    const ws = workbook.Sheets[name];
                    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
                    const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                    return { name, headers, data: jsonData };
                });
                setState(s => ({ ...s, sheets: parsedSheets, step: 2 }));
            };
            reader.onerror = () => setState(s => ({...s, error: t('import_wizard.upload.error')}));
            reader.readAsBinaryString(selectedFile);
        }
    };
    
    const handleMappingChange = (sheetName: string, header: string, field: MappedField) => {
        setState(s => ({
            ...s,
            mappings: {
                ...s.mappings,
                [sheetName]: {
                    ...(s.mappings[sheetName] || {}),
                    [header]: field
                }
            }
        }));
    };
    
    const handleFinalImport = () => {
        if(!processedData || !processedData.company.name) return;

        const finalCompany: Company = {
            id: `c-import-${Date.now()}`,
            name: processedData.company.name,
            rfc: processedData.company.rfc || null,
            country: 'MX', // Default
            ...processedData.company,
        };
        const finalUsers: User[] = processedData.users.map(u => ({
            id: u.id!,
            name: u.name!,
            email: u.email!,
            role: u.role!
        }));
        const finalEvents: CalendarEvent[] = processedData.tasks.map(t => ({
             id: t.id!,
             title: t.title!,
             date: t.date!,
             category: t.category!,
             priority: t.priority!,
             assignee: t.assignee!,
             status: t.status!
        }));
        
        onComplete({ company: finalCompany, users: finalUsers, events: finalEvents });
    };

    if (!show) return null;

    return (
         <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{t('import_wizard.title')}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title={t('general.close')}><X className="w-5 h-5" /></button>
                </div>
                
                <ProgressBar step={step} />

                <div className="flex-grow p-6 overflow-y-auto">
                    {/* Step 1: Upload */}
                    {step === 1 && <StepUpload file={file} onFileChange={handleFileChange} t={t} />}
                    {/* Step 2: Map */}
                    {step === 2 && <StepMap sheets={sheets} mappings={mappings} onMappingChange={handleMappingChange} t={t} />}
                    {/* Step 3: Validate */}
                    {step === 3 && processedData && <StepValidate data={processedData} t={t} />}
                    {/* Step 4: Summary */}
                    {step === 4 && processedData && <StepSummary data={processedData} t={t} />}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center flex-shrink-0">
                    <Button variant="ghost" onClick={step === 1 ? onClose : handleBack} disabled={step === 1}>{t('import_wizard.back')}</Button>
                    <div className="flex items-center gap-2">
                         {step < 4 && <Button onClick={handleNext} disabled={step === 1 || (step === 3 && processedData?.validationErrors.some(e => e.message.includes('Critical')))}>{t('import_wizard.next')}</Button>}
                         {step === 4 && <Button onClick={handleFinalImport}>{t('import_wizard.finish')}</Button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepUpload: React.FC<{ file: File | null, onFileChange: (f: FileList | null) => void, t: Function }> = ({ file, onFileChange, t }) => (
     <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('import_wizard.upload.title')}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t('import_wizard.upload.subtitle')}</p>
        <div 
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
            onClick={() => document.getElementById('file-upload')?.click()}
            onDrop={(e) => { e.preventDefault(); onFileChange(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
        >
            <input type="file" id="file-upload" className="hidden" onChange={e => onFileChange(e.target.files)} accept=".xlsx" />
            <UploadCloud className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
            {file ? (
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{t('import_wizard.upload.file_selected', { fileName: file.name })}</p>
            ) : (
                <p className="font-semibold text-zinc-700 dark:text-zinc-200">Click or drag file here</p>
            )}
        </div>
        <div className="mt-6 flex justify-center">
             <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm text-left inline-flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                     <a href="/template.xlsx" download className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">{t('import_wizard.upload.download_template')}</a>
                     <p className="text-zinc-500 dark:text-zinc-400">{t('import_wizard.upload.template_note')}</p>
                </div>
             </div>
        </div>
    </div>
);

const StepMap: React.FC<{ sheets: SheetData[], mappings: Record<string, any>, onMappingChange: (sheetName: string, header: string, field: MappedField) => void, t: Function }> = ({ sheets, mappings, onMappingChange, t }) => {
    const MAPPING_OPTIONS: { label: string; value: MappedField }[] = [
        { label: t('import_wizard.fields.ignore'), value: 'ignore' },
        { label: t('import_wizard.fields.company_name'), value: 'company_name' },
        { label: t('import_wizard.fields.company_rfc'), value: 'company_rfc' },
        { label: t('import_wizard.fields.user_name'), value: 'user_name' },
        { label: t('import_wizard.fields.user_email'), value: 'user_email' },
        { label: t('import_wizard.fields.user_role'), value: 'user_role' },
        { label: t('import_wizard.fields.task_title'), value: 'task_title' },
        { label: t('import_wizard.fields.task_date'), value: 'task_date' },
        { label: t('import_wizard.fields.task_category'), value: 'task_category' },
        { label: t('import_wizard.fields.task_priority'), value: 'task_priority' },
        { label: t('import_wizard.fields.task_assignee_email'), value: 'task_assignee_email' },
        { label: t('import_wizard.fields.task_status'), value: 'task_status' },
    ];
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                 <h2 className="text-2xl font-bold mb-2">{t('import_wizard.map.title')}</h2>
                 <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('import_wizard.map.subtitle')}</p>
            </div>
            {sheets.map(sheet => (
                <div key={sheet.name} className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{t('import_wizard.map.sheet', { sheetName: sheet.name })}</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="font-bold text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-2">{t('import_wizard.map.column_in_excel')}</div>
                        <div className="font-bold text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-2">{t('import_wizard.map.field_in_app')}</div>

                        {sheet.headers.map(header => (
                            <React.Fragment key={header}>
                                <div className="flex items-center text-sm">{header}</div>
                                <div>
                                    <select
                                        className="w-full bg-white dark:bg-zinc-800 text-sm rounded-md px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={mappings[sheet.name]?.[header] || 'ignore'}
                                        onChange={e => onMappingChange(sheet.name, header, e.target.value as MappedField)}
                                    >
                                        {MAPPING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const StepValidate: React.FC<{ data: ProcessedData, t: Function }> = ({ data, t }) => (
     <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{t('import_wizard.validate.title')}</h2>
            <p className="text-zinc-500 dark:text-zinc-400">{t('import_wizard.validate.subtitle')}</p>
        </div>
        {data.validationErrors.length > 0 && (
             <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/50 rounded-lg p-4">
                <h3 className="font-semibold text-rose-800 dark:text-rose-200 mb-2">{t('import_wizard.validate.validation_errors')}</h3>
                <ul className="space-y-1 text-sm text-rose-700 dark:text-rose-300 list-disc list-inside">
                    {data.validationErrors.map((e, i) => <li key={i}>{e.sheet !== 'N/A' && <span className="font-mono text-xs bg-rose-100 dark:bg-rose-800/50 p-1 rounded mr-1">{e.sheet}:{e.row}</span>} {e.message}</li>)}
                </ul>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{t('import_wizard.validate.company_data')}</h3>
                <p className="text-sm"><span className="text-zinc-500 dark:text-zinc-400">{t('general.name')}:</span> {data.company.name || <span className="text-rose-500">{t('import_wizard.validate.no_company_name')}</span>}</p>
                <p className="text-sm"><span className="text-zinc-500 dark:text-zinc-400">{t('general.tax_id')}:</span> {data.company.rfc || 'N/A'}</p>
            </div>
             <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{t('import_wizard.validate.users_to_import')} ({data.users.length})</h3>
                <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                    {data.users.map(u => <li key={u.id}>{u.name} ({u.email}) - <span className="capitalize">{u.role}</span></li>)}
                    {data.users.length === 0 && <li className="text-zinc-500">{t('import_wizard.validate.no_users')}</li>}
                </ul>
            </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4">
             <h3 className="font-semibold mb-2">{t('import_wizard.validate.tasks_to_import')} ({data.tasks.length})</h3>
             <div className="max-h-60 overflow-y-auto text-sm">
                 <table className="w-full">
                    <thead><tr className="text-left text-zinc-500"><th>{t('general.title')}</th><th>{t('general.date')}</th><th>{t('event_modal.assignee')}</th></tr></thead>
                    <tbody>
                        {data.tasks.map(t => <tr key={t.id} className="border-b border-zinc-200 dark:border-zinc-700">
                            <td className="py-1">{t.title}</td><td>{t.date}</td><td>{t.assignee_email}</td></tr>)}
                    </tbody>
                 </table>
                 {data.tasks.length === 0 && <p className="text-center text-zinc-500 py-4">{t('import_wizard.validate.no_tasks')}</p>}
             </div>
        </div>
     </div>
);

const StepSummary: React.FC<{ data: ProcessedData, t: Function }> = ({ data, t }) => (
    <div className="text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400"/>
            </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('import_wizard.summary.ready')}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t('import_wizard.summary.subtitle')}</p>
        <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6 space-y-4 text-left">
             <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">{t('import_wizard.summary.company_name')}:</span>
                <span className="font-bold">{data.company.name}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-300">{t('import_wizard.summary.users')}:</span>
                <span className="font-mono bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">{data.users.length}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-300">{t('import_wizard.summary.tasks')}:</span>
                <span className="font-mono bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">{data.tasks.length}</span>
            </div>
        </div>
    </div>
);


export default ImportWizardModal;