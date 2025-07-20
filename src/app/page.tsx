
"use client"; 

import { useState, useMemo, useEffect, useRef } from 'react';
import { type Species } from '@/lib/types';
import { getSpeciesListAction } from '@/app/actions';
import SpeciesCard from '@/components/species/SpeciesCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPinIcon, ListIcon, InfoIcon, SearchIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), {
  loading: () => <Skeleton className="h-[500px] w-full" />,
  ssr: false
});

export default function HomePage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const speciesListRef = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();
  const router = useRouter();
  
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
    if (islandName) {
      router.push(`/islas/${encodeURIComponent(islandName)}`);
    }
  };

  const displayedSpecies = useMemo(() => {
    let filteredSpecies = speciesList;

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
    return filteredSpecies.sort((a,b) => t.getSpeciesName(a).localeCompare(t.getSpeciesName(b)));
  }, [speciesList, searchTerm, t]);

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
        <CardContent className="p-0 md:p-0 h-[500px] w-full">
           <InteractiveMap onIslandClick={handleIslandClick} />
        </CardContent>
      </Card>

      <section ref={speciesListRef} className="mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-headline font-semibold text-primary flex items-center">
                <ListIcon className="mr-2 h-6 w-6" /> {t.public_all_species}
            </h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 items-center">
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
                {t.public_no_results_search(searchTerm)}
              </p>
              <p className="text-muted-foreground mt-1">
                {t.public_try_different_filters}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
