import React, { useState, useEffect, useRef } from 'react';
import { Building, Save, Briefcase, Users, MapPin, Anchor, CheckSquare, AlertCircle, Trash2, Plus, Upload } from 'lucide-react';
import type { Company, AppPermissions, BoardMember, OperatingAddress, CustomsAgentAssignment, ComplianceObligation } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useTranslation } from '../../hooks/useTranslation';
import { classNames, todayISO } from '../../utils/helpers';
import * as XLSX from 'xlsx';

interface CompanyInfoViewProps {
    company: Company;
    onSave: (updatedCompany: Company) => void;
    permissions: AppPermissions;
}

const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed";
const commonLabelStyles = "block text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium";

interface FormRowProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

const FormRow: React.FC<FormRowProps> = ({ label, children, className }) => (
    <div className={className}>
        <label className={commonLabelStyles}>{label}</label>
        {children}
    </div>
);

// #region List-based Section HOC
type ItemWithId = { id: string };
interface ListSectionProps<T extends ItemWithId> {
    localCompany: Company;
    setLocalCompany: React.Dispatch<React.SetStateAction<Company>>;
    readOnly: boolean;
    t: Function;
    title: string;
    addButtonLabel: string;
    items: T[] | undefined;
    itemKey: keyof Company;
    newItem: T;
    renderItem: (item: T, onChange: (id: string, field: keyof T, value: any) => void, onRemove: (id: string) => void) => React.ReactNode;
    additionalHeader?: React.ReactNode;
}

const ListSection = <T extends ItemWithId>({ title, addButtonLabel, items, itemKey, newItem, renderItem, localCompany, setLocalCompany, readOnly, t, additionalHeader }: ListSectionProps<T>) => {
    const handleAddItem = () => {
        setLocalCompany(prev => ({
            ...prev,
            [itemKey]: [...((prev[itemKey] as unknown as T[]) || []), { ...newItem, id: `${itemKey}-${Date.now()}` }]
        }));
    };

    const handleRemoveItem = (id: string) => {
        setLocalCompany(prev => ({
            ...prev,
            [itemKey]: ((prev[itemKey] as unknown as T[]) || []).filter((item: T) => item.id !== id)
        }));
    };

    const handleItemChange = (id: string, field: keyof T, value: any) => {
        setLocalCompany(prev => ({
            ...prev,
            [itemKey]: ((prev[itemKey] as unknown as T[]) || []).map((item: T) => item.id === id ? { ...item, [field]: value } : item)
        }));
    };
    
    return (
         <Card>
            <CardContent>
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h4 className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">{title}</h4>
                    <div className="flex items-center gap-2">
                        {additionalHeader}
                        {!readOnly && (
                            <Button size="sm" onClick={handleAddItem}><Plus className="w-4 h-4 mr-2"/>{addButtonLabel}</Button>
                        )}
                    </div>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {(items || []).map((item) => renderItem(item, handleItemChange, handleRemoveItem))}
                {(items || []).length === 0 && <p className="text-sm text-center py-4 text-zinc-500">{t('general.no_items')}</p>}
                </div>
            </CardContent>
        </Card>
    );
};
// #endregion

