import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useCompanies } from './hooks/useCompanies.ts';
import { useEvents } from './hooks/useEvents.ts';
import { useTranslation } from './hooks/useTranslation.tsx';
import type { Role, CalendarEvent, Theme, User, AppPermissions, Categories, Template, Company, ImportWizardState, TimeFormat } from './types.ts';

import Header from "./components/layout/Header.tsx";
import Sidebar from "./components/layout/Sidebar.tsx";
import KpiCard from './components/shared/KpiCard.tsx';
import CalendarView from './components/views/CalendarView.tsx';
import TasksView from './components/views/TasksView.tsx';
import ReportsView from './components/views/ReportsView.tsx';
import SettingsView from './components/views/SettingsView.tsx';
import CompanyInfoView from './components/views/CompanyInfoView.tsx';
import EventModal from './components/modals/EventModal.tsx';
import UserModal from './components/modals/UserModal.tsx';
import TemplatesCategoriesModal from './components/modals/TemplatesCategoriesModal.tsx';
import CompaniesModal from './components/modals/CompaniesModal.tsx';
import LoginScreen from "./components/auth/LoginScreen.tsx";
import GuidedTour from "./components/shared/GuidedTour.tsx";
import { todayISO } from './utils/helpers.ts';
import { seedUsers, DEFAULT_CATEGORY_CONFIG, seedTemplates } from "./data/seedData.ts";
import HelpCenterModal from "./components/modals/HelpCenterModal.tsx";
import ImportWizardModal from "./components/modals/ImportWizardModal.tsx";

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [tab, setTab] = useState("calendar");
  const [theme, setTheme] = useState<Theme>('dark');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => {
      return (localStorage.getItem('timeFormat') as TimeFormat) || '24h';
  });
  
  const { t } = useTranslation();

  const role = authenticatedUser?.role || 'cliente_miembro';
  
  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const {
    companies,
    setCompanies,
    allUsers,
    companyId,
    setCompanyId,
    currentCompany,
    updateCompany,
    currentUsers,
    isCoModalOpen,
    setCoModalOpen,
    editCompanyId,
    setEditCompanyId,
    addUser,
    updateUser,
    removeUser,
    addFullCompany
  } = useCompanies();
  
  // Effect to set the initial company for non-admin/consultant users
  useEffect(() => {
    if (authenticatedUser && (authenticatedUser.role === 'cliente_admin' || authenticatedUser.role === 'cliente_miembro')) {
      for (const [cId, users] of Object.entries(seedUsers)) {
        if (users.some(u => u.id === authenticatedUser.id)) {
          setCompanyId(cId);
          break;
        }
      }
    }
  }, [authenticatedUser, setCompanyId]);

  const {
    events,
    addEvent,
    updateEvent,
    removeEvent: removeCalendarEvent,
    setEventsForCompany
  } = useEvents(companyId);

  // Settings state logic moved from useSettings hook
  const getInitialCategories = useCallback((): Categories => {
    const initialCategories: Categories = {};
    for (const key in DEFAULT_CATEGORY_CONFIG) {
        initialCategories[key] = {
            label: t(`categories.${key}`),
            dot: DEFAULT_CATEGORY_CONFIG[key as keyof typeof DEFAULT_CATEGORY_CONFIG]
        };
    }
    return initialCategories;
  }, [t]);

  const [categories, setCategories] = useState<Categories>(getInitialCategories());
  const [templates, setTemplates] = useState<Template[]>(seedTemplates);
  const [isTplModalOpen, setTplModalOpen] = useState(false);
  
  useEffect(() => {
    setCategories(getInitialCategories());
  }, [getInitialCategories]);


  // Modal States
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // Import Wizard State
  const initialWizardState: ImportWizardState = { step: 0, file: null, sheets: [], mappings: {}, show: false };
  const [importWizardState, setImportWizardState] = useState<ImportWizardState>(() => {
    try {
      const savedState = localStorage.getItem('importWizardState');
      return savedState ? JSON.parse(savedState) : initialWizardState;
    } catch (e) {
      return initialWizardState;
    }
  });
  
  useEffect(() => {
    if(importWizardState.show) {
      localStorage.setItem('importWizardState', JSON.stringify(importWizardState));
    } else {
      localStorage.removeItem('importWizardState');
    }
  }, [importWizardState]);

  const handleStartImport = () => {
    setCoModalOpen(false);
    setImportWizardState(s => ({ ...s, show: true, step: 1 }));
  };

  const handleCloseImportWizard = () => {
      setImportWizardState(initialWizardState);
  };
  
  const handleImportComplete = (importedData: { company: Company; users: User[]; events: CalendarEvent[] }) => {
    addFullCompany(importedData.company, importedData.users);
    setEventsForCompany(importedData.company.id, importedData.events);
    setCompanyId(importedData.company.id); // Switch to the newly created company
    handleCloseImportWizard();
  };

  // Guided Tour State
  const [isTourOpen, setTourOpen] = useState(false);

  useEffect(() => {
      const tourCompleted = localStorage.getItem('tourCompleted');
      if (!tourCompleted && authenticatedUser && (authenticatedUser.role === 'consultor')) {
          setTimeout(() => setTourOpen(true), 1000); // Delay to ensure UI renders
      }
  }, [authenticatedUser]);

  const handleTourEnd = () => {
      localStorage.setItem('tourCompleted', 'true');
      setTourOpen(false);
  };


  // --- Permission Logic ---
  const permissions: AppPermissions = useMemo(() => {
    const isAdminRole = role === 'admin';
    const isConsultantRole = role === 'consultor';
    const isClientAdminRole = role === 'cliente_admin';

    return {
        canManageCompanies: isAdminRole || isConsultantRole,
        canManageTemplates: isAdminRole || isConsultantRole || isClientAdminRole,
        canManageUsers: isAdminRole || isConsultantRole || isClientAdminRole,
        canCreateEvents: isAdminRole || isConsultantRole || isClientAdminRole,
        canEditEvents: isAdminRole || isConsultantRole || isClientAdminRole,
        canDeleteEvents: isAdminRole || isConsultantRole,
        canAccessSettings: isAdminRole || isConsultantRole,
        canAccessReports: isAdminRole || isConsultantRole || isClientAdminRole,
        canUploadFiles: isAdminRole || isConsultantRole || isClientAdminRole,
        canManageCompanyInfo: isAdminRole || isConsultantRole || isClientAdminRole,
    };
  }, [role]);

  // --- Event Modal Handlers ---
  const openNewEventModal = useCallback((date: string) => {
    setEditingEvent(null);
    setEventModalDate(date);
    setEventModalOpen(true);
  }, []);
  
  const openEditEventModal = useCallback((event: CalendarEvent) => {
    setEventModalDate(null);
    setEditingEvent(event);
    setEventModalOpen(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setEventModalOpen(false);
    setEventModalDate(null);
    setEditingEvent(null);
  }, []);

  const handleSaveEvent = useCallback((data: CalendarEvent | Omit<CalendarEvent, 'id'>) => {
    if ('id' in data && data.id) {
        updateEvent(data.id, data);
    } else {
        addEvent(data as Omit<CalendarEvent, 'id'>);
    }
    closeEventModal();
  }, [addEvent, updateEvent, closeEventModal]);

  // --- User Modal Handlers ---
  const openNewUserModal = useCallback(() => {
    setEditingUser(null);
    setUserModalOpen(true);
  }, []);

  const openEditUserModal = useCallback((user: User) => {
    setEditingUser(user);
    setUserModalOpen(true);
  }, []);

  const handleOpenProfile = useCallback(() => {
    if (authenticatedUser) {
        openEditUserModal(authenticatedUser);
    }
  }, [authenticatedUser, openEditUserModal]);

  const closeUserModal = useCallback(() => {
    setUserModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleSaveUser = useCallback((user: User) => {
    if (currentUsers.some(u => u.id === user.id)) {
      updateUser(companyId, user);
    } else {
      addUser(companyId, user);
    }
    closeUserModal();
  }, [addUser, updateUser, companyId, currentUsers, closeUserModal]);

  const handleDeleteUser = useCallback((userId: string) => {
    removeUser(companyId, userId);
  }, [removeUser, companyId]);

  // --- Company Info Handler ---
  const handleSaveCompanyInfo = useCallback((updatedCompany: Company) => {
    updateCompany(companyId, updatedCompany);
  }, [updateCompany, companyId]);

  // --- Auth Handlers ---
  const handleLogin = (user: User) => {
    setAuthenticatedUser(user);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setCompanyId(companies[0]?.id || '');
    setTab('calendar');
  };
  
  const stats = useMemo(() => {
    const total = events.length;
    const completed = events.filter((e) => e.status === "Completed").length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [events]);
  
  const augmentedUsers = useMemo(() => {
    if (authenticatedUser && (role === 'admin' || role === 'consultor')) {
      const userInList = currentUsers.find(u => u.id === authenticatedUser.id);
      if (!userInList) {
        // Create a user object without the password for UI display
        const { password, ...userForUI } = authenticatedUser;
        return [userForUI, ...currentUsers];
      }
    }
    return currentUsers;
  }, [authenticatedUser, role, currentUsers]);

  const getGreeting = useCallback(() => {
      if (!authenticatedUser) return "";
      const hour = new Date().getHours();
      let greetingKey = 'greeting.evening';
      if (hour >= 5 && hour < 12) greetingKey = 'greeting.morning';
      if (hour >= 12 && hour < 19) greetingKey = 'greeting.afternoon';
      return t(greetingKey, { name: authenticatedUser.name.split(' ')[0] });
  }, [authenticatedUser, t]);

  if (!authenticatedUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderTabContent = () => {
    switch (tab) {
      case 'tasks':
        return <TasksView 
          events={events} 
          users={currentUsers} 
          categories={categories} 
          onNewEvent={() => openNewEventModal(todayISO())}
          onEditEvent={openEditEventModal}
          onUpdateEvent={updateEvent}
          onRemoveEvent={removeCalendarEvent}
          onOpenTemplates={() => setTplModalOpen(true)}
          permissions={permissions}
        />;
      case 'company-info':
        return <CompanyInfoView 
          company={currentCompany}
          onSave={handleSaveCompanyInfo}
          permissions={permissions}
        />;
      case 'reports':
        if (!permissions.canAccessReports) return null;
        return <ReportsView 
          events={events} 
          users={currentUsers} 
          categories={categories}
          company={currentCompany}
          companies={companies}
          allUsers={allUsers}
          onOpenTemplates={() => setTplModalOpen(true)}
          permissions={permissions}
        />;
      case 'settings':
        if (!permissions.canAccessSettings) return null;
        return <SettingsView
          categories={categories}
          onOpenTemplates={() => setTplModalOpen(true)}
          onEditCompany={() => { setEditCompanyId(companyId); setCoModalOpen(true); }}
          onNewCompany={() => { setEditCompanyId(null); setCoModalOpen(true); }}
          timeFormat={timeFormat}
          setTimeFormat={setTimeFormat}
        />;
      case 'calendar':
      default:
        return <CalendarView 
          events={events}
          users={currentUsers}
          categories={categories}
          company={currentCompany}
          onNewEvent={openNewEventModal}
          onEventClick={openEditEventModal}
          onOpenTemplates={() => setTplModalOpen(true)}
          permissions={permissions}
        />;
    }
  };

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 font-sans">
      <Header 
        user={authenticatedUser} 
        onLogout={handleLogout} 
        theme={theme} 
        toggleTheme={toggleTheme}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenProfile={handleOpenProfile}
        timeFormat={timeFormat}
      />

      <div className="max-w-screen-2xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <Sidebar
          companies={companies}
          companyId={companyId}
          setCompanyId={setCompanyId}
          company={currentCompany}
          tab={tab}
          setTab={setTab}
          users={augmentedUsers}
          onNewCompany={() => { setEditCompanyId(null); setCoModalOpen(true); }}
          onEditCompany={() => { setEditCompanyId(companyId); setCoModalOpen(true); }}
          onNewUser={openNewUserModal}
          onEditUser={openEditUserModal}
          onDeleteUser={handleDeleteUser}
          permissions={permissions}
        />

        <main className="col-span-12 lg:col-span-9 space-y-6">
          <div className="mb-4">
             <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">{getGreeting()}</h1>
             <p className="text