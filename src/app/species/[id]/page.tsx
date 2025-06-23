
import { getSpeciesById, getSpeciesList } from '@/lib/species';
import SpeciesDetailClient from './SpeciesDetailClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type SpeciesDetailPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: SpeciesDetailPageProps) {
  const species = await getSpeciesById(params.id);
  if (!species) {
    return { title: 'Especie No Encontrada' };
  }
  return {
    title: `${species.spanishCommonName} | Galapagos DataLens`,
    description: species.spanishDescription,
  };
}

export default async function SpeciesDetailPage({ params }: SpeciesDetailPageProps) {
  const species = await getSpeciesById(params.id);

  if (!species) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Especies
        </Link>
      </Button>
      <SpeciesDetailClient species={species} />
    </div>
  );
}

// Enable static generation for all species pages
export async function generateStaticParams() {
  const speciesList = await getSpeciesList();
  return speciesList.map((species) => ({
    id: species.id,
  }));
}
