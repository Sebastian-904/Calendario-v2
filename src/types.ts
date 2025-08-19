export type Role = "admin" | "consultor" | "cliente_admin" | "cliente_miembro";
export type Theme = "light" | "dark";
export type TimeFormat = '12h' | '24h';

export interface IncorporationDetails {
  deedNumber: string;
  date: string; 
  notary: string;
}

export interface LegalRepresentative {
  deedNumber: string;
  date: string; 
  notary: string;
}

export interface ProgramRegistration {
  registrationNumber: string;
  modality: string;
  authorizationDate: string;
}

export interface CertivaRegistration {
  folio: string;
  category: string;
  resolution: string;
  renewalDate: string;
}

export interface BoardMember {
  id: string;
  personType: 'physical' | 'moral';
  name: string;
  rfc: string;
  role: 'partner' | 'legal_rep' | 'admin';
  nationality: string;
  taxObligationInMX: boolean;
  representedCompany?: string;
}

export interface OperatingAddress {
  id:string;
  postalCode: string;
  street: string;
  phone: string;
  neighborhood: string;
  state: string;
  city: string;
  municipality: string;
  linkedProgram: 'IMMEX' | 'PROSEC' | 'None';
}

export interface CustomsAgentAssignment {
  id: string;
  patentNumber: string;
  agentName: string;
  status: 'accepted' | 'pending';
}

export interface ComplianceObligation {
  id: string;
  program: 'IMMEX' | 'PROSEC' | 'CERTIVA' | 'General';
  obligationType: string;
  submissionDate: string; // YYYY-MM-DD
  status: 'compliant' | 'non-compliant';
  frequency: 'monthly' | 'annual' | 'weekly' | 'other';
}

export interface Company {
  id: string;
  name: string; // This is the commercial name
  country: string;
  rfc: string | null;
  logoUrl?: string;

  // New detailed fields
  legalName?: string;
  economicActivity?: string;
  taxAddress?: string;
  phone?: string;
  incorporationDetails?: IncorporationDetails;
  legalNameChanges?: IncorporationDetails[];
  legalRepresentative?: LegalRepresentative;

  immex?: ProgramRegistration;
  prosec?: ProgramRegistration;
  certiva?: CertivaRegistration;
  importersRegistry?: {
    folio: string;
    date: string;
    sector: string;
  };

  boardMembers?: BoardMember[];
  operatingAddresses?: OperatingAddress[];
  customsAgentAssignments?: CustomsAgentAssignment[];
  complianceObligations?: ComplianceObligation[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  avatarUrl?: string;
}

export interface Category {
  label: string;
  dot: string;
}

export type Categories = Record<string, Category>;

export interface Template {
  id: string;
  name: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Attachment {
    name: string;
    size: number; // in bytes
    type: string; // MIME type
    url: string; // a data URL or a server URL
}

export interface CalendarEvent {
  id:string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string; // user id
  status: 'Pending' | 'In Progress' | 'Completed';
  attachments?: Attachment[];
}

export interface AppPermissions {
    canManageCompanies: boolean;
    canManageTemplates: boolean;
    canManageUsers: boolean;
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canAccessSettings: boolean;
    canAccessReports: boolean;
    canUploadFiles: boolean;
    canManageCompanyInfo: boolean;
}

// Types for Excel Import Wizard
export interface SheetData {
    name: string;
    headers: string[];
    data: Record<string, any>[];
}

export type MappedField = keyof Company | keyof User | keyof CalendarEvent | 'company_name' | 'company_rfc' | 'user_name' | 'user_email' | 'user_role' | 'task_title' | 'task_date' | 'task_category' | 'task_priority' | 'task_assignee_email' | 'task_status' | 'ignore';
export type MappedObligationField = keyof ComplianceObligation | 'ignore';


export type FieldMapping = Record<string, MappedField>; // { [excel_header]: application_field }

export interface ImportWizardState {
    step: number; // 0: closed, 1: upload, 2: map, 3: validate, 4: summary
    file: File | null;
    sheets: SheetData[];
    mappings: Record<string, FieldMapping>; // { [sheet_name]: FieldMapping }
    show: boolean;
}