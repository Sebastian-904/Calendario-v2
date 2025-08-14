import type { Company, User, CalendarEvent, Categories, Template } from '../types';
import { todayISO, addDaysISO } from '../utils/helpers';

export const mockLoginUsers: User[] = [
    { id: "u0", name: "Default Admin", email: "admin@compliance.pro", role: "admin", password: "password-admin" },
    { id: "u1", name: "Default Consultant", email: "consultor@firma.com", role: "consultor", password: "password-consultor" },
    { id: "u2", name: "Default Client Admin", email: "juan@acme.com", role: "cliente_admin", password: "password-client-admin" },
    { id: "u3", name: "Default Client Member", email: "maria@acme.com", role: "cliente_miembro", password: "password-client-member" },
];

export const seedCompanies: Company[] = [
  { id: "c1", name: "My First Company", country: "MX", rfc: "ABC123456789" },
  { id: "c2", name: "Another Client Inc.", country: "US", rfc: "XYZ987654321" },
];

export const seedUsers: Record<string, User[]> = {
    c1: [
    { id: "u1", name: "Default Consultant", email: "consultor@firma.com", role: "consultor" },
    { id: "u2", name: "Default Client Admin", email: "juan@acme.com", role: "cliente_admin" },
    { id: "u3", name: "Default Client Member", email: "maria@acme.com", role: "cliente_miembro" },
  ],
  c2: [
    { id: "u1", name: "Default Consultant", email: "consultor@firma.com", role: "consultor" },
    { id: "u4", name: "Secondary Client Admin", email: "carlos@globalfoods.com", role: "cliente_admin" },
  ],
};

export const DEFAULT_CATEGORY_CONFIG = {
  fiscal: "bg-blue-400",
  customs: "bg-emerald-400",
  certification: "bg-violet-400",
  treaty: "bg-amber-400",
  legal: "bg-rose-400",
};

export const seedEvents: Record<string, CalendarEvent[]> = {
    c1: [
        { id: "e1", title: "Monthly Tax Declaration", date: todayISO(), category: "fiscal", priority: "High", assignee: "u2", status: "Pending" },
        { id: "e2", title: "Monthly Statistics Report", date: addDaysISO(5), category: "customs", priority: "Medium", assignee: "u3", status: "In Progress" },
    ],
    c2: [
        { id: "e4", title: "Quarterly Origin Certificates", date: addDaysISO(14), category: "treaty", priority: "Medium", assignee: "u4", status: "Pending" },
    ],
};

export const seedTemplates: Template[] = [
    { id: 't1', name: 'Monthly VAT Declaration', category: 'fiscal', priority: 'High' }
];
