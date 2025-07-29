

"use client";
import Link from 'next/link';
import { MountainIcon, LogIn, LogOut, UserCircle, Languages, LayoutGrid, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '../ui/ThemeToggle';


export default function Header() {
  const { role, logout, isLoading, researcher, refreshResearcherData } = useAuth();
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
  
  const handleProfileClick = () => {
    refreshResearcherData(); // Refresh data when opening profile
    router.push('/dashboard/profile');
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
          <Link
            href="/colaboradores"
            className="text-sm font-medium hover:text-primary transition-colors"
            prefetch={false}
          >
            {t.collaborators}
          </Link>

          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t.loading}</div>
          ) : role && role !== 'tourist' ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={researcher?.profileImageUrl || undefined} alt={researcher?.name} />
                      <AvatarFallback>
                        <UserCircle className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  <span className="font-medium text-foreground hidden sm:inline">{researcher?.name || getRoleDisplayName(role)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>{t.dashboard}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
