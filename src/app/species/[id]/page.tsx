
"use client" // This needs to be a client component to use the language hook for the button
import { getSpeciesById, getSpeciesList } from '@/lib/species';
import SpeciesDetailClient from './SpeciesDetailClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { Species } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type SpeciesDetailPageProps = {
  params: { id: string };
};

export default function SpeciesDetailPage({ params }: SpeciesDetailPageProps) {
  const { t } = useLanguage();
  const [species, setSpecies] = useState<Species | null | undefined>(undefined);

  useEffect(() => {
    async function fetchSpecies() {
      const data = await getSpeciesById(params.id);
      setSpecies(data);
    }
    fetchSpecies();
  }, [params.id]);
  
  // Set metadata dynamically
  useEffect(() => {
      if (species) {
        document.title = `${t.getSpeciesName(species, 'es')} | Galápagos DataLens`;
      } else if (species === null) {
        document.title = 'Especie No Encontrada';
      }
  }, [species, t]);


  if (species === undefined) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-[500px] w-full" />
        </div>
    );
  }

  if (species === null) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t.goBack}
        </Link>
      </Button>
      <SpeciesDetailClient species={species} />
    </div>
  );
}
