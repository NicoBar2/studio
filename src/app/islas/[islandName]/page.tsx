
import { getSpeciesListAction } from '@/app/actions';
import SpeciesCard from '@/components/species/SpeciesCard';
import type { Species } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPinIcon } from 'lucide-react';

type IslandPageProps = {
  params: { islandName: string };
};

export default async function IslandPage({ params }: IslandPageProps) {
  const islandName = decodeURIComponent(params.islandName);
  const allSpecies = await getSpeciesListAction();
  
  const islandKey = `is_${islandName.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species;
  
  const filteredSpecies = allSpecies.filter(species => species[islandKey]);

  return (
    <div className="space-y-8">
        <div>
            <Button variant="outline" asChild className="mb-6">
                <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al mapa
                </Link>
            </Button>

            <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
                <MapPinIcon className="mr-3 h-8 w-8" /> 
                Especies en la Isla {islandName}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Explora la fauna y flora representativa encontrada en la Isla {islandName}.
            </p>
        </div>


        {filteredSpecies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecies.map((species) => (
              <SpeciesCard key={species.id} species={species} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg font-medium text-foreground">
              No se encontraron especies destacadas para la Isla {islandName} en nuestra base de datos.
            </p>
          </div>
        )}
      
    </div>
  );
}
