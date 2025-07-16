
"use client";
import Link from 'next/link';
import { MountainIcon, LogIn, LogOut, UserCircle, Languages } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function Header() {
  const { role, logout, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); 
  };

  const getRoleDisplayName = (currentRole: string | null) => {
    if (currentRole === 'admin') return t.role_admin;
    if (currentRole === 'researcher') return t.role_researcher;
    return t.role_tourist;
  }

  return (
    <header className="bg-card text-card-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-semibold text-primary">Galápagos DataLens</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
            prefetch={false}
          >
            {t.species}
          </Link>
          {(role === 'admin' || role === 'researcher') && (
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
              prefetch={false}
            >
              {t.dashboard}
            </Link>
          )}

          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t.loading}</div>
          ) : role && role !== 'tourist' ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground hidden sm:inline">{getRoleDisplayName(role)}</span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                {t.logout}
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {t.login}
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('es')} disabled={language === 'es'}>
                Español
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
