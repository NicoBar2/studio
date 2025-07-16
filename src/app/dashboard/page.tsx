
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type Species } from '@/lib/types';
import { getSpeciesListAction } from '@/app/actions';
import { 
  Edit3, BarChart3, Turtle, Bird, Footprints, ShieldQuestion, Waves, Bug, type LucideIcon, 
  HelpCircle, BrainCircuit, MapPinIcon, ListIcon, InfoIcon, SearchIcon 
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import DeleteSpeciesButton from '@/components/dashboard/DeleteSpeciesButton';
import { Badge } from '@/components/ui/badge';
import GalapagosMap from '@/components/map/GalapagosMap';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const iconMap: Record<string, LucideIcon> = {
  Turtle,
  Bird,
  Footprints,
  ShieldQuestion,
  Waves,
  Bug,
  Default: HelpCircle,
};

export default function DashboardPage() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for map and filters
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchSpecies = async () => {
      setIsLoading(true);
      const data = await getSpeciesListAction();
      setSpeciesList(data);
      setIsLoading(false);
    };
    fetchSpecies();
  }, []);

  const handleIslandClick = (islandName: string) => {
    setSelectedIsland(prev => prev === islandName ? null : islandName);
  };

  const clearSelection = () => {
    setSelectedIsland(null);
    setSearchTerm('');
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
        t.getSpeciesName(species).toLowerCase().includes(lowercasedTerm) ||
        (species.genus && species.specificEpithet && `${species.genus} ${species.specificEpithet}`.toLowerCase().includes(lowercasedTerm)) ||
        species.habitat.toLowerCase().includes(lowercasedTerm)
      );
    }
    return filteredSpecies.sort((a,b) => t.getSpeciesName(a).localeCompare(t.getSpeciesName(b)));
  }, [speciesList, selectedIsland, searchTerm, t]);

  const handleSpeciesDeleted = (deletedId: string) => {
    setSpeciesList(currentList => currentList.filter(s => s.id !== deletedId));
  };


  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">
          {t.dashboard_welcome}, {role === 'admin' ? t.role_admin : t.role_researcher}!
        </h1>
        <p className="text-lg text-foreground">
          {t.dashboard_description}
        </p>
      </section>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">
                {t.dashboard_map_title}
              </CardTitle>
              <CardDescription>
                {t.dashboard_map_description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GalapagosMap onIslandClick={handleIslandClick} selectedIsland={selectedIsland} />
          </div>
          <div className="lg:col-span-1 space-y-4">
             <div className="space-y-2">
                <Label htmlFor="island-filter">{t.dashboard_filter_island}</Label>
                <Select
                  value={selectedIsland || ''}
                  onValueChange={(value) => {
                    setSelectedIsland(value === 'all-islands' ? null : value);
                  }}
                >
                  <SelectTrigger id="island-filter" className="w-full bg-input">
                    <SelectValue placeholder={t.dashboard_select_island_placeholder} />
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
              <div className="space-y-2">
                  <Label htmlFor="search-filter">{t.dashboard_search_label}</Label>
                  <div className="relative w-full">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                          id="search-filter"
                          type="search"
                          placeholder={t.dashboard_search_placeholder}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-input"
                      />
                  </div>
              </div>
              <Button onClick={clearSelection} variant="outline" className="w-full">
                <ListIcon className="mr-2 h-5 w-5" /> {t.clearFilters}
              </Button>
          </div>
        </CardContent>
      </Card>


      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-headline font-semibold text-primary">
              {selectedIsland ? t.dashboard_species_in(selectedIsland) : t.dashboard_all_species_summary}
              {searchTerm && ` (${t.searchingFor} "${searchTerm}")`}
            </h2>
            {!isLoading && (
              <Badge variant="secondary">{t.dashboard_species_shown(displayedSpecies.length, speciesList.length)}</Badge>
            )}
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : displayedSpecies.length > 0 ? (
            displayedSpecies.map(species => {
              const IconComponent = iconMap[species.icon] || iconMap.Default;
              const scientificName = `${species.genus || ''} ${species.specificEpithet || ''}`.trim();
              return (
                <Card key={species.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {t.getSpeciesName(species)}
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{scientificName}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/edit/${species.id}`}>
                        <Edit3 className="mr-2 h-4 w-4" /> {t.edit}
                      </Link>
                    </Button>
                    {(role === 'researcher' || role === 'admin') && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/visualize/${species.id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" /> {t.viewVisualizations}
                        </Link>
                      </Button>
                    )}
                     <DeleteSpeciesButton
                        speciesId={species.id}
                        speciesName={t.getSpeciesName(species)}
                        onDeleteSuccess={handleSpeciesDeleted}
                      />
                    <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90 sm:ml-auto">
                      <Link href={`/species/${species.id}`}>
                        {t.viewPublicPage}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
             <Card className="text-center py-10 shadow-sm bg-card">
              <CardContent className="flex flex-col items-center">
                <InfoIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">
                  {t.noSpeciesFound}
                </p>
                <p className="text-muted-foreground mt-1">
                  {t.tryDifferentFilters}
                </p>
                <Button onClick={clearSelection} variant="link" className="mt-2">{t.clearAllFilters}</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

    