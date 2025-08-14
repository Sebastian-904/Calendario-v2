
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { classNames } from '../../utils/helpers';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={classNames(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-zinc-200 dark:border-zinc-800 transition-colors w-full text-left",
        active ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default NavItem;