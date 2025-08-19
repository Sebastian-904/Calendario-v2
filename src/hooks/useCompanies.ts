import { useState, useMemo, useCallback } from 'react';
import type { Company, User } from '../types';
import { seedCompanies, seedUsers } from '../data/seedData';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>(seedCompanies);
  const [allUsers, setAllUsers] = useState<Record<string, User[]>>(seedUsers);
  const [companyId, setCompanyId] = useState<string>("c1");
  const [isCoModalOpen, setCoModalOpen] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState<string | null>(null);

  const currentCompany = useMemo(() => {
    return companies.find((c) => c.id === companyId) || companies[0];
  }, [companies, companyId]);

  const currentUsers = useMemo(() => {
    return allUsers[companyId] || [];
  }, [allUsers, companyId]);

  const addUser = useCallback((cId: string, user: User) => {
    setAllUsers(prev => ({
      ...prev,
      [cId]: [...(prev[cId] || []), user]
    }));
  }, []);
  
  const updateUser = useCallback((cId: string, updatedUser: User) => {
    setAllUsers(prev => ({
      ...prev,
      [cId]: (prev[cId] || []).map(user => user.id === updatedUser.id ? updatedUser : user)
    }));
  }, []);
  
  const updateCompany = useCallback((companyId: string, updatedData: Company) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? updatedData : c));
  }, []);

  const removeUser = useCallback((cId: string, userId: string) => {
    setAllUsers(prev => ({
      ...prev,
      [cId]: (prev[cId] || []).filter(user => user.id !== userId)
    }));
  }, []);
  
  const addFullCompany = useCallback((company: Company, users: User[]) => {
      setCompanies(prev => [...prev, company]);
      setAllUsers(prev => ({
          ...prev,
          [company.id]: users
      }));
  }, []);


  return {
    companies,
    setCompanies,
    allUsers,
    companyId,
    setCompanyId,
    currentCompany,
    currentUsers,
    isCoModalOpen,
    setCoModalOpen,
    editCompanyId,
    setEditCompanyId,
    addUser,
    updateUser,
    updateCompany,
    removeUser,
    addFullCompany,
  };
};