
"use client";

import type { UserRole } from '@/lib/species';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AuthContextType = {
  role: UserRole | null;
  userEmail: string | null; // Added userEmail
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole | null) => void; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREDEFINED_CREDENTIALS: Record<string, { pass: string; role: UserRole }> = {
  'admin@galapagos.com': { pass: 'admin123', role: 'admin' },
  'researcher@galapagos.com': { pass: 'researcher123', role: 'researcher' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [userEmail, setUserEmailState] = useState<string | null>(null); // Added userEmail state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem('galapagos-auth-role') as UserRole | null;
    const storedEmail = localStorage.getItem('galapagos-auth-email'); // Load email

    if (storedRole && ['admin', 'researcher', 'tourist'].includes(storedRole)) {
      setRoleState(storedRole);
      if (storedRole === 'admin' || storedRole === 'researcher') {
        setUserEmailState(storedEmail); // Set email if admin or researcher
      } else {
        setUserEmailState(null);
      }
    } else {
      setRoleState('tourist');
      setUserEmailState(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const userCredentials = PREDEFINED_CREDENTIALS[email.toLowerCase()];
    if (userCredentials && userCredentials.pass === password) {
      setRoleState(userCredentials.role);
      setUserEmailState(email.toLowerCase()); // Store email on login
      localStorage.setItem('galapagos-auth-role', userCredentials.role);
      localStorage.setItem('galapagos-auth-email', email.toLowerCase()); // Save email
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setRoleState('tourist');
    setUserEmailState(null); // Clear email on logout
    localStorage.setItem('galapagos-auth-role', 'tourist');
    localStorage.removeItem('galapagos-auth-email'); // Remove email
  };

  const setRole = (newRole: UserRole | null) => {
    const roleToSet = newRole || 'tourist';
    setRoleState(roleToSet);
    localStorage.setItem('galapagos-auth-role', roleToSet);
    // Note: This direct setRole might not always have the email context.
    // For simulated roles, email might need to be handled separately if not going through login.
    // For this app, login is the primary way to get a role other than tourist.
    if (roleToSet !== 'admin' && roleToSet !== 'researcher') {
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
