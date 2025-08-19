
import { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';
import type { TimeFormat } from '../types';

export const useClock = (format: TimeFormat) => {
    const [time, setTime] = useState(new Date());
    const { language } = useTranslation();

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const locale = language === 'es' ? 'es-MX' : 'en-US';

    return time.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: format === '12h',
    });
};
