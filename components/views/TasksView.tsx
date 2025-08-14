import React from 'react';
import { ClipboardList, Plus, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import type { CalendarEvent, User, Categories, AppPermissions } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import Badge from '../shared/Badge';
import { fmtDate } from '../../utils/helpers';
import { useTranslation } from '../../hooks/useTranslation';

interface TasksViewProps {
  events: CalendarEvent[];
  users: User[];
  categories: Categories;
  onNewEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  onRemoveEvent: (id: string) => void;
  onOpenTemplates: () => void;
  permissions: AppPermissions;
}

const TasksView: React.FC<TasksViewProps> = ({ events, users, categories, onNewEvent, onEditEvent, onUpdateEvent, onRemoveEvent, onOpenTemplates, permissions }) => {
  const { t, language } = useTranslation();
  const locale = language === 'es' ? 'es-MX' : 'en-US';

  const getPriorityBadgeColor = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30';
      case 'Low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30';
    }
  };

  const getStatusBadgeColor = (status: 'Pending' | 'In Progress' | 'Completed') => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border border-green-200 dark:border-green-500/30';
      case 'In Progress': return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30';
      case 'Pending': return 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600/50';
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={ClipboardList}
        right={
          <div className="flex items-center gap-2">
            {permissions.canCreateEvents && <Button title={t('tasks_view.new_task')} onClick={onNewEvent}><Plus className="w-4 h-4 mr-2" />{t('tasks_view.new_task')}</Button>}
            {permissions.canManageTemplates && <Button title={t('calendar_view.templates_and_categories')} variant="ghost" onClick={onOpenTemplates}>{t('calendar_view.templates_and_categories')}</Button>}
          </div>
        }
      >
        {t('tasks_view.title')}
      </SectionTitle>
      <Card className="overflow-x-auto">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t('general.title')}</th>
                <th className="px-4 py-3 font-medium">{t('general.date')}</th>
                <th className="px-4 py-3 font-medium">{t('general.category')}</th>
                <th className="px-4 py-3 font-medium">{t('general.priority')}</th>
                <th className="px-4 py-3 font-medium">{t('event_modal.assignee')}</th>
                <th className="px-4 py-3 font-medium">{t('general.status')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('general.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((e) => {
                const u = users.find((x) => x.id === e.assignee);
                return (
                  <tr key={e.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-800 dark:text-zinc-100 font-medium">{e.title}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{fmtDate(e.date, locale)}</td>
                    <td className="px-4 py-3"><Badge colorClass="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{categories[e.category]?.label || e.category}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge colorClass={getPriorityBadgeColor(e.priority)}>
                        {t(`priorities.${e.priority}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{u?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge colorClass={getStatusBadgeColor(e.status)}>{t(`statuses.${e.status}`)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {e.status !== 'Completed' && (
                          <Button title={t('tasks_view.mark_completed')} size="sm" variant="outline" onClick={() => onUpdateEvent(e.id, { status: 'Completed' })}>
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        {permissions.canEditEvents && (
                            <Button title={t('general.edit')} size="sm" variant="ghost" onClick={() => onEditEvent(e)}><Edit className="w-4 h-4"/></Button>
                        )}
                        {permissions.canDeleteEvents && (
                            <Button title={t('general.delete')} size="sm" variant="ghost" className="text-zinc-500 hover:bg-rose-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-900/40 dark:hover:text-rose-300" onClick={() => onRemoveEvent(e.id)}><Trash2 className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksView;
