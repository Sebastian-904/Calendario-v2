import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { SheetData, MappedObligationField, ComplianceObligation } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import * as XLSX from 'xlsx';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { classNames, todayISO } from '../../utils/helpers';

interface ObligationImportModalProps {
    open: boolean;
    onClose: () => void;
    onComplete: (data: Omit<ComplianceObligation, 'id'>[]) => void;
}

type WizardState = {
    step: number; // 1: upload, 2: map, 3: validate
    file: File | null;
    sheets: SheetData[];
    mappings: Record<string, MappedObligationField>;
}

const ObligationImportModal: React.FC<ObligationImportModalProps> = ({ open, onClose, onComplete }) => {
    const { t } = useTranslation();
    const initialState: WizardState = { step: 1, file: null, sheets: [], mappings: {} };
    const [state, setState] = useState<WizardState>(initialState);

    useEffect(() => {
        if (open) {
            setState(initialState);
        }
    }, [open]);
    
    const handleNext = () => setState(s => ({ ...s, step: s.step + 1 }));
    const handleBack = () => setState(s => ({ ...s, step: s.step - 1 }));

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const selectedFile = files[0];
            setState(s => ({ ...s, file: selectedFile, sheets: [], mappings: {} }));

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const ws = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
                const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                const sheetData = { name: sheetName, headers, data: jsonData };
                
                // Auto-map based on template headers
                const newMappings: Record<string, MappedObligationField> = {};
                headers.forEach(h => {
                    const lower_h = h.toLowerCase();
                    if (lower_h.includes('program')) newMappings[h] = 'program';
                    else if (lower_h.includes('type') || lower_h.includes('tipo') || lower_h.includes('name') || lower_h.includes('nombre')) newMappings[h] = 'obligationType';
                    else if (lower_h.includes('date') || lower_h.includes('fecha')) newMappings[h] = 'submissionDate';
                    else if (lower_h.includes('status') || lower_h.includes('estado')) newMappings[h] = 'status';
                    else if (lower_h.includes('frequency') || lower_h.includes('frecuencia')) newMappings[h] = 'frequency';
                });

                setState(s => ({ ...s, sheets: [sheetData], mappings: newMappings, step: 2 }));
            };
            reader.readAsBinaryString(selectedFile);
        }
    };

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            {
                Program: "IMMEX",
                Type: "Annual Report",
                Date: "2024-12-31",
                Status: "compliant",
                Frequency: "annual"
            }
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Obligations");
        XLSX.writeFile(workbook, "obligations_template.xlsx");
    };
    
    const { processedData, validationErrors } = useMemo(() => {
        if (state.step < 3) return { processedData: [], validationErrors: [] };

        const data: Omit<ComplianceObligation, 'id'>[] = [];
        const errors: string[] = [];
        const sheet = state.sheets[0];
        
        if (sheet) {
            sheet.data.forEach((row, rowIndex) => {
                const obligation: Partial<Omit<ComplianceObligation, 'id'>> = {};
                Object.entries(state.mappings).forEach(([header, field]) => {
                    if (field !== 'ignore' && row[header] !== undefined) {
                       (obligation as any)[field] = row[header];
                    }
                });

                // Validation
                if (!obligation.obligationType) {
                    errors.push(t('obligation_import_modal.validate.missing_type', { row: rowIndex + 2 }));
                }
                const dateStr = String(obligation.submissionDate);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                     errors.push(t('obligation_import_modal.validate.invalid_date', { row: rowIndex + 2 }));
                     obligation.submissionDate = todayISO();
                }
                 if (obligation.status && !['compliant', 'non-compliant'].includes(obligation.status)) {
                    errors.push(t('obligation_import_modal.validate.invalid_status', { row: rowIndex + 2 }));
                    obligation.status = 'compliant';
                }
                
                if (obligation) {
                    data.push({
                        program: obligation.program || 'General',
                        obligationType: obligation.obligationType || '',
                        submissionDate: obligation.submissionDate || todayISO(),
                        status: obligation.status || 'compliant',
                        frequency: obligation.frequency || 'other'
                    });
                }
            });
        }
        return { processedData: data, validationErrors: errors };
    }, [state.step, state.sheets, state.mappings, t]);


    if (!open) return null;
    
    const canAdvance = state.step === 1 ? state.file : state.step === 2 ? true : validationErrors.length === 0;

    const renderContent = () => {
        switch (state.step) {
            case 1:
                return (
                     <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">{t('obligation_import_modal.upload.title')}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6">{t('obligation_import_modal.upload.subtitle')}</p>
                        <div 
                            className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                            onClick={() => document.getElementById('obligation-file-upload')?.click()}
                            onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <input type="file" id="obligation-file-upload" className="hidden" onChange={e => handleFileChange(e.target.files)} accept=".xlsx" />
                            <UploadCloud className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
                            {state.file ? (
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{t('import_wizard.upload.file_selected', { fileName: state.file.name })}</p>
                            ) : (
                                <p className="font-semibold text-zinc-700 dark:text-zinc-200">Click or drag file here</p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-center">
                            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm text-left inline-flex items-center gap-3">
                                <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <button onClick={handleDownloadTemplate} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">{t('obligation_import_modal.upload.download_template')}</button>
                                    <p className="text-zinc-500 dark:text-zinc-400">{t('obligation_import_modal.upload.template_note')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                const MAPPING_OPTIONS = [
                    { label: t('obligation_import_modal.map.fields.ignore'), value: 'ignore' },
                    { label: t('obligation_import_modal.map.fields.program'), value: 'program' },
                    { label: t('obligation_import_modal.map.fields.obligationType'), value: 'obligationType' },
                    { label: t('obligation_import_modal.map.fields.submissionDate'), value: 'submissionDate' },
                    { label: t('obligation_import_modal.map.fields.status'), value: 'status' },
                    { label: t('obligation_import_modal.map.fields.frequency'), value: 'frequency' },
                ];
                 const sheet = state.sheets[0];
                 return (
                     <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">{t('obligation_import_modal.map.title')}</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">{t('obligation_import_modal.map.subtitle')}</p>
                        </div>
                         <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div className="font-bold text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-2">{t('import_wizard.map.column_in_excel')}</div>
                                <div className="font-bold text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700 pb-2">{t('import_wizard.map.field_in_app')}</div>
                                {sheet.headers.map(header => (
                                    <React.Fragment key={header}>
                                        <div className="flex items-center text-sm">{header}</div>
                                        <div>
                                            <select
                                                className="w-full bg-white dark:bg-zinc-800 text-sm rounded-md px-2 py-1.5 border border-zinc-300 dark:border-zinc-600 focus:ring-emerald-500 focus:border-emerald-500"
                                                value={state.mappings[header] || 'ignore'}
                                                onChange={e => setState(s => ({...s, mappings: {...s.mappings, [header]: e.target.value as MappedObligationField}}))}
                                            >
                                                {MAPPING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                 );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">{t('obligation_import_modal.validate.title')}</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">{t('obligation_import_modal.validate.subtitle')}</p>
                        </div>
                        {validationErrors.length > 0 && (
                            <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/50 rounded-lg p-4">
                                <h3 className="font-semibold text-rose-800 dark:text-rose-200 mb-2">{t('obligation_import_modal.validate.errors_found')}</h3>
                                <ul className="space-y-1 text-sm text-rose-700 dark:text-rose-300 list-disc list-inside">
                                    {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                        )}
                         <div className="text-center max-w-lg mx-auto bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-6 space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400"/>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{t('obligation_import_modal.summary.title')}</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">{t('obligation_import_modal.summary.subtitle', { count: processedData.length })}</p>
                        </div>
                    </div>
                );
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 flex flex-col max-h-[90vh]">
                 <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{t('obligation_import_modal.title')}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200" title={t('general.close')}><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center flex-shrink-0">
                    <Button variant="ghost" onClick={handleBack} disabled={state.step === 1}>{t('import_wizard.back')}</Button>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={onClose}>{t('general.cancel')}</Button>
                         {state.step < 3 && <Button onClick={handleNext} disabled={!canAdvance}>{t('import_wizard.next')}</Button>}
                         {state.step === 3 && <Button onClick={() => onComplete(processedData)} disabled={!canAdvance}>{t('obligation_import_modal.finish')}</Button>}
                    </div>
                </div>
            </div>
        </div>
    )

};

export default ObligationImportModal;
