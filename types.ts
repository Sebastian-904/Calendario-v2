
export type Role = "admin" | "consultor" | "cliente_admin" | "cliente_miembro";
export type Theme = "light" | "dark";

export interface Company {
  id: string;
  name: string;
  country: string;
  rfc: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
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
  id: string;
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
}