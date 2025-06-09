
"use client";

import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/species';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Added Button import for fallback UI

type RoleBasedGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallbackPath?: string; // Optional: path to redirect if not authorized
  fallbackUI?: ReactNode; // Optional: UI to show if not authorized and no redirect
};

export default function RoleBasedGuard({ allowedRoles, children, fallbackPath = "/", fallbackUI }: RoleBasedGuardProps) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role && !allowedRoles.includes(role)) {
      if (fallbackPath && !fallbackUI) {
        router.replace(fallbackPath);
      }
    }
  }, [role, isLoading, allowedRoles, router, fallbackPath, fallbackUI]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[300px]">
            <p>Cargando autenticación de usuario...</p>
        </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    if (fallbackUI) return <>{fallbackUI}</>;
    // If no fallbackUI and no redirect (e.g., still loading redirect), show minimal message
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-4 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Acceso Denegado</h2>
            <p className="text-foreground">No tienes permiso para ver esta página.</p>
            {fallbackPath && <Button onClick={() => router.push(fallbackPath)} className="mt-4">Ir al Inicio</Button>}
        </div>
    );
  }

  return <>{children}</>;
}
