
import { getSpeciesById, Species } from '@/lib/species';
import SpeciesEditForm from '@/components/species/SpeciesEditForm';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type EditSpeciesPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: EditSpeciesPageProps) {
  const species = getSpeciesById(params.id);
  if (!species) {
    return { title: 'Especie No Encontrada' };
  }
  return {
    title: `Editar ${species.name} | Galapagos DataLens`,
  };
}

export default function EditSpeciesPage({ params }: EditSpeciesPageProps) {
  const species = getSpeciesById(params.id);

  if (!species) {
    notFound();
  }

  return (
    <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
          </Link>
        </Button>
        <SpeciesEditForm species={species} />
      </div>
    </RoleBasedGuard>
  );
}

// Enable static generation for edit pages if desired, or server render
export async function generateStaticParams() {
  const { speciesList } = await import('@/lib/species');
  return speciesList.map((species) => ({
    id: species.id,
  }));
}
