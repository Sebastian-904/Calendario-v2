
import type { Company, User, CalendarEvent, Categories, Template } from '../types';
import { todayISO, addDaysISO } from '../utils/helpers';

// Predefined Avatars (Netflix-style)
export const predefinedAvatars: string[] = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlNTc0NjUiLz48cGF0aCBkPSJNNjIgMzVINThMNTAgNTFINDBMNzIgNjVWOThINzZWNjdMNzIgNjVWOThINzZWNjdMODIgODBWNTlMNjIgMzVaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM0MThjYzkiLz48cGF0aCBkPSJNMzYgMzBIMzJMMjIgNDJWMzBIMThWMzRMMzAgNDZWMzBIMzRWNDhMMjIgNjBWMzBIMThWNzBIMjJWNjZMMzQgNTRWMzBIMzRWMzRIMzJWMzBIMzZWMzRIMzRWMzBIMzZWMzRaTTUwIDQ1WDU0VjQxTDY0IDUxVjU1TDYwIDUzVjQxSDU2VjQ1SDUwVjQxSDQ2VjU5SDUwVjQ1Wk03OCA3MEg4MlY1OFY3MEg4NlY1NFY0MUw2NiA2MVY3MEg3MFY2N0w3OCA1OVY3MFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMxOGFkOWUiLz48cGF0aCBkPSJNMzYgMzBIMzJMMjIgNDJWMzBIMThWMzRMMzAgNDZWMzBIMzRWNDhMMjIgNjBWMzBIMThWNzBIMjJWNjZMMzQgNTRWMzBIMzRWMzRIMzJWMzBIMzZWMzRIMzRWMzBIMzZWMzRaTTUwIDQ1WDU0VjQxTDY0IDUxVjU1TDYwIDUzVjQxSDU2VjQ1SDUwVjQxSDQ2VjU5SDUwVjQ1Wk03OCA3MEg4MlY1OFY3MEg4NlY1NFY0MUw2NiA2MVY3MEg3MFY2N0w3OCA1OVY3MFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM2MjM4YWEiLz48cGF0aCBkPSJNNjIgMzVINThMNTAgNTFINDBMNzIgNjVWOThINzZWNjdMNzIgNjVWOThINzZWNjdMODIgODBWNTlMNjIgMzVaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNmNjYxNTQiLz48cGF0aCBkPSJNMzYgMzBIMzJMMjIgNDJWMzBIMThWMzRMMzAgNDZWMzBIMzRWNDhMMjIgNjBWMzBIMThWNzBIMjJWNjZMMzQgNTRWMzBIMzRWMzRIMzJWMzBIMzZWMzRIMzRWMzBIMzZWMzRaTTUwIDQ1WDU0VjQxTDY0IDUxVjU1TDYwIDUzVjQxSDU2VjQ1SDUwVjQxSDQ2VjU5SDUwVjQ1Wk03OCA3MEg4MlY1OFY3MEg4NlY1NFY0MUw2NiA2MVY3MEg3MFY2N0w3OCA1OVY3MFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMwMDhiYWUiLz48cGF0aCBkPSJNNjIgMzVINThMNTAgNTFINDBMNzIgNjVWOThINzZWNjdMNzIgNjVWOThINzZWNjdMODIgODBWNTlMNjIgMzVaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
];


export const mockLoginUsers: User[] = [
    { id: "u0", name: "Default Admin", email: "admin@compliance.pro", role: "admin", password: "password-admin", avatarUrl: predefinedAvatars[0] },
    { id: "u1", name: "Default Consultant", email: "consultor@firma.com", role: "consultor", password: "password-consultor", avatarUrl: predefinedAvatars[1] },
    { id: "u2", name: "Default Client Admin", email: "juan@acme.com", role: "cliente_admin", password: "password-client-admin", avatarUrl: predefinedAvatars[2] },
    { id: "u3", name: "Default Client Member", email: "maria@acme.com", role: "cliente_miembro", password: "password-client-member", avatarUrl: predefinedAvatars[3] },
];

export const seedCompanies: Company[] = [
  { 
    id: "c1", 
    name: "My First Company", 
    country: "MX", 
    rfc: "ABC123456789",
    logoUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlZDg5MDYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjEyIDIgMTUuMDkgOC4yNiAyMiA5LjI3IDE3IDE0LjE0IDE4LjE4IDIxLjAyIDEyIDE3Ljc3IDUuODIgMjEuMDIgNyAxNC4xNCAyIDkuMjcgOC45MSA4LjI2IDEyIDIiPjwvcG9seWdvbj48L3N2Zz4=",
    legalName: "My First Company S.A. de C.V.",
    economicActivity: "Manufacturing and Export of Automotive Parts",
    taxAddress: "123 Innovation Dr, Tech Park, Monterrey, NL 64000",
    phone: "+52 81 8000 1234",
    incorporationDetails: { deedNumber: '58432', date: '2010-05-20', notary: 'Lic. Ana Torres' },
    legalRepresentative: { deedNumber: '59110', date: '2015-11-01', notary: 'Lic. Ana Torres' },
    immex: { registrationNumber: '12345-MX', modality: 'Industrial', authorizationDate: '2010-06-15' },
    boardMembers: [
      { id: 'bm1', personType: 'physical', name: 'Juan Perez', rfc: 'PEPJ800101ABC', role: 'legal_rep', nationality: 'Mexican', taxObligationInMX: true }
    ],
    operatingAddresses: [],
    customsAgentAssignments: [],
    complianceObligations: [],
    legalNameChanges: [],
  },
  { 
    id: "c2", 
    name: "Another Client Inc.", 
    country: "US", 
    rfc: "XYZ987654321",
    boardMembers: [],
    operatingAddresses: [],
    customsAgentAssignments: [],
    complianceObligations: [],
    legalNameChanges: [],
  },
];

export const seedUsers: Record<string, User[]> = {
    c1: [
    { id: "u1", name: "Default Consultant", email: "consultor@firma.com", role: "consultor", avatarUrl: predefinedAvatars[1] },
    { id: "u2", name: "Default Client Admin", email: "juan@acme.com", role: "cliente_admin", avatarUrl: predefinedAvatars[2] },
    { id: "u3", name: "Default Client Member", email: "maria@acme.com", role: "cliente_miembro", avatarUrl: predefinedAvatars[3] },
  ],
  c2: [
    { id: "u1", name: "Default Consultant", email: "consultor@firma.com", role: "consultor", avatarUrl: predefinedAvatars[1] },
    { id: "u4", name: "Secondary Client Admin", email: "carlos@globalfoods.com", role: "cliente_admin", avatarUrl: predefinedAvatars[4] },
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
