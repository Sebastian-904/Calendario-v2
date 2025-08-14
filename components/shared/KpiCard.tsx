
import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface KpiCardProps {
  label: string;
  value: number | string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value }) => {
  return (
    <Card>
      <CardContent>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
        <div className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">{value}</div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;