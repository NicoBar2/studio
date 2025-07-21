
import { getSpeciesByIdAction } from '@/app/actions';
import SpeciesEditForm from '@/components/species/SpeciesEditForm';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTranslations } from '@/lib/translations';

type EditSpeciesPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: EditSpeciesPageProps) {
    const t = getTranslations('es'); // Default language for metadata
    const species = await getSpeciesByIdAction(params.id);
    if (!species) {
        return {
            title: t.speciesNotFound
        }
    }
    return {
        title: `${t.edit} ${t.getSpeciesName(species)} | Galápagos DataLens`
    }
}

export default async function EditSpeciesPage({ params }: EditSpeciesPageProps) {
  const species = await getSpeciesByIdAction(params.id);
  const t = getTranslations('es'); // Or detect locale

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
