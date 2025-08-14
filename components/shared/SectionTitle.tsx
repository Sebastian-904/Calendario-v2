
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  icon: LucideIcon;
  children: React.ReactNode;
  right?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon: Icon, children, right }) => (
  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
      <h2 className="text-zinc-800 dark:text-zinc-100 font-semibold text-lg">{children}</h2>
    </div>
    <div>{right}</div>
  </div>
);

export default SectionTitle;