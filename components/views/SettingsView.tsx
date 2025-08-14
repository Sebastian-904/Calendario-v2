
import React, { useState } from 'react';
import { Settings, Mail } from 'lucide-react';
import type { Categories } from '../../types';
import SectionTitle from '../shared/SectionTitle';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { classNames } from '../../utils/helpers';

interface SettingsViewProps {
  categories: Categories;
  onOpenTemplates: () => void;
  onNewCompany: () => void;
  onEditCompany: () => void;
}

const ToggleRow: React.FC<{label: string}> = ({ label }) => {
    const [on, setOn] = useState(true);
    return (
      <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          <span className="text-zinc-700 dark:text-zinc-200">{label}</span>
        </div>
        <button
          title={on ? 'Deactivate' : 'Activate'}
          onClick={() => setOn(!on)}
          className={classNames(
            "px-3 py-1 rounded-md text-xs font-semibold transition-all",
            on ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
          )}
        >
          {on ? "Active" : "Inactive"}
        </button>
      </div>
    );
};

const SettingsView: React.FC<SettingsViewProps> = ({ categories, onOpenTemplates, onNewCompany, onEditCompany }) => {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Settings}
        right={
          <div className="flex gap-2">
            <Button title="Templates & Categories" variant="ghost" onClick={onOpenTemplates}>Templates & Categories</Button>
            <Button title="Manage Companies" variant="ghost" onClick={onEditCompany}>Companies</Button>
          </div>
        }
      >
        Settings
      </SectionTitle>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Email Notifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow label="7-day reminder" />
            <ToggleRow label="1-day reminder" />
            <ToggleRow label="Same-day reminder" />
            <ToggleRow label="Weekly summary (Mon 9:00 AM)" />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">User-level notification preferences. (MVP demo)</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Templates & Categories</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Manage global categories and task templates. You can also open the manager from any menu.</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm text-zinc-700 dark:text-zinc-200">
                <span className={classNames("w-2 h-2 rounded-full", v.dot)}></span>
                {v.label}
              </span>
            ))}
          </div>
          <div>
            <Button title="Open Templates & Categories Manager" onClick={onOpenTemplates}>Open Manager</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h4 className="text-zinc-800 dark:text-zinc-200 font-medium">Companies</h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Add new companies or edit general information for existing ones.</p>
          <div className="flex gap-2">
            <Button title="Add new company" variant="outline" onClick={onNewCompany}>Add Company</Button>
            <Button title="Edit current company" variant="ghost" onClick={onEditCompany}>Edit Current</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;