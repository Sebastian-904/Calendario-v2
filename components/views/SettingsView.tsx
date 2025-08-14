import React, { useState } from 'react';
import { Settings, Mail } from 'lucide-react';
import type { Categories } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { classNames } from '../../utils/helpers';
import { useTranslation } from '../../hooks/useTranslation';

interface SettingsViewProps {
  categories: Categories;
  onOpenTemplates: () => void;
  onNewCompany: () => void;
  onEditCompany: () => void;
}

const ToggleRow: React.FC<{label: string}> = ({ label }) => {
    const { t } = useTranslation();
    const [on, setOn] = useState(true);
    return (
      <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          <span className="text-zinc-700 dark:text-zinc-200">{label}</span>
        </div>
        <button
          title={on ? t('settings_view.deactivate') : t('settings_view.activate')}
          onClick={() => setOn(!on)}
          className={classNames(
            "px-3 py-1 rounded-md text-xs font-semibold transition-all",
            on ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
          )}
        >
          {on ? t('settings_view.active') : t('settings_view.inactive')}
        </button>
      </div>
    );
};

const SettingsView: React.FC<SettingsViewProps> = ({ categories, onOpenTemplates, onNewCompany, onEditCompany }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Settings}
        right={
          <div className="flex gap-2">
            <Button title={t('calendar_view.templates_and_categories')} variant="ghost" onClick={onOpenTemplates}>{t('calendar_view.templates_and_categories')}</Button>
            <Button title={t('settings_view.manage_companies')} variant="ghost" onClick={onEditCompany}>{t('general.companies')}</Button>
          </div>
        }
      >
        {t('settings_view.title')}
      </SectionTitle>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">{t('settings_view.email_notifications')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow label={t('settings_view.seven_day_reminder')} />
            <ToggleRow label={t('settings_view.one_day_reminder')} />
            <ToggleRow label={t('settings_view.same_day_reminder')} />
            <ToggleRow label={t('settings_view.weekly_summary')} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('settings_view.demo_note')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">{t('calendar_view.templates_and_categories')}</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('settings_view.templates_and_categories_desc')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm text-zinc-700 dark:text-zinc-200">
                <span className={classNames("w-2 h-2 rounded-full", v.dot)}></span>
                {v.label}
              </span>
            ))}
          </div>
          <div>
            <Button title={t('settings_view.open_manager')} onClick={onOpenTemplates}>{t('settings_view.open_manager')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">{t('general.companies')}</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('settings_view.companies_desc')}</p>
          <div className="flex gap-2">
            <Button title={t('settings_view.add_company')} variant="outline" onClick={onNewCompany}>{t('settings_view.add_company')}</Button>
            <Button title={t('settings_view.edit_current')} variant="ghost" onClick={onEditCompany}>{t('settings_view.edit_current')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
