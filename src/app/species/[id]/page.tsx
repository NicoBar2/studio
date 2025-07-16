
"use client";
import { getSpeciesById } from '@/lib/species';
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
  const { language, t } = useLanguage();
  const [species, setSpecies] = useState<Species | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecies() {
      setIsLoading(true);
      const data = await getSpeciesById(params.id);
      setSpecies(data);
      setIsLoading(false);
    }
    fetchSpecies();
  }, [params.id]);
  
  useEffect(() => {
    if (species) {
      document.title = `${t.getSpeciesName(species)} | Galápagos DataLens`;
    } else if (species === null) {
      document.title = t.speciesNotFound;
    }
  }, [species, t]);


  if (isLoading || species === undefined) {
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

    