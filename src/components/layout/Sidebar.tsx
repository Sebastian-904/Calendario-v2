import React from 'react';
import { Building, Building2, Users, Calendar as CalIcon, ClipboardList, FileText, Settings, UserPlus, Edit, Trash2 } from 'lucide-react';
import type { Company, User, AppPermissions } from '../../types.ts';
import { Card, CardContent } from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import SectionTitle from '../shared/SectionTitle.tsx';
import NavItem from '../shared/NavItem.tsx';
import Badge from '../shared/Badge.tsx';
import { useTranslation } from '../../hooks/useTranslation.tsx';
import Avatar from '../shared/Avatar.tsx';

interface SidebarProps {
  companies: Company[];
  companyId: string;
  setCompanyId: (id: string) => void;
  company: Company;
  tab: string;
  setTab: (tab: string) => void;
  users: User[];
  onNewCompany: () => void;
  onEditCompany: () => void;
  onNewUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  permissions: AppPermissions;
}

const Sidebar: React.FC<SidebarProps> = ({
  companies, companyId, setCompanyId, company, tab, setTab, users, 
  onNewCompany, onEditCompany, onNewUser, onEditUser, onDeleteUser, permissions
}) => {
  const { t } = useTranslation();
  return (
    <aside className="col-span-12 lg:col-span-3 space-y-6">
      <Card>
        <CardContent className="space-y-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('general.company')}</div>
          <div className="flex items-center gap-2" data-tour-id="company-selector">
            {company.logoUrl ? (
                <img src={company.logoUrl} alt={`${company.name} logo`} className="w-6 h-6 rounded-md object-contain" />
            ) : (
                <Building2 className="w-6 h-6 text-zinc-600 dark:text-zinc-300 flex-shrink-0 p-0.5" />
            )}
            <select
              title={t('sidebar.select_company')}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="flex-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={!permissions.canManageCompanies}
            >
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 pl-8">{t('sidebar.tax_id', { rfc: company?.rfc || "N/A" })}</div>
          {permissions.canManageCompanies && (
            <div className="flex gap-2 mt-3 pl-8">
              <Button title={t('settings_view.add_company')} size="sm" variant="outline" onClick={onNewCompany}>{t('general.new')}</Button>
              <Button title={t('settings_view.edit_current')} size="sm" variant="ghost" onClick={onEditCompany} disabled={!companyId}>{t('general.edit')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-tour-id="main-nav">
        <CardContent className="p-0">
          <nav className="flex flex-col">
            <NavItem icon={CalIcon} label={t('sidebar.nav_calendar')} active={tab === 'calendar'} onClick={() => setTab('calendar')} />
            <NavItem icon={ClipboardList} label={t('sidebar.nav_tasks')} active={tab === 'tasks'} onClick={() => setTab('tasks')} />
            <NavItem icon={Building} label={t('sidebar.nav_company_info')} active={tab === 'company-info'} onClick={() => setTab('company-info')} />
            {permissions.canAccessReports && <NavItem icon={FileText} label={t('sidebar.nav_reports')} active={tab === 'reports'} onClick={() => setTab('reports')} />}
            {permissions.canAccessSettings && <NavItem icon={Settings} label={t('sidebar.nav_settings')} active={tab === 'settings'} onClick={() => setTab('settings')} />}
          </nav>
        </CardContent>
      </Card>

      <Card data-tour-id="team-list">
        <CardContent>
          <SectionTitle 
            icon={Users}
            right={permissions.canManageUsers && (
              <Button size="sm" variant="ghost" onClick={onNewUser} title={t('sidebar.add_user')}>
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          >
            {t('general.team')}
          </SectionTitle>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                    <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{u.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                      <div className="mt-1"><Badge>{t(`roles.${u.role}`)}</Badge></div>
                    </div>
                </div>
                {permissions.canManageUsers && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => onEditUser(u)} title={t('sidebar.edit_user')}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400" onClick={() => onDeleteUser(u.id)} title={t('sidebar.delete_user')}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                  </div>
                )}
              </div>
            ))}
             {users.length === 0 && <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 py-4">{t('sidebar.no_users')}</p>}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default Sidebar;