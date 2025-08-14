
import React from 'react';
import { Calendar as CalIcon, Plus, Download } from 'lucide-react';
import type { CalendarEvent, User, Categories, Company, AppPermissions } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import SimpleMonthCalendar from '../calendar/SimpleMonthCalendar';
import { classNames, todayISO } from '../../utils/helpers';
import { exportReportPDF } from '../../services/pdfService';

interface CalendarViewProps {
  events: CalendarEvent[];
  users: User[];
  categories: Categories;
  company: Company;
  onNewEvent: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onOpenTemplates: () => void;
  permissions: AppPermissions;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, users, categories, company, onNewEvent, onEventClick, onOpenTemplates, permissions }) => {
  const handleExport = () => {
    if(company){
      exportReportPDF({ company, events, users, title: 'Calendar Report' });
    }
  };
  
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={CalIcon}
        right={
          <div className="flex items-center gap-2">
            {permissions.canCreateEvents && (
              <Button title="New Task/Event" variant="outline" onClick={() => onNewEvent(todayISO())}>
                <Plus className="w-4 h-4 mr-2" />New
              </Button>
            )}
            <Button title="Export Calendar to PDF" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />Export PDF
            </Button>
            {permissions.canManageTemplates && (
              <Button title="Templates & Categories" variant="ghost" onClick={onOpenTemplates}>
                Templates & Categories
              </Button>
            )}
          </div>
        }
      >
        Calendar (Current Month)
      </SectionTitle>
      
      <SimpleMonthCalendar events={events} onNew={onNewEvent} onEventClick={onEventClick} categories={categories} />

      <Card>
        <CardContent>
          <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-3">Categories</h4>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {Object.entries(categories).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2.5 py-1 text-zinc-700 dark:text-zinc-300">
                <span className={classNames("w-2 h-2 rounded-full", v.dot)}></span>
                {v.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;