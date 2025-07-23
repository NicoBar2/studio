

"use client";

import type { UserRole, Researcher } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 
import { loginAction, getMyResearcherDataAction } from '@/app/actions';

type AuthContextType = {
  role: UserRole | null;
  userEmail: string | null;
  researcher: Omit<Researcher, 'password'> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: UserRole | null) => void; 
  refreshResearcherData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL_FOR_SIMULATOR = 'admin@galapagos.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  const [researcher, setResearcher] = useState<Omit<Researcher, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchResearcherData = useCallback(async (email: string | null) => {
    if (email) {
        const data = await getMyResearcherDataAction(email);
        if(data) setResearcher(data);
        else setResearcher(null);
    } else {
        setResearcher(null);
    }
  }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem('galapagos-auth-role') as UserRole | null;
    const storedEmail = localStorage.getItem('galapagos-auth-email');

    async function initializeAuth() {
        if (storedRole && ['admin', 'researcher', 'tourist'].includes(storedRole)) {
            setRoleState(storedRole);
            if ((storedRole === 'admin' || storedRole === 'researcher') && storedEmail) {
                setUserEmailState(storedEmail);
                await fetchResearcherData(storedEmail);
            } else {
                setUserEmailState(null);
                setResearcher(null);
            }
        } else {
            setRoleState('tourist');
            setUserEmailState(null);
            setResearcher(null);
        }
        setIsLoading(false);
    }
    initializeAuth();
  }, [fetchResearcherData]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const result = await loginAction(email, password);
    
    if (result.success && result.role && result.userEmail) {
      setRoleState(result.role);
      setUserEmailState(result.userEmail);
      localStorage.setItem('galapagos-auth-role', result.role);
      localStorage.setItem('galapagos-auth-email', result.userEmail);
      await fetchResearcherData(result.userEmail);
      setIsLoading(false);
      toast({ title: '¡Éxito!', description: result.message });
      return { success: true };
    } else {
      setIsLoading(false);
      return { success: false, error: result.error };
    }
  };

  const logout = () => {
    setRoleState('tourist');
    setUserEmailState(null);
    setResearcher(null);
    localStorage.setItem('galapagos-auth-role', 'tourist');
    localStorage.removeItem('galapagos-auth-email');
    toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
  };

  const setRole = async (newRole: UserRole | null) => { // For role simulator
    const roleToSet = newRole || 'tourist';
    setRoleState(roleToSet);
    localStorage.setItem('galapagos-auth-role', roleToSet);
    
    if (roleToSet === 'admin') {
      setUserEmailState(ADMIN_EMAIL_FOR_SIMULATOR);
      localStorage.setItem('galapagos-auth-email', ADMIN_EMAIL_FOR_SIMULATOR);
      await fetchResearcherData(ADMIN_EMAIL_FOR_SIMULATOR);
    } else if (roleToSet !== 'admin' && roleToSet !== 'researcher') {
        setUserEmailState(null);
        setResearcher(null);
        localStorage.removeItem('galapagos-auth-email');
    }
  };

  const refreshResearcherData = useCallback(async () => {
    await fetchResearcherData(userEmail);
  }, [userEmail, fetchResearcherData]);
  
  if (isLoading && role === null) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground text-lg">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, userEmail, researcher, isLoading, login, logout, setRole, refreshResearcherData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
