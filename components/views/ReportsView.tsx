
import React, { useMemo } from 'react';
import { FileText, Download, DownloadCloud } from 'lucide-react';
import type { CalendarEvent, User, Categories, Company, AppPermissions } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { classNames, fmtDate } from '../../utils/helpers';
import { exportReportPDF } from '../../services/pdfService';
import { mockLoginUsers } from '../../data/seedData';

interface ReportsViewProps {
  events: CalendarEvent[];
  users: User[];
  categories: Categories;
  company: Company;
  companies: Company[];
  allUsers: Record<string, User[]>;
  onOpenTemplates: () => void;
  permissions: AppPermissions;
}

const ReportsView: React.FC<ReportsViewProps> = ({ events, users, categories, company, companies, allUsers, onOpenTemplates, permissions }) => {

  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    events.forEach((e) => { m[e.category] = (m[e.category] || 0) + 1; });
    return m;
  }, [events]);

  const criticalSoon = useMemo(() => {
    const now = new Date();
    const within = (d: string) => (new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return events
      .filter((e) => e.status !== 'Completed' && within(e.date) >= -1 && within(e.date) <= 7)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const handleExportAllAccess = () => {
    const loginUsersMap = new Map(mockLoginUsers.map(u => [u.id, u]));
    let csvContent = "Company Name,User Name,User Email,User Role,Password\n";

    companies.forEach(comp => {
        const companyUsers = allUsers[comp.id] || [];
        companyUsers.forEach(user => {
            const loginDetails = loginUsersMap.get(user.id);
            const password = loginDetails ? loginDetails.password : 'N/A';
            
            const companyName = `"${comp.name.replace(/"/g, '""')}"`;
            const userName = `"${user.name.replace(/"/g, '""')}"`;

            const row = [
                companyName,
                userName,
                user.email,
                user.role.split('_').join(' '),
                password
            ].join(',');
            
            csvContent += row + "\n";
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "all_user_access_credentials.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-4">
      <SectionTitle icon={FileText} right={permissions.canManageTemplates && <Button title="Templates & Categories" variant="ghost" onClick={onOpenTemplates}>Templates & Categories</Button>}>
        Reports
      </SectionTitle>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Generate Reports</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Generate reports ready for printing or emailing.</p>
          <div className="flex flex-wrap gap-2">
            <Button title="Export Monthly Report (PDF)" onClick={() => exportReportPDF({ company, events, users, title: 'Monthly Compliance Report' })}>
              <Download className="w-4 h-4 mr-2" />Monthly Report (PDF)
            </Button>
            <Button title="Export Pending Tasks (PDF)" variant="outline" onClick={() => exportReportPDF({ company, events: events.filter(e => e.status !== 'Completed'), users, title: 'Pending Tasks Report' })}>
              <Download className="w-4 h-4 mr-2" />Pending Tasks (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {permissions.canManageCompanies && (
        <Card>
            <CardContent className="space-y-4">
                <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Admin Actions</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">Export sensitive information for all companies.</p>
                 <div className="flex flex-wrap gap-2">
                    <Button title="Download a CSV with all user credentials" variant="outline" onClick={handleExportAllAccess} className="border-amber-500/50 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                      <DownloadCloud className="w-4 h-4 mr-2" />Download All Access
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h4 className="text-zinc-800 dark:text-zinc-200 font-medium mb-3">Distribution by Category</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byCategory).map(([k, v]) => (
                <div key={k} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm flex items-center gap-2">
                  <span className={classNames("w-2 h-2 rounded-full", categories[k]?.dot || 'bg-zinc-600')}></span>
                  <span className="text-zinc-700 dark:text-zinc-300">{categories[k]?.label || k}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono">({v})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h4 className="text-zinc-800 dark:text-zinc-200 font-medium mb-3">Critical Tasks (≤7 days)</h4>
            <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
              {criticalSoon.length === 0 && <li className="text-zinc-500 dark:text-zinc-400 italic">No upcoming critical items.</li>}
              {criticalSoon.map((e) => (
                <li key={e.id} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                  <span className="truncate pr-4 text-zinc-700 dark:text-zinc-200">{e.title}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex-shrink-0">{fmtDate(e.date)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsView;