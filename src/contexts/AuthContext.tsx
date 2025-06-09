
"use client";

import type { UserRole } from '@/lib/species';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type AuthContextType = {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching initial role or default to tourist
    // In a real app, this might check localStorage or a session
    const storedRole = localStorage.getItem('galapagos-role') as UserRole | null;
    if (storedRole && ['admin', 'researcher', 'tourist'].includes(storedRole)) {
      setRoleState(storedRole);
    } else {
      setRoleState('tourist'); // Default role
      localStorage.setItem('galapagos-role', 'tourist');
    }
    setIsLoading(false);
  }, []);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('galapagos-role', newRole);
    } else {
      localStorage.removeItem('galapagos-role');
      // Default to tourist if role is cleared to null
      localStorage.setItem('galapagos-role', 'tourist');
      setRoleState('tourist');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground text-lg">Loading application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, setRole, isLoading }}>
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
