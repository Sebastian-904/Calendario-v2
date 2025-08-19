
import React, { useState } from 'react';
import { Settings, Mail, Clock } from 'lucide-react';
import type { Categories, TimeFormat } from '../../types';
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
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
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

const SettingsView: React.FC<SettingsViewProps> = ({ categories, onOpenTemplates, timeFormat, setTimeFormat }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Settings}
        right={
          <div className="flex gap-2">
            <Button title={t('calendar_view.templates_and_categories')} variant="ghost" onClick={onOpenTemplates}>{t('calendar_view.templates_and_categories')}</Button>
          </div>
        }
      >
        {t('settings_view.title')}
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="space-y-4">
            <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">{t('settings_view.display_preferences')}</h4>
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                <span className="text-zinc-700 dark:text-zinc-200">{t('settings_view.time_format')}</span>
              </div>
              <div className="flex items-center bg-zinc-200 dark:bg-zinc-700 p-1 rounded-lg">
                  <Button size="sm" variant={timeFormat === '12h' ? 'default' : 'ghost'} onClick={() => setTimeFormat('12h')} className="!px-3 !py-1 !text-xs">{t('settings_view.12h')}</Button>
                  <Button size="sm" variant={timeFormat === '24h' ? 'default' : 'ghost'} onClick={() => setTimeFormat('24h')} className="!px-3 !py-1 !text-xs">{t('settings_view.24h')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">{t('calendar_view.templates_and_categories')}</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('settings_view.templates_and_categories_desc_short')}</p>
            <div>
              <Button title={t('settings_view.open_manager')} onClick={onOpenTemplates}>{t('settings_view.open_manager')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default SettingsView;
