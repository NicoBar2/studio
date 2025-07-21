
import { getSpeciesByIdAction } from '@/app/actions';
import SpeciesDetailClient from './SpeciesDetailClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from '@/contexts/LanguageContext';

type SpeciesDetailPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: SpeciesDetailPageProps) {
    const t = getTranslations('es'); // Default language for metadata
    const species = await getSpeciesByIdAction(params.id);
    if (!species) {
        return {
            title: t.speciesNotFound
        }
    }
    return {
        title: `${t.getSpeciesName(species)} | Galápagos DataLens`
    }
}


export default async function SpeciesDetailPage({ params }: SpeciesDetailPageProps) {
  const species = await getSpeciesByIdAction(params.id);
  const t = getTranslations('es'); // Defaulting to Spanish for server-side text

  if (!species) {
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
