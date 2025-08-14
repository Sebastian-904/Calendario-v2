
import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { classNames, todayISO } from '../../utils/helpers';
import type { CalendarEvent, Categories } from '../../types';

interface SimpleMonthCalendarProps {
  events: CalendarEvent[];
  onNew: (isoDate: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  categories: Categories;
}

const SimpleMonthCalendar: React.FC<SimpleMonthCalendarProps> = ({ events, onNew, onEventClick, categories }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startOffset = (first.getDay() + 6) % 7; // Monday=0

  const cells = useMemo(() => {
    const c: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) c.push(null);
    for (let d = 1; d <= daysInMonth; d++) c.push(new Date(year, month, d));
    while (c.length % 7 !== 0) c.push(null);
    return c;
  }, [year, month, daysInMonth, startOffset]);

  const evByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    (events || []).forEach((e) => {
      m[e.date] = m[e.date] || [];
      m[e.date].push(e);
    });
    return m;
  }, [events]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 text-xs text-center text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="px-3 py-2 font-semibold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, idx) => {
            const iso = d ? d.toISOString().slice(0, 10) : null;
            const dayEvents = iso ? evByDate[iso] || [] : [];
            const isToday = iso === todayISO();
            return (
              <div key={idx} className="relative min-h-[120px] border-b border-r border-zinc-200 dark:border-zinc-800 p-2 group">
                 <div className="flex items-start justify-between">
                  <span className={classNames(
                      "flex items-center justify-center w-7 h-7 rounded-full text-sm",
                      isToday ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-zinc-900 font-bold" : "text-zinc-700 dark:text-zinc-300"
                  )}>
                      {d ? d.getDate() : ""}
                  </span>
                  {d && (
                    <button
                      onClick={() => onNew && onNew(iso as string)}
                      className="text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="New task on this date"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div 
                      key={e.id} 
                      onClick={() => onEventClick(e)}
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 rounded px-2 py-1 flex items-center gap-2 cursor-pointer" 
                      title={e.title}
                    >
                      <span className={classNames("w-2 h-2 rounded-full flex-shrink-0", categories[e.category]?.dot || "bg-zinc-500")}></span>
                      <span className="truncate text-zinc-800 dark:text-zinc-200">{e.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 pl-2">+{dayEvents.length - 3} more...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleMonthCalendar;