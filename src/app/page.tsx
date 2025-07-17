
"use client"; 

import { useState, useMemo, useEffect, useRef } from 'react';
import { type Species } from '@/lib/species';
import { getSpeciesListAction } from '@/app/actions';
import SpeciesCard from '@/components/species/SpeciesCard';
import GalapagosMap from '@/components/map/GalapagosMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPinIcon, ListIcon, InfoIcon, SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';


export default function HomePage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const speciesListRef = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();
  
  useEffect(() => {
    const fetchSpecies = async () => {
      setIsLoading(true);
      const data = await getSpeciesListAction();
      setSpeciesList(data);
      setIsLoading(false);
    };
    fetchSpecies();
  }, []);


  const handleIslandClick = (islandName: string | null) => {
    setSelectedIsland(islandName);
    if(islandName) {
        setTimeout(() => {
          speciesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  };

  const clearSelection = () => {
    setSelectedIsland(null);
  };

  const displayedSpecies = useMemo(() => {
    let filteredSpecies = speciesList;

    if (selectedIsland) {
        const islandKey = `is_${selectedIsland.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species;
        filteredSpecies = filteredSpecies.filter(species => species[islandKey]);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredSpecies = filteredSpecies.filter(species =>
        (species.spanishCommonName.toLowerCase().includes(lowercasedTerm)) ||
        (species.englishCommonName?.toLowerCase().includes(lowercasedTerm)) ||
        (species.genus && species.specificEpithet && `${species.genus} ${species.specificEpithet}`.toLowerCase().includes(lowercasedTerm)) ||
        (species.spanishDescription.toLowerCase().includes(lowercasedTerm)) ||
        (species.englishDescription?.toLowerCase().includes(lowercasedTerm)) ||
        (species.habitat.toLowerCase().includes(lowercasedTerm))
      );
    }
    return filteredSpecies;
  }, [speciesList, selectedIsland, searchTerm]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl font-headline text-primary">
                {t.public_map_title}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                {t.public_map_description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <GalapagosMap onIslandClick={handleIslandClick} selectedIsland={selectedIsland} />
          {selectedIsland && (
            <div className="mt-6 text-center">
              <Button onClick={() => handleIslandClick(null)} variant="outline" size="lg">
                <ListIcon className="mr-2 h-5 w-5" /> {t.public_clear_selection}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <section ref={speciesListRef} className="mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-headline font-semibold text-primary flex items-center">
                {selectedIsland ? (
                    <>
                        <MapPinIcon className="mr-2 h-6 w-6" /> {t.public_species_in(selectedIsland)}
                    </>
                ) : (
                    <>
                        <ListIcon className="mr-2 h-6 w-6" /> {t.public_all_species}
                    </>
                )}
            </h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 items-center">
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedIsland || ''}
                  onValueChange={(value) => {
                    handleIslandClick(value === 'all-islands' ? null : value);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[220px] bg-input">
                    <SelectValue placeholder={t.public_filter_by_island_placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-islands">{t.allIslands}</SelectItem>
                    {GALAPAGOS_ISLANDS_NAMES.sort().map((islandName) => (
                      <SelectItem key={islandName} value={islandName}>
                        {islandName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full sm:w-auto sm:max-w-xs">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                      type="search"
                      placeholder={t.public_search_placeholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-input"
                  />
              </div>
            </div>
        </div>
         {selectedIsland && displayedSpecies.length > 0 && (
                 <Badge variant="secondary" className="text-sm mb-4 inline-block">
                    {t.public_species_found_count(displayedSpecies.length)}
                    {language === 'es' ? ' en ' : ' on '} {selectedIsland}
                    {searchTerm && ` for "${searchTerm}"`}
                 </Badge>
            )}
        {!selectedIsland && searchTerm && displayedSpecies.length > 0 && (
            <Badge variant="secondary" className="text-sm mb-4 inline-block">
                {t.public_species_found_count(displayedSpecies.length)}
                {language === 'es' ? ' para ' : ' for '} "{searchTerm}"
            </Badge>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : displayedSpecies.length > 0 ? (
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
                {searchTerm && selectedIsland 
                    ? t.public_no_results_both(searchTerm, selectedIsland)
                    : searchTerm
                        ? t.public_no_results_search(searchTerm)
                        : selectedIsland 
                            ? t.public_no_results_island(selectedIsland)
                            : t.public_no_results_all
                }
              </p>
              <p className="text-muted-foreground mt-1">
                {t.public_try_different_filters}
              </p>
              { (searchTerm || selectedIsland) &&
                <Button onClick={() => { setSearchTerm(''); setSelectedIsland(null);}} variant="link" className="mt-2">
                  {t.clearAllFilters}
                </Button>
              }
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
