import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useCompanies } from './hooks/useCompanies';
import { useEvents } from './hooks/useEvents';
import { useTranslation } from './hooks/useTranslation';
import type { Role, CalendarEvent, Theme, User, AppPermissions, Categories, Template, Company } from './types';

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import KpiCard from './components/shared/KpiCard';
import CalendarView from './components/views/CalendarView';
import TasksView from './components/views/TasksView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import CompanyInfoView from './components/views/CompanyInfoView';
import EventModal from './components/modals/EventModal';
import UserModal from './components/modals/UserModal';
import TemplatesCategoriesModal from './components/modals/TemplatesCategoriesModal';
import CompaniesModal from './components/modals/CompaniesModal';
import LoginScreen from "./components/auth/LoginScreen";
import { todayISO } from './utils/helpers';
import { seedUsers, DEFAULT_CATEGORY_CONFIG, seedTemplates } from "./data/seedData";

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [tab, setTab] = useState("calendar");
  const [theme, setTheme] = useState<Theme>('dark');
  const { t } = useTranslation();

  const role = authenticatedUser?.role || 'cliente_miembro';

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
    removeUser
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
    removeEvent: removeCalendarEvent
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
      <Header user={authenticatedUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label={t('kpi.total_tasks')} value={stats.total} />
            <KpiCard label={t('kpi.pending_tasks')} value={stats.pending} />
            <KpiCard label={t('kpi.completed_tasks')} value={stats.completed} />
          </div>
          {renderTabContent()}
        </main>
      </div>

      <TemplatesCategoriesModal 
        open={isTplModalOpen} 
        onClose={() => setTplModalOpen(false)} 
        categories={categories} 
        setCategories={setCategories} 
        templates={templates} 
        setTemplates={setTemplates} 
      />
      <CompaniesModal 
        open={isCoModalOpen} 
        onClose={() => setCoModalOpen(false)} 
        companies={companies} 
        setCompanies={setCompanies} 
        editId={editCompanyId} 
        setEditId={setEditCompanyId} 
        setCompanyId={setCompanyId} 
      />
      <EventModal 
        open={isEventModalOpen} 
        presetDate={eventModalDate}
        editingEvent={editingEvent}
        users={currentUsers} 
        categories={categories} 
        onClose={closeEventModal} 
        onSave={handleSaveEvent}
        permissions={permissions}
      />
       <UserModal 
        open={isUserModalOpen}
        onClose={closeUserModal}
        onSave={handleSaveUser}
        editingUser={editingUser}
        currentUserRole={role}
      />
    </div>
  );
}