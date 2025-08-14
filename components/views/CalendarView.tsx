import React from 'react';
import { Calendar as CalIcon, Plus, Download } from 'lucide-react';
import type { CalendarEvent, User, Categories, Company, AppPermissions } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import SimpleMonthCalendar from '../calendar/SimpleMonthCalendar';
import { classNames, todayISO } from '../../utils/helpers';
import { exportReportPDF, PdfTranslations } from '../../services/pdfService';
import { useTranslation } from '../../hooks/useTranslation';

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
  const { t, language } = useTranslation();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  
  const handleExport = () => {
    if(company){
       const translations: PdfTranslations = {
        companyLabel: t('reports_view.pdf.company_label'),
        taxIdLabel: t('reports_view.pdf.tax_id_label'),
        generatedLabel: t('reports_view.pdf.generated_label'),
        tasksLabel: t('reports_view.pdf.tasks_label'),
        responsibleLabel: t('reports_view.pdf.responsible_label'),
        statusLabel: t('reports_view.pdf.status_label'),
      };
      exportReportPDF({ company, events, users, title: t('reports_view.pdf.calendar_report_title'), translations, locale });
    }
  };
  
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={CalIcon}
        right={
          <div className="flex items-center gap-2">
            {permissions.canCreateEvents && (
              <Button title={t('calendar_view.new_event')} variant="outline" onClick={() => onNewEvent(todayISO())}>
                <Plus className="w-4 h-4 mr-2" />{t('general.new')}
              </Button>
            )}
            <Button title={t('calendar_view.export_pdf')} onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />{t('calendar_view.export_pdf')}
            </Button>
            {permissions.canManageTemplates && (
              <Button title={t('calendar_view.templates_and_categories')} variant="ghost" onClick={onOpenTemplates}>
                {t('calendar_view.templates_and_categories')}
              </Button>
            )}
          </div>
        }
      >
        {t('calendar_view.title')}
      </SectionTitle>
      
      <SimpleMonthCalendar events={events} onNew={onNewEvent} onEventClick={onEventClick} categories={categories} />

      <Card>
        <CardContent>
          <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-3">{t('general.categories')}</h4>
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
