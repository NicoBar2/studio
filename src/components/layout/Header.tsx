
"use client";
import Link from 'next/link';
import { MountainIcon } from 'lucide-react';
import LoginSimulator from '@/components/auth/LoginSimulator';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { role } = useAuth();

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
          <LoginSimulator />
        </nav>
      </div>
    </header>
  );
}
