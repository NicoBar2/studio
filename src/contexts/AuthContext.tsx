
"use client";

import type { UserRole } from '@/lib/species';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AuthContextType = {
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // setRole is kept for potential direct role changes if needed, but login/logout are primary
  setRole: (role: UserRole | null) => void; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales predefinidas para el prototipo
const PREDEFINED_CREDENTIALS: Record<string, { pass: string; role: UserRole }> = {
  'admin@galapagos.com': { pass: 'admin123', role: 'admin' },
  'researcher@galapagos.com': { pass: 'researcher123', role: 'researcher' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar rol desde localStorage al iniciar para persistir la "sesión"
    const storedRole = localStorage.getItem('galapagos-auth-role') as UserRole | null;
    if (storedRole && ['admin', 'researcher', 'tourist'].includes(storedRole)) {
      setRoleState(storedRole);
    } else {
      setRoleState('tourist'); // Por defecto es turista si no hay rol guardado o es inválido
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500));

    const userCredentials = PREDEFINED_CREDENTIALS[email.toLowerCase()];
    if (userCredentials && userCredentials.pass === password) {
      setRoleState(userCredentials.role);
      localStorage.setItem('galapagos-auth-role', userCredentials.role);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setRoleState('tourist');
    localStorage.setItem('galapagos-auth-role', 'tourist');
    // Podrías limpiar más cosas aquí si es necesario, ej: router.push('/login');
  };

  // Direct setRole, útil para el simulador si se quiere reintroducir o para pruebas.
  // Para el login normal, usar login() y logout().
  const setRole = (newRole: UserRole | null) => {
    const roleToSet = newRole || 'tourist';
    setRoleState(roleToSet);
    localStorage.setItem('galapagos-auth-role', roleToSet);
  };
  
  if (isLoading && role === null) { // Muestra carga solo si aún no se ha determinado el rol inicial
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground text-lg">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, isLoading, login, logout, setRole }}>
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
