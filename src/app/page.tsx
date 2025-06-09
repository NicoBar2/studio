
"use client"; 

import { useState, useMemo } from 'react';
import { speciesList, type Species } from '@/lib/species';
import SpeciesCard from '@/components/species/SpeciesCard';
import GalapagosMap from '@/components/map/GalapagosMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPinIcon, ListIcon, InfoIcon, SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


export default function HomePage() {
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleIslandClick = (islandName: string) => {
    setSelectedIsland(islandName);
  };

  const clearSelection = () => {
    setSelectedIsland(null);
  };

  const displayedSpecies = useMemo(() => {
    let filteredSpecies = speciesList;

    if (selectedIsland) {
      filteredSpecies = filteredSpecies.filter(species => 
        species.islands && species.islands.includes(selectedIsland)
      );
    }

    if (searchTerm) {
      filteredSpecies = filteredSpecies.filter(species =>
        species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredSpecies;
  }, [selectedIsland, searchTerm]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
                Explorador Interactivo de Especies de Galápagos
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Selecciona una isla en el mapa para descubrir las especies representativas que allí habitan, o explora todas las especies listadas abajo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <GalapagosMap onIslandClick={handleIslandClick} selectedIsland={selectedIsland} />
          {selectedIsland && (
            <div className="mt-6 text-center">
              <Button onClick={clearSelection} variant="outline" size="lg">
                <ListIcon className="mr-2 h-5 w-5" /> Ver Todas las Especies / Limpiar Selección
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-headline font-semibold text-primary flex items-center">
                {selectedIsland ? (
                    <>
                        <MapPinIcon className="mr-2 h-6 w-6" /> Especies en {selectedIsland}
                    </>
                ) : (
                    <>
                        <ListIcon className="mr-2 h-6 w-6" /> Todas las Especies Representativas
                    </>
                )}
            </h2>
            <div className="relative w-full sm:w-auto sm:max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Buscar especie por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-input"
                />
            </div>
        </div>
         {selectedIsland && displayedSpecies.length > 0 && (
                 <Badge variant="secondary" className="text-sm mb-4 inline-block">
                    {displayedSpecies.length} {displayedSpecies.length === 1 ? 'especie encontrada' : 'especies encontradas'} en {selectedIsland}
                    {searchTerm && ` para "${searchTerm}"`}
                 </Badge>
            )}
        {!selectedIsland && searchTerm && displayedSpecies.length > 0 && (
            <Badge variant="secondary" className="text-sm mb-4 inline-block">
                {displayedSpecies.length} {displayedSpecies.length === 1 ? 'especie encontrada' : 'especies encontradas'} para "{searchTerm}"
            </Badge>
        )}


        {displayedSpecies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSpecies.map((species) => (
              <SpeciesCard key={species.id} species={species} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-10 shadow-sm bg-card">
            <CardContent className="flex flex-col items-center">
              <InfoIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">
                {searchTerm 
                    ? `No se encontraron especies que coincidan con "${searchTerm}"` 
                    : selectedIsland 
                        ? `No se encontraron especies destacadas en ${selectedIsland} en nuestra base de datos actual.` 
                        : 'No hay datos de especies disponibles para mostrar.'
                }
              </p>
              <p className="text-muted-foreground mt-1">
                {selectedIsland && !searchTerm ? 'Intenta seleccionar otra isla o limpia la selección para ver todas las especies.' : 'Intenta con otro término de búsqueda o revisa más tarde.'}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

