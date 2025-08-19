import React from 'react';
import { classNames } from '../../utils/helpers.ts';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={classNames('bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm', className)}>
      {children}
    </div>
  );
};

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={classNames('p-4', className)}>{children}</div>;
};

export { Card, CardContent };