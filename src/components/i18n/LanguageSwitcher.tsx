
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // Infer current locale from pathname.
  // Assumes 'es' is default and 'en' is the other main locale.
  // If pathname is just '/en', it's the root of the 'en' locale.
  const currentLocale = pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'es';

  const handleLocaleChange = (newLocale: string) => {
    let pathWithoutLocale = pathname;

    // Remove current locale prefix if it's not the default ('es')
    if (currentLocale !== 'es' && pathname.startsWith(`/${currentLocale}`)) {
      pathWithoutLocale = pathname.substring(`/${currentLocale}`.length);
      // If the path becomes empty, it means it was the root of the locale (e.g., /en -> /)
      if (pathWithoutLocale === '') {
        pathWithoutLocale = '/';
      }
    }
    
    // Navigate to the new path with the selected locale.
    // router.push will handle prefixing for non-default locales.
    // Using router.replace to avoid adding unnecessary entries to browser history for language changes.
    router.replace(pathWithoutLocale, { locale: newLocale });
  };

  const locales = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  const placeholderText = currentLocale === 'es' ? 'Idioma' : 'Language';

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select
        value={currentLocale}
        onValueChange={handleLocaleChange}
      >
        <SelectTrigger 
          className="w-auto bg-transparent border-none shadow-none text-sm focus:ring-0 h-auto p-0 text-muted-foreground hover:text-foreground"
          aria-label={placeholderText}
        >
          {/* Display the label of the current locale, not a generic placeholder */}
          {locales.find(loc => loc.value === currentLocale)?.label || placeholderText}
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
