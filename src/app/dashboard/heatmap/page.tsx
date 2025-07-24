
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Layers as HeatmapIcon, SearchIcon, XIcon } from 'lucide-react';
import type { Species } from '@/lib/types';
import { getSpeciesListAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { useLanguage } from '@/contexts/LanguageContext';

// Dynamically import the map component to prevent SSR issues with Leaflet
const HeatmapComponent = dynamic(() => import('@/components/map/HeatmapComponent'), {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false
});

export default function HeatmapPage() {
    const { t } = useLanguage();
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSpecies = async () => {
            setIsLoading(true);
            const speciesData = await getSpeciesListAction();
            setAllSpecies(speciesData.sort((a,b) => t.getSpeciesName(a).localeCompare(t.getSpeciesName(b))));
            setIsLoading(false);
        };
        fetchSpecies();
    }, [t]);

    const handleSelectAll = (select: boolean) => {
        if (select) {
            setSelectedSpeciesIds(filteredSpecies.map(s => s.id));
        } else {
            setSelectedSpeciesIds([]);
        }
    };
    
    const filteredSpecies = useMemo(() => {
        if (!searchTerm) return allSpecies;
        return allSpecies.filter(s => 
            t.getSpeciesName(s).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allSpecies, searchTerm, t]);

    const islandSpeciesCount = useMemo(() => {
        const counts: Record<string, number> = {};
        const selectedSpecies = allSpecies.filter(s => selectedSpeciesIds.includes(s.id));

        selectedSpecies.forEach(species => {
            for (const key in species) {
                if (key.startsWith('is_') && species[key as keyof Species]) {
                    const islandName = key.substring(3).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const standardName = islandName === 'Santa Fe' ? 'Santa Fé' : islandName;
                    counts[standardName] = (counts[standardName] || 0) + 1;
                }
            }
        });
        return counts;
    }, [allSpecies, selectedSpeciesIds]);

    return (
        <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-headline font-bold text-primary flex items-center">
                            <HeatmapIcon className="mr-3 h-7 w-7" />
                            {t.sidebar_heatmap}
                        </h1>
                        <p className="text-muted-foreground">
                            {t.heatmap_description}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t.backToDashboard}
                        </Link>
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Controls Panel */}
                    <Card className="lg:col-span-1 lg:sticky lg:top-24 shadow-lg">
                        <CardHeader>
                            <CardTitle>{t.heatmap_select_species}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder={t.heatmap_search_species}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="link" onClick={() => handleSelectAll(true)} className="p-0 h-auto">{t.heatmap_select_all}</Button>
                                <Button variant="link" onClick={() => handleSelectAll(false)} className="p-0 h-auto">{t.heatmap_clear_selection}</Button>
                            </div>
                            <ScrollArea className="h-[450px] border rounded-md p-2">
                                {isLoading ? (
                                    <div className="space-y-2 p-2">
                                        {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                                    </div>
                                ) : (
                                    filteredSpecies.map(species => (
                                        <div key={species.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted">
                                            <Checkbox
                                                id={`species-${species.id}`}
                                                checked={selectedSpeciesIds.includes(species.id)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedSpeciesIds(prev => 
                                                        checked 
                                                            ? [...prev, species.id] 
                                                            : prev.filter(id => id !== species.id)
                                                    );
                                                }}
                                            />
                                            <Label htmlFor={`species-${species.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                                {t.getSpeciesName(species)}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            <p className="text-sm text-muted-foreground pt-2">
                                {t.heatmap_species_selected(selectedSpeciesIds.length)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Heatmap Display */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-lg">
                            <CardContent className="p-0 h-[600px] rounded-lg overflow-hidden">
                                <HeatmapComponent data={islandSpeciesCount} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleBasedGuard>
    );
}
