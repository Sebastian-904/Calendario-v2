import { useState, useMemo, useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { seedEvents } from '../data/seedData';

export const useEvents = (companyId: string) => {
  const [store, setStore] = useState<{ events: Record<string, CalendarEvent[]> }>({ events: seedEvents });

  const events = useMemo(() => store.events[companyId] || [], [store.events, companyId]);

  const addEvent = useCallback((data: Omit<CalendarEvent, 'id'>) => {
    const id = `e${Math.random().toString(36).slice(2, 8)}`;
    const newEvent = { id, ...data };
    setStore((s) => {
      const companyEvents = s.events[companyId] || [];
      return {
        ...s,
        events: { ...s.events, [companyId]: [...companyEvents, newEvent] },
      };
    });
  }, [companyId]);

  const updateEvent = useCallback((id: string, patch: Partial<CalendarEvent>) => {
    setStore((s) => {
      const companyEvents = (s.events[companyId] || []).map((e) =>
        e.id === id ? { ...e, ...patch } : e
      );
      return {
        ...s,
        events: { ...s.events, [companyId]: companyEvents },
      };
    });
  }, [companyId]);

  const removeEvent = useCallback((id: string) => {
    setStore((s) => {
      const companyEvents = (s.events[companyId] || []).filter((e) => e.id !== id);
      return {
        ...s,
        events: { ...s.events, [companyId]: companyEvents },
      };
    });
  }, [companyId]);
  
  const setEventsForCompany = useCallback((cId: string, newEvents: CalendarEvent[]) => {
      setStore(s => ({
          ...s,
          events: { ...s.events, [cId]: newEvents }
      }));
  }, []);

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    setEventsForCompany,
  };
};