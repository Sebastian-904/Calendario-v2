export const fmtDate = (d: string, locale: 'es-MX' | 'en-US' = 'es-MX'): string => new Date(d).toLocaleDateString(locale, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC' // Important to avoid off-by-one day errors
});

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

export const addDaysISO = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
