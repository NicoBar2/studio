
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { Species } from '@/lib/types';
import { getSpeciesListAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart, FileSearch } from 'lucide-react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SpeciesComparisonChart = dynamic(() => import('@/components/charts/SpeciesComparisonChart'), {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    ),
    ssr: false
});

type GroupedSpecies = {
    [unit: string]: Species[];
};

export default function ComparePage() {
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<{[unit: string]: string[]}>({});

    useEffect(() => {
        const fetchSpecies = async () => {
            setIsLoading(true);
            const data = await getSpeciesListAction();
            setAllSpecies(data);
            setIsLoading(false);
        };
        fetchSpecies();
    }, []);

    const groupedSpecies = useMemo<GroupedSpecies>(() => {
        const groups: GroupedSpecies = {};
        allSpecies.forEach(s => {
            if (s.historicalData && s.historicalData.length > 0) {
                const unit = s.historicalData[0].unit || 'sin unidad';
                if (!groups[unit]) {
                    groups[unit] = [];
                }
                groups[unit].push(s);
            }
        });
        return groups;
    }, [allSpecies]);

    const handleSpeciesSelection = (unit: string, speciesId: string) => {
        setSelectedSpeciesIds(prev => {
            const currentSelection = prev[unit] || [];
            const newSelection = currentSelection.includes(speciesId)
                ? currentSelection.filter(id => id !== speciesId)
                : [...currentSelection, speciesId];
            return { ...prev, [unit]: newSelection };
        });
    };

    return (
        <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
            <div className="space-y-6">
                 <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel Principal
                  </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <FileSearch className="mr-3 h-7 w-7" />
                            Análisis Comparativo de Especies
                        </CardTitle>
                        <CardDescription>
                            Selecciona especies con la misma unidad de medida para comparar sus datos históricos en un solo gráfico.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {isLoading ? (
                    <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
                ) : Object.keys(groupedSpecies).length > 0 ? (
                    Object.entries(groupedSpecies).map(([unit, speciesInGroup]) => (
                        <Card key={unit} className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl font-headline text-primary flex items-center">
                                    <BarChart className="mr-2 h-6 w-6" /> Comparación por: {unit}
                                </CardTitle>
                                <CardDescription>
                                    Selecciona dos o más especies para comparar sus datos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1">
                                    <h4 className="font-semibold mb-2 text-foreground">Seleccionar Especies</h4>
                                    <ScrollArea className="h-72 rounded-md border p-4 bg-input/50">
                                        <div className="space-y-2">
                                            {speciesInGroup.map(s => (
                                                <div key={s.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`compare-${unit}-${s.id}`}
                                                        checked={(selectedSpeciesIds[unit] || []).includes(s.id)}
                                                        onCheckedChange={() => handleSpeciesSelection(unit, s.id)}
                                                    />
                                                    <Label htmlFor={`compare-${unit}-${s.id}`} className="text-sm font-normal cursor-pointer">
                                                        {s.spanishCommonName}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                                <div className="lg:col-span-3">
                                    {(selectedSpeciesIds[unit] || []).length > 0 ? (
                                        <SpeciesComparisonChart 
                                            species={speciesInGroup.filter(s => (selectedSpeciesIds[unit] || []).includes(s.id))} 
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed rounded-lg bg-muted/50">
                                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                                            <p className="text-lg font-medium text-center text-muted-foreground">Selecciona al menos una especie de la lista para visualizar el gráfico.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <p className="text-muted-foreground">No hay suficientes datos históricos en las especies para realizar comparaciones.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </RoleBasedGuard>
    );
}
