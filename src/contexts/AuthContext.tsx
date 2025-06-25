
"use client";

import type { UserRole } from '@/lib/species';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { getResearcherByEmailFromStore, setResearcherPasswordAction } from '@/app/actions'; // Import actions
import bcrypt from 'bcryptjs';

type AuthContextType = {
  role: UserRole | null;
  userEmail: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: UserRole | null) => void; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials remain, researcher credentials will be dynamic
const ADMIN_CREDENTIALS = { 
  email: 'admin@galapagos.com', 
  pass: 'admin123', 
  role: 'admin' as UserRole 
};

const MIN_PASSWORD_LENGTH = 6;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedRole = localStorage.getItem('galapagos-auth-role') as UserRole | null;
    const storedEmail = localStorage.getItem('galapagos-auth-email');

    if (storedRole && ['admin', 'researcher', 'tourist'].includes(storedRole)) {
      setRoleState(storedRole);
      if ((storedRole === 'admin' || storedRole === 'researcher') && storedEmail) {
        setUserEmailState(storedEmail);
      } else {
        setUserEmailState(null);
      }
    } else {
      setRoleState('tourist');
      setUserEmailState(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const lowerEmail = email.toLowerCase();

    // Admin Login
    if (lowerEmail === ADMIN_CREDENTIALS.email) {
      if (password === ADMIN_CREDENTIALS.pass) {
        setRoleState(ADMIN_CREDENTIALS.role);
        setUserEmailState(lowerEmail);
        localStorage.setItem('galapagos-auth-role', ADMIN_CREDENTIALS.role);
        localStorage.setItem('galapagos-auth-email', lowerEmail);
        setIsLoading(false);
        toast({ title: '¡Éxito!', description: 'Inicio de sesión como administrador/a exitoso.' });
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Contraseña de administrador incorrecta.' };
      }
    }

    // Researcher Login / Password Setup
    const researcher = await getResearcherByEmailFromStore(lowerEmail);

    if (!researcher) {
      setIsLoading(false);
      return { success: false, error: 'Investigador no encontrado con este correo electrónico.' };
    }

    if (!researcher.isVerified) {
      setIsLoading(false);
      return { success: false, error: 'Cuenta de investigador no verificada. Por favor, contacta a un administrador.' };
    }

    // Researcher is verified
    if (!researcher.password) {
      // First-time password setup for a verified researcher
      if (!password || password.length < MIN_PASSWORD_LENGTH) {
        setIsLoading(false);
        return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres para la configuración inicial.` };
      }
      
      const updatedResearcher = await setResearcherPasswordAction(lowerEmail, password);
      if (updatedResearcher) {
        setRoleState('researcher');
        setUserEmailState(lowerEmail);
        localStorage.setItem('galapagos-auth-role', 'researcher');
        localStorage.setItem('galapagos-auth-email', lowerEmail);
        setIsLoading(false);
        toast({ title: '¡Éxito!', description: 'Contraseña creada. Has iniciado sesión.' });
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'No se pudo configurar la contraseña. Inténtalo de nuevo.' };
      }
    } else {
      // Researcher has an existing password, normal login
      const passwordMatch = await bcrypt.compare(password, researcher.password);
      if (passwordMatch) {
        setRoleState('researcher');
        setUserEmailState(lowerEmail);
        localStorage.setItem('galapagos-auth-role', 'researcher');
        localStorage.setItem('galapagos-auth-email', lowerEmail);
        setIsLoading(false);
        toast({ title: '¡Éxito!', description: 'Inicio de sesión como investigador/a exitoso.' });
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Contraseña incorrecta para el investigador.' };
      }
    }
  };

  const logout = () => {
    setRoleState('tourist');
    setUserEmailState(null);
    localStorage.setItem('galapagos-auth-role', 'tourist');
    localStorage.removeItem('galapagos-auth-email');
    toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
  };

  const setRole = (newRole: UserRole | null) => { // For role simulator
    const roleToSet = newRole || 'tourist';
    setRoleState(roleToSet);
    localStorage.setItem('galapagos-auth-role', roleToSet);
    
    if (roleToSet === 'admin' && !userEmail) { // If simulating admin without prior login
      setUserEmailState(ADMIN_CREDENTIALS.email);
      localStorage.setItem('galapagos-auth-email', ADMIN_CREDENTIALS.email);
    } else if (roleToSet === 'researcher' && !userEmail) { // If simulating researcher without prior login, this is tricky.
        // For simplicity, if switching TO researcher and no email, clear it. Actual researcher login sets email.
        setUserEmailState(null); // Or a placeholder email if needed for some flows
        localStorage.removeItem('galapagos-auth-email');
    } else if (roleToSet !== 'admin' && roleToSet !== 'researcher') {
        setUserEmailState(null);
        localStorage.removeItem('galapagos-auth-email');
    }
  };
  
  if (isLoading && role === null) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground text-lg">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, userEmail, isLoading, login, logout, setRole }}>
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
