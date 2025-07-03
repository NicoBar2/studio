"use client";

import { useEffect, useState, useMemo } from 'react';
import type { Species } from '@/lib/types';
import { getSpeciesListAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart, FileSearch, ArrowLeft, Filter, FilterX } from 'lucide-react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const SpeciesComparisonChart = dynamic(() => import('@/components/charts/SpeciesComparisonChart'), {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    ),
    ssr: false
});

export default function ComparePage() {
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<string[]>([]);
    
    const [familyFilter, setFamilyFilter] = useState('');
    const [yearFilter, setYearFilter] = useState<{ min: string; max: string }>({ min: '', max: '' });


    useEffect(() => {
        const fetchSpecies = async () => {
            setIsLoading(true);
            const data = await getSpeciesListAction();
            setAllSpecies(data);
            setIsLoading(false);
        };
        fetchSpecies();
    }, []);
    
    const uniqueFamilies = useMemo(() => {
        const families = new Set<string>();
        allSpecies.forEach(s => {
            if (s.historicalData && s.historicalData.length > 0 && s.family) {
                families.add(s.family);
            }
        });
        return Array.from(families).sort();
    }, [allSpecies]);

    const speciesByUnit = useMemo(() => {
        const grouped: { [unit: string]: Species[] } = {};
        let speciesToFilter = allSpecies;
        
        if (familyFilter) {
            speciesToFilter = speciesToFilter.filter(s => s.family && s.family.toLowerCase() === familyFilter.toLowerCase());
        }

        speciesToFilter.forEach(s => {
            if (s.historicalData && s.historicalData.length > 0) {
                const unit = s.historicalData[0].unit || 'sin unidad';
                if (!grouped[unit]) {
                    grouped[unit] = [];
                }
                grouped[unit].push(s);
            }
        });
        return grouped;
    }, [allSpecies, familyFilter]);


    const handleSpeciesSelection = (speciesId: string) => {
        setSelectedSpeciesIds(prev => {
            const newSelection = prev.includes(speciesId)
                ? prev.filter(id => id !== speciesId)
                : [...prev, speciesId];
            return newSelection;
        });
    };
    
    const clearFilters = () => {
        setFamilyFilter('');
        setYearFilter({ min: '', max: '' });
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
                            Genera tu Consulta
                        </CardTitle>
                        <CardDescription>
                            Usa los filtros para refinar tu búsqueda y luego selecciona las especies a comparar. Las especies se agrupan por la unidad de medida de sus datos históricos (ej. "individuos", "parejas reproductoras").
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-headline text-lg font-semibold flex items-center">
                                <Filter className="mr-2 h-5 w-5" />
                                Filtros de Búsqueda
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="familyFilter">Filtrar por Familia</Label>
                                    <Select
                                        value={familyFilter}
                                        onValueChange={(value) => setFamilyFilter(value === 'all' ? '' : value)}
                                    >
                                        <SelectTrigger id="familyFilter" className="bg-input">
                                            <SelectValue placeholder="Seleccionar familia..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las familias</SelectItem>
                                            {uniqueFamilies.map(family => (
                                                <SelectItem key={family} value={family}>
                                                    {family}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minYear">Año de Inicio del Filtro</Label>
                                    <Input 
                                        id="minYear" 
                                        type="number" 
                                        placeholder="Ej: 1990" 
                                        value={yearFilter.min}
                                        onChange={(e) => setYearFilter(prev => ({ ...prev, min: e.target.value }))}
                                        className="bg-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxYear">Año Máximo del Filtro</Label>
                                    <Input 
                                        id="maxYear" 
                                        type="number" 
                                        placeholder="Ej: 2023" 
                                        value={yearFilter.max}
                                        onChange={(e) => setYearFilter(prev => ({ ...prev, max: e.target.value }))}
                                        className="bg-input"
                                    />
                                </div>
                            </div>
                             <Button onClick={clearFilters} variant="outline" size="sm">
                                <FilterX className="mr-2 h-4 w-4" /> Limpiar Filtros
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {isLoading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : Object.keys(speciesByUnit).length > 0 ? (
                                Object.entries(speciesByUnit).map(([unit, speciesInUnit]) => (
                                    <div key={unit} className="space-y-4 rounded-lg border p-4">
                                        <h3 className="font-headline text-xl text-primary flex items-center">
                                          <BarChart className="mr-2 h-6 w-6" /> Comparación por: {unit}
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                            <div className="lg:col-span-1">
                                                <h4 className="font-semibold mb-2 text-foreground">Seleccionar Especies</h4>
                                                <ScrollArea className="h-72 rounded-md border p-4 bg-input/50">
                                                    <div className="space-y-2">
                                                        {speciesInUnit.map(s => (
                                                            <div key={s.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`compare-${unit}-${s.id}`}
                                                                    checked={selectedSpeciesIds.includes(s.id)}
                                                                    onCheckedChange={() => handleSpeciesSelection(s.id)}
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
                                                {selectedSpeciesIds.filter(id => speciesInUnit.some(s => s.id === id)).length > 0 ? (
                                                    <SpeciesComparisonChart 
                                                        species={allSpecies.filter(s => selectedSpeciesIds.includes(s.id) && speciesInUnit.some(siu => siu.id === s.id))}
                                                        yearFilter={yearFilter}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed rounded-lg bg-muted/50">
                                                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                                                        <p className="text-lg font-medium text-center text-muted-foreground">Selecciona al menos una especie de la lista para visualizar el gráfico.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">No hay especies con datos históricos que coincidan con los filtros aplicados.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
