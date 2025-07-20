
"use client";
import { getSpeciesByIdAction } from '@/app/actions';
import SpeciesEditForm from '@/components/species/SpeciesEditForm';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Species } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

type EditSpeciesPageProps = {
  params: { id: string };
};

export default function EditSpeciesPage({ params }: EditSpeciesPageProps) {
  const [species, setSpecies] = useState<Species | undefined | null>(undefined);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchSpecies() {
      const data = await getSpeciesByIdAction(params.id);
      setSpecies(data);
    }
    fetchSpecies();
  }, [params.id]);

  useEffect(() => {
    if (species) {
      document.title = `${t.edit} ${t.getSpeciesName(species)} | Galápagos DataLens`;
    } else if (species === null) {
      document.title = t.speciesNotFound;
    }
  }, [species, t]);

  if (species === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!species) {
    notFound();
  }

  return (
    <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t.backToDashboard}
          </Link>
        </Button>
        <SpeciesEditForm species={species} />
      </div>
    </RoleBasedGuard>
  );
}