// #region Sub-Components
const GeneralSection: React.FC<{ localCompany: Company, setLocalCompany: React.Dispatch<React.SetStateAction<Company>>, readOnly: boolean, t: Function }> = ({ localCompany, setLocalCompany, readOnly, t }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalCompany(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNestedChange = (section: keyof Company) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalCompany(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [name]: value
            }
        }));
    };

    return (
    <div className="space-y-6">
        <Card>
            <CardContent>
                <h4 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-200">{t('company_info_view.sections.general_info')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label={t('company_info_view.fields.legal_name')}>
                        <input name="legalName" value={localCompany.legalName || ''} onChange={handleInputChange} className={commonInputStyles} disabled={readOnly} />
                    </FormRow>
                    <FormRow label={t('company_info_view.fields.rfc')}>
                        <input name="rfc" value={localCompany.rfc || ''} onChange={handleInputChange} className={commonInputStyles} disabled={readOnly} />
                    </FormRow>
                    <FormRow label={t('company_info_view.fields.economic_activity')} className="md:col-span-2">
                        <textarea name="economicActivity" value={localCompany.economicActivity || ''} onChange={e => handleInputChange(e)} className={commonInputStyles} rows={2} disabled={readOnly}></textarea>
                    </FormRow>
                    <FormRow label={t('company_info_view.fields.tax_address')} className="md:col-span-2">
                        <input name="taxAddress" value={localCompany.taxAddress || ''} onChange={handleInputChange} className={commonInputStyles} disabled={readOnly} />
                    </FormRow>
                     <FormRow label={t('company_info_view.fields.phone')}>
                        <input name="phone" value={localCompany.phone || ''} onChange={handleInputChange} className={commonInputStyles} disabled={readOnly} />
                    </FormRow>
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardContent>
                    <h4 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-200">{t('company_info_view.sections.incorporation_details')}</h4>
                    <div className="space-y-4">
                        <FormRow label={t('company_info_view.fields.deed_number')}>
                           <input name="deedNumber" value={localCompany.incorporationDetails?.deedNumber || ''} onChange={handleNestedChange('incorporationDetails')} className={commonInputStyles} disabled={readOnly} />
                        </FormRow>
                        <FormRow label={t('company_info_view.fields.date')}>
                            <input type="date" name="date" value={localCompany.incorporationDetails?.date || ''} onChange={handleNestedChange('incorporationDetails')} className={commonInputStyles} disabled={readOnly} />
                        </FormRow>
                        <FormRow label={t('company_info_view.fields.notary')}>
                            <input name="notary" value={localCompany.incorporationDetails?.notary || ''} onChange={handleNestedChange('incorporationDetails')} className={commonInputStyles} disabled={readOnly} />
                        </FormRow>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <h4 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-200">{t('company_info_view.sections.legal_rep')}</h4>
                     <div className="space-y-4">
                        <FormRow label={t('company_info_view.fields.deed_number')}>
                           <input name="deedNumber" value={localCompany.legalRepresentative?.deedNumber || ''} onChange={handleNestedChange('legalRepresentative')} className={commonInputStyles} disabled={readOnly} />
                        </FormRow>
                        <FormRow label={t('company_info_view.fields.date')}>
                            <input type="date" name="date" value={localCompany.legalRepresentative?.date || ''} onChange={handleNestedChange('legalRepresentative')} className={commonInputStyles} disabled={readOnly} />
                        </FormRow>
                        <FormRow label={t('company_info_view.fields.notary')}>
                            <input name="notary" value={localCompany.legalRepresentative?.notary || ''} onChange={handleNestedChange('legalRepresentative')} className={commonInputStyles} disabled={readOnly} />
                        </FormRow>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
    );
};

