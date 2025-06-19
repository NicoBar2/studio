
"use client";
import Link from 'next/link';
import { MountainIcon, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { role, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirigir a la página principal después del logout
  };

  const getRoleDisplayName = (currentRole: string | null) => {
    if (currentRole === 'admin') return 'Administrador/a';
    if (currentRole === 'researcher') return 'Investigador/a';
    return 'Turista';
  }

  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-semibold text-primary">Galapagos DataLens</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
            prefetch={false}
          >
            Especies
          </Link>
          {(role === 'admin' || role === 'researcher') && (
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
              prefetch={false}
            >
              Panel
            </Link>
          )}

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : role && role !== 'tourist' ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground hidden sm:inline">{getRoleDisplayName(role)}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
