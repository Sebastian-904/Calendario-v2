
import React from 'react';
import { classNames } from '../../utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  colorClass?: string;
}

const Badge: React.FC<BadgeProps> = ({ colorClass = "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200", children }) => (
  <span className={classNames("px-2 py-0.5 rounded-full text-xs font-medium", colorClass)}>{children}</span>
);

export default Badge;