
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname(); // In App Router, this is the path WITHOUT locale prefix.

  const [activeLocale, setActiveLocale] = useState('es'); // Default to 'es'

  useEffect(() => {
    // Determine current locale on the client side after mount
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/en')) {
        setActiveLocale('en');
      } else {
        setActiveLocale('es');
      }
    }
  }, [pathname]); // Re-evaluate if the base pathname changes (due to navigation)

  const handleLocaleChange = (newLocale: string) => {
    // `pathname` is the base path, e.g., /species/giant-tortoise
    // Construct the new path:
    // - If newLocale is 'es' (default), newPath is just `pathname`.
    // - If newLocale is 'en', newPath is `/en${pathname}`.
    
    let newPath = pathname;
    if (newLocale === 'en') {
      newPath = `/en${pathname}`;
    }
    // Ensure leading slash for default locale if pathname is empty (root)
    if (newLocale === 'es' && pathname === '') {
      newPath = '/';
    }
    if (newLocale === 'en' && pathname === '') {
      newPath = '/en';
    }


    router.replace(newPath);
  };

  const locales = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  const currentLocaleLabel = locales.find(loc => loc.value === activeLocale)?.label || (activeLocale === 'es' ? 'Idioma' : 'Language');

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select
        value={activeLocale}
        onValueChange={handleLocaleChange}
      >
        <SelectTrigger
          className="w-auto bg-transparent border-none shadow-none text-sm focus:ring-0 h-auto p-0 text-muted-foreground hover:text-foreground"
          aria-label={currentLocaleLabel}
        >
          {currentLocaleLabel}
        </SelectTrigger>
        <SelectContent align="end">
          {locales.map((loc) => (
            <SelectItem key={loc.value} value={loc.value}>
              {loc.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
