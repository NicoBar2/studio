
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Layers as HeatmapIcon, Search as SearchIcon, XIcon, Info, Table } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Dynamically import the map component to prevent SSR issues with Leaflet
const HeatmapComponent = dynamic(() => import('@/components/map/HeatmapComponent'), {
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false
});

const Legend = ({ maxCount }: { maxCount: number }) => {
    const { t } = useLanguage();
    if (maxCount === 0) return null;
    return (
        <div className="p-2 space-y-2">
            <h4 className="font-semibold text-center text-sm">{t.species}</h4>
            <div className="w-full h-4 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded-md" />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{Math.round(maxCount / 2)}</span>
                <span>{maxCount}</span>
            </div>
        </div>
    );
};


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

    const filteredSpecies = useMemo(() => {
        if (!searchTerm) return allSpecies;
        return allSpecies.filter(s => 
            t.getSpeciesName(s).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allSpecies, searchTerm, t]);
    
    const handleSelectAll = useCallback(() => {
        setSelectedSpeciesIds(filteredSpecies.map(s => s.id));
    }, [filteredSpecies]);
    
    const handleClearSelection = () => {
        setSelectedSpeciesIds([]);
    };

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

    const sortedIslandData = useMemo(() => {
        return Object.entries(islandSpeciesCount)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a);
    }, [islandSpeciesCount]);

    const maxCount = useMemo(() => {
        const counts = Object.values(islandSpeciesCount);
        return counts.length > 0 ? Math.max(...counts) : 0;
    }, [islandSpeciesCount]);


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
                    <Card className="lg:col-span-1 lg:sticky lg:top-24 shadow-lg z-10">
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
                            <div className="flex justify-between items-center text-sm">
                                <Button variant="link" onClick={handleSelectAll} className="p-0 h-auto">{t.heatmap_select_all}</Button>
                                <Button variant="link" onClick={handleClearSelection} className="p-0 h-auto">{t.heatmap_clear_selection}</Button>
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
                            <div className="flex justify-end pt-2">
                                <Badge variant="secondary">
                                    {t.heatmap_species_selected(selectedSpeciesIds.length)}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-3 space-y-6">
                        <Card className="shadow-lg">
                            <CardContent className="p-0 h-[600px] rounded-lg overflow-hidden">
                                <HeatmapComponent data={islandSpeciesCount} />
                            </CardContent>
                        </Card>
                        
                         <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center">
                                    <Table className="mr-2 h-5 w-5" />
                                    Leyenda y Datos de Distribución
                                </CardTitle>
                                <CardDescription>
                                    Recuento de las especies seleccionadas por isla y leyenda de color del mapa.
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <div className="border rounded-lg overflow-hidden">
                                         <UiTable>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Isla</TableHead>
                                                    <TableHead className="text-right">Nº de Especies</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedIslandData.length > 0 ? (
                                                    sortedIslandData.map(([island, count]) => (
                                                        <TableRow key={island}>
                                                            <TableCell className="font-medium">{island}</TableCell>
                                                            <TableCell className="text-right">{count}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                                                           {selectedSpeciesIds.length > 0 ? "No hay datos para las especies seleccionadas" : "Selecciona una o más especies"}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </UiTable>
                                    </div>
                                </div>
                                <div className="md:col-span-1 border rounded-lg p-4 flex flex-col justify-center">
                                    <Legend maxCount={maxCount} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleBasedGuard>
    );
}