const ProgramsSection: React.FC<{ localCompany: Company, setLocalCompany: React.Dispatch<React.SetStateAction<Company>>, readOnly: boolean, t: Function }> = ({ localCompany, setLocalCompany, readOnly, t }) => {
    const handleNestedChange = (section: keyof Company) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalCompany(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [name]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <h4 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-200">{t('company_info_view.sections.programs_and_regs')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* IMMEX */}
                        <div className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-3">
                            <h5 className="font-semibold text-zinc-700 dark:text-zinc-200">{t('company_info_view.sections.immex')}</h5>
                            <FormRow label={t('company_info_view.fields.registration_number')}><input name="registrationNumber" value={localCompany.immex?.registrationNumber || ''} onChange={handleNestedChange('immex')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.modality')}><input name="modality" value={localCompany.immex?.modality || ''} onChange={handleNestedChange('immex')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.auth_date')}><input type="date" name="authorizationDate" value={localCompany.immex?.authorizationDate || ''} onChange={handleNestedChange('immex')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                        </div>
                        {/* PROSEC */}
                        <div className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-3">
                            <h5 className="font-semibold text-zinc-700 dark:text-zinc-200">{t('company_info_view.sections.prosec')}</h5>
                            <FormRow label={t('company_info_view.fields.registration_number')}><input name="registrationNumber" value={localCompany.prosec?.registrationNumber || ''} onChange={handleNestedChange('prosec')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.modality')}><input name="modality" value={localCompany.prosec?.modality || ''} onChange={handleNestedChange('prosec')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.auth_date')}><input type="date" name="authorizationDate" value={localCompany.prosec?.authorizationDate || ''} onChange={handleNestedChange('prosec')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                        </div>
                        {/* CERTIVA */}
                        <div className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-3">
                            <h5 className="font-semibold text-zinc-700 dark:text-zinc-200">{t('company_info_view.sections.certiva')}</h5>
                            <FormRow label={t('company_info_view.fields.folio')}><input name="folio" value={localCompany.certiva?.folio || ''} onChange={handleNestedChange('certiva')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.category')}><input name="category" value={localCompany.certiva?.category || ''} onChange={handleNestedChange('certiva')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.resolution')}><input name="resolution" value={localCompany.certiva?.resolution || ''} onChange={handleNestedChange('certiva')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                            <FormRow label={t('company_info_view.fields.renewal_date')}><input type="date" name="renewalDate" value={localCompany.certiva?.renewalDate || ''} onChange={handleNestedChange('certiva')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                     <h4 className="font-semibold text-lg mb-4 text-zinc-800 dark:text-zinc-200">{t('company_info_view.sections.importers_reg')}</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormRow label={t('company_info_view.fields.folio')}><input name="folio" value={localCompany.importersRegistry?.folio || ''} onChange={handleNestedChange('importersRegistry')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                        <FormRow label={t('company_info_view.fields.date')}><input type="date" name="date" value={localCompany.importersRegistry?.date || ''} onChange={handleNestedChange('importersRegistry')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                        <FormRow label={t('company_info_view.fields.sector')}><input name="sector" value={localCompany.importersRegistry?.sector || ''} onChange={handleNestedChange('importersRegistry')} className={commonInputStyles} disabled={readOnly} /></FormRow>
                     </div>
                </CardContent>
            </Card>
        </div>
    );
};

const renderBoardMemberItem = (t: Function, readOnly: boolean) => (member: BoardMember, onChange: Function, onRemove: Function) => (
    <div key={member.id} className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <FormRow label={t('company_info_view.fields.full_name')}><input value={member.name} onChange={(e) => onChange(member.id, 'name', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
            <FormRow label={t('company_info_view.fields.rfc')}><input value={member.rfc} onChange={(e) => onChange(member.id, 'rfc', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
            <FormRow label={t('company_info_view.fields.person_type')}>
                <select value={member.personType} onChange={(e) => onChange(member.id, 'personType', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                    <option value="physical">{t('company_info_view.fields.physical')}</option>
                    <option value="moral">{t('company_info_view.fields.moral')}</option>
                </select>
            </FormRow>
            <FormRow label={t('company_info_view.fields.role')}>
                <select value={member.role} onChange={(e) => onChange(member.id, 'role', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                    <option value="partner">{t('company_info_view.fields.partner')}</option>
                    <option value="legal_rep">{t('company_info_view.fields.legal_rep')}</option>
                    <option value="admin">{t('company_info_view.fields.admin')}</option>
                </select>
            </FormRow>
             <FormRow label={t('company_info_view.fields.nationality')}><input value={member.nationality} onChange={(e) => onChange(member.id, 'nationality', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
            <FormRow label={t('company_info_view.fields.tax_in_mx')}>
                <select value={String(member.taxObligationInMX)} onChange={(e) => onChange(member.id, 'taxObligationInMX', e.target.value === 'true')} className={commonInputStyles} disabled={readOnly}>
                    <option value="true">{t('company_info_view.fields.yes')}</option>
                    <option value="false">{t('company_info_view.fields.no')}</option>
                </select>
            </FormRow>
        </div>
         {!readOnly && (
            <div className="flex justify-end">
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400" onClick={() => onRemove(member.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('general.delete')}
                </Button>
            </div>
        )}
    </div>
);

const renderAddressItem = (t: Function, readOnly: boolean) => (item: OperatingAddress, onChange: Function, onRemove: Function) => (
    <div key={item.id} className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <FormRow label={t('company_info_view.fields.street_number')} className="md:col-span-2"><input value={item.street} onChange={(e) => onChange(item.id, 'street', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.postal_code')}><input value={item.postalCode} onChange={(e) => onChange(item.id, 'postalCode', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.neighborhood')}><input value={item.neighborhood} onChange={(e) => onChange(item.id, 'neighborhood', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.municipality')}><input value={item.municipality} onChange={(e) => onChange(item.id, 'municipality', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.city')}><input value={item.city} onChange={(e) => onChange(item.id, 'city', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.state')}><input value={item.state} onChange={(e) => onChange(item.id, 'state', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.phone')}><input value={item.phone} onChange={(e) => onChange(item.id, 'phone', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
             <FormRow label={t('company_info_view.fields.linked_program')}>
                <select value={item.linkedProgram} onChange={(e) => onChange(item.id, 'linkedProgram', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                    <option value="None">{t('company_info_view.fields.none')}</option>
                    <option value="IMMEX">IMMEX</option>
                    <option value="PROSEC">PROSEC</option>
                </select>
            </FormRow>
        </div>
         {!readOnly && (
            <div className="flex justify-end">
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400" onClick={() => onRemove(item.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />{t('general.delete')}
                </Button>
            </div>
        )}
    </div>
);

const renderAgentItem = (t: Function, readOnly: boolean) => (item: CustomsAgentAssignment, onChange: Function, onRemove: Function) => (
     <div key={item.id} className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormRow label={t('company_info_view.fields.agent_name')}><input value={item.agentName} onChange={(e) => onChange(item.id, 'agentName', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
            <FormRow label={t('company_info_view.fields.patent_number')}><input value={item.patentNumber} onChange={(e) => onChange(item.id, 'patentNumber', e.target.value)} className={commonInputStyles} disabled={readOnly} /></FormRow>
            <FormRow label={t('company_info_view.fields.assignment_status')}>
                <select value={item.status} onChange={(e) => onChange(item.id, 'status', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                    <option value="accepted">{t('company_info_view.fields.accepted')}</option>
                    <option value="pending">{t('company_info_view.fields.pending')}</option>
                </select>
            </FormRow>
        </div>
        {!readOnly && (
            <div className="flex justify-end">
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400" onClick={() => onRemove(item.id)}><Trash2 className="w-4 h-4 mr-1" />{t('general.delete')}</Button>
            </div>
        )}
    </div>
);

const ComplianceObligationsSection: React.FC<Omit<ListSectionProps<ComplianceObligation>, 'renderItem' | 'title' | 'addButtonLabel' | 'items' | 'itemKey' | 'newItem'>> = (props) => {
    const { t, localCompany, setLocalCompany, readOnly } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = event.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                    const newObligations = json.map((row: any, index: number) => {
                       const program = row['Program'] || row['Programa'] || 'General';
                       const status = row['Status'] || row['Estado'] || 'compliant';
                       const frequency = row['Frequency'] || row['Frecuencia'] || 'other';

                       return {
                            id: `co-excel-${Date.now()}-${index}`,
                            program: ['IMMEX', 'PROSEC', 'CERTIVA', 'General'].includes(program) ? program : 'General',
                            obligationType: row['Type'] || row['Tipo'] || '',
                            submissionDate: row['Date'] || row['Fecha'] || todayISO(),
                            status: ['compliant', 'non-compliant'].includes(status) ? status : 'compliant',
                            frequency: ['monthly', 'annual', 'weekly', 'other'].includes(frequency) ? frequency : 'other',
                       }
                    }).filter(o => o.obligationType);

                    setLocalCompany(prev => ({
                        ...prev,
                        complianceObligations: [...(prev.complianceObligations || []), ...newObligations]
                    }));
                };
                reader.readAsBinaryString(file);
            } catch (error) {
                console.error("Error parsing Excel file:", error);
            }
        }
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const renderItem = (item: ComplianceObligation, onChange: Function, onRemove: Function) => (
        <div key={item.id} className="bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormRow label={t('company_info_view.fields.obligation_type')} className="md:col-span-2">
                    <input value={item.obligationType} onChange={(e) => onChange(item.id, 'obligationType', e.target.value)} className={commonInputStyles} disabled={readOnly} />
                </FormRow>
                 <FormRow label={t('company_info_view.fields.program')}>
                    <select value={item.program} onChange={(e) => onChange(item.id, 'program', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                        <option value="General">General</option><option value="IMMEX">IMMEX</option><option value="PROSEC">PROSEC</option><option value="CERTIVA">CERTIVA</option>
                    </select>
                </FormRow>
                 <FormRow label={t('company_info_view.fields.submission_date')}>
                    <input type="date" value={item.submissionDate} onChange={(e) => onChange(item.id, 'submissionDate', e.target.value)} className={commonInputStyles} disabled={readOnly} />
                </FormRow>
                 <FormRow label={t('general.status')}>
                    <select value={item.status} onChange={(e) => onChange(item.id, 'status', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                        <option value="compliant">{t('company_info_view.fields.compliant')}</option>
                        <option value="non-compliant">{t('company_info_view.fields.non_compliant')}</option>
                    </select>
                </FormRow>
                 <FormRow label={t('company_info_view.fields.frequency')}>
                    <select value={item.frequency} onChange={(e) => onChange(item.id, 'frequency', e.target.value)} className={commonInputStyles} disabled={readOnly}>
                        <option value="monthly">{t('company_info_view.fields.monthly')}</option><option value="annual">{t('company_info_view.fields.annual')}</option><option value="weekly">{t('company_info_view.fields.weekly')}</option><option value="other">{t('company_info_view.fields.other')}</option>
                    </select>
                </FormRow>
            </div>
            {!readOnly && (
                <div className="flex justify-end"><Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400" onClick={() => onRemove(item.id)}><Trash2 className="w-4 h-4 mr-1" />{t('general.delete')}</Button></div>
            )}
        </div>
    );
    
    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
            <ListSection
                {...props}
                title={t('company_info_view.sections.compliance_obligations')}
                addButtonLabel={t('company_info_view.fields.add_obligation')}
                items={localCompany.complianceObligations}
                itemKey="complianceObligations"
                newItem={{ id: '', program: 'General', obligationType: '', submissionDate: todayISO(), status: 'compliant', frequency: 'annual' }}
                renderItem={renderItem}
                additionalHeader={!readOnly && (
                    <>
                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" /> {t('company_info_view.fields.upload_excel')}
                        </Button>
                        <p className="text-xs text-zinc-500 max-w-xs">{t('company_info_view.fields.excel_instructions')}</p>
                    </>
                )}
            />
        </>
    );
}

// #endregion

const CompanyInfoView: React.FC<CompanyInfoViewProps> = ({ company, onSave, permissions }) => {
    const { t } = useTranslation();
    const [localCompany, setLocalCompany] = useState<Company>(company);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        setLocalCompany(company);
    }, [company]);

    const handleSave = () => {
        onSave(localCompany);
    };

    const isReadOnly = !permissions.canManageCompanyInfo;

    const TABS = [
        { id: 'general', label: t('company_info_view.tabs.general'), icon: Building },
        { id: 'programs', label: t('company_info_view.tabs.programs'), icon: Briefcase },
        { id: 'members', label: t('company_info_view.tabs.members'), icon: Users },
        { id: 'addresses', label: t('company_info_view.tabs.addresses'), icon: MapPin },
        { id: 'agents', label: t('company_info_view.tabs.agents'), icon: Anchor },
        { id: 'obligations', label: t('company_info_view.tabs.obligations'), icon: CheckSquare },
    ];
    
    const renderContent = () => {
        const listSectionProps = { localCompany, setLocalCompany, readOnly: isReadOnly, t };
        switch (activeTab) {
            case 'general': return <GeneralSection localCompany={localCompany} setLocalCompany={setLocalCompany} readOnly={isReadOnly} t={t} />;
            case 'programs': return <ProgramsSection localCompany={localCompany} setLocalCompany={setLocalCompany} readOnly={isReadOnly} t={t} />;
            case 'members': return <ListSection {...listSectionProps} title={t('company_info_view.sections.board_members')} addButtonLabel={t('company_info_view.fields.add_member')} items={localCompany.boardMembers} itemKey="boardMembers" newItem={{id: '', personType: 'physical', name: '', rfc: '', role: 'partner', nationality: '', taxObligationInMX: true}} renderItem={renderBoardMemberItem(t, isReadOnly)} />;
            case 'addresses': return <ListSection {...listSectionProps} title={t('company_info_view.sections.operating_addresses')} addButtonLabel={t('company_info_view.fields.add_address')} items={localCompany.operatingAddresses} itemKey="operatingAddresses" newItem={{ id: '', postalCode: '', street: '', phone: '', neighborhood: '', state: '', city: '', municipality: '', linkedProgram: 'None' }} renderItem={renderAddressItem(t, isReadOnly)} />;
            case 'agents': return <ListSection {...listSectionProps} title={t('company_info_view.sections.customs_agent_assignments')} addButtonLabel={t('company_info_view.fields.add_agent')} items={localCompany.customsAgentAssignments} itemKey="customsAgentAssignments" newItem={{ id: '', patentNumber: '', agentName: '', status: 'pending' }} renderItem={renderAgentItem(t, isReadOnly)} />;
            case 'obligations': return <ComplianceObligationsSection {...listSectionProps} />;
            default: return <div className="text-center p-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg">{activeTab}</div>;
        }
    };
    
    return (
        <div className="space-y-6">
            <SectionTitle
                icon={Building}
                right={
                    <div className="flex items-center gap-2">
                        {isReadOnly && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {t('company_info_view.read_only_note')}
                            </div>
                        )}
                        {!isReadOnly && (
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                {t('company_info_view.save_changes')}
                            </Button>
                        )}
                    </div>
                }
            >
                {t('company_info_view.title')}
            </SectionTitle>

            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={classNames(
                                activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:border-zinc-600',
                                'whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2'
                            )}
                        >
                           <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default CompanyInfoView;