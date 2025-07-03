"use client";

import { useEffect, useState, useMemo, useTransition } from 'react';
import type { Species } from '@/lib/types';
import { getSpeciesListAction, generateComparisonAnalysisAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart, FileSearch, BrainCircuit, Info, ArrowLeft, Filter, FilterX } from 'lucide-react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
    
    // State for AI Analysis
    const [analysis, setAnalysis] = useState<{[unit: string]: string | null}>({});
    const [analysisError, setAnalysisError] = useState<{[unit: string]: string | null}>({});
    const [isAnalysisPending, startAnalysisTransition] = useTransition();

    // State for Filters
    const [genusFilter, setGenusFilter] = useState('');
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
    
    const uniqueGenera = useMemo(() => {
        const genera = new Set<string>();
        allSpecies.forEach(s => {
            if (s.genus) {
                genera.add(s.genus);
            }
        });
        return Array.from(genera).sort();
    }, [allSpecies]);

    const filteredSpecies = useMemo(() => {
        if (!genusFilter) return allSpecies;
        return allSpecies.filter(s => 
            s.genus && s.genus.toLowerCase().includes(genusFilter.toLowerCase())
        );
    }, [allSpecies, genusFilter]);

    const groupedSpecies = useMemo<GroupedSpecies>(() => {
        const groups: GroupedSpecies = {};
        filteredSpecies.forEach(s => {
            if (s.historicalData && s.historicalData.length > 0) {
                const unit = s.historicalData[0].unit || 'sin unidad';
                if (!groups[unit]) {
                    groups[unit] = [];
                }
                groups[unit].push(s);
            }
        });
        return groups;
    }, [filteredSpecies]);

    const handleSpeciesSelection = (unit: string, speciesId: string) => {
        setSelectedSpeciesIds(prev => {
            const currentSelection = prev[unit] || [];
            const newSelection = currentSelection.includes(speciesId)
                ? currentSelection.filter(id => id !== speciesId)
                : [...currentSelection, speciesId];
            
            setAnalysis(prevAnalysis => ({ ...prevAnalysis, [unit]: null }));
            setAnalysisError(prevError => ({ ...prevError, [unit]: null }));

            return { ...prev, [unit]: newSelection };
        });
    };
    
    const handleGenerateAnalysis = (unit: string) => {
        const ids = selectedSpeciesIds[unit];
        if (!ids || ids.length < 2) return;

        startAnalysisTransition(async () => {
            setAnalysis(prev => ({...prev, [unit]: null}));
            setAnalysisError(prev => ({...prev, [unit]: null}));
            const result = await generateComparisonAnalysisAction(ids);
            if (result.analysis) {
                setAnalysis(prev => ({...prev, [unit]: result.analysis}));
            } else {
                setAnalysisError(prev => ({...prev, [unit]: result.error || "Ocurrió un error desconocido."}));
            }
        });
    }

    const clearFilters = () => {
        setGenusFilter('');
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
                            Selecciona especies con la misma unidad de medida para comparar sus datos históricos. Luego, genera una consulta con IA para obtener una interpretación de los datos.
                        </CardDescription>
                    </CardHeader>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl font-headline text-primary">
                            <Filter className="mr-2 h-6 w-6" /> Filtros de Búsqueda
                        </CardTitle>
                        <CardDescription>
                            Refina la lista de especies o el rango de fechas para tu análisis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="genusFilter">Filtrar por Género</Label>
                                <Select
                                    value={genusFilter}
                                    onValueChange={(value) => setGenusFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger id="genusFilter" className="bg-input">
                                        <SelectValue placeholder="Seleccionar género..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los géneros</SelectItem>
                                        {uniqueGenera.map(genus => (
                                            <SelectItem key={genus} value={genus}>
                                                {genus}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minYear">Año Mínimo del Gráfico</Label>
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
                                <Label htmlFor="maxYear">Año Máximo del Gráfico</Label>
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
                        <Button onClick={clearFilters} variant="outline">
                            <FilterX className="mr-2 h-4 w-4" /> Limpiar Filtros
                        </Button>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
                ) : Object.keys(groupedSpecies).length > 0 ? (
                    Object.entries(groupedSpecies).map(([unit, speciesInGroup]) => {
                        const selectedIds = selectedSpeciesIds[unit] || [];
                        const currentAnalysis = analysis[unit];
                        const currentError = analysisError[unit];
                        
                        return (
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
                                                        checked={selectedIds.includes(s.id)}
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
                                    {selectedIds.length > 0 ? (
                                        <SpeciesComparisonChart 
                                            species={speciesInGroup.filter(s => selectedIds.includes(s.id))}
                                            yearFilter={yearFilter}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed rounded-lg bg-muted/50">
                                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                                            <p className="text-lg font-medium text-center text-muted-foreground">Selecciona al menos una especie de la lista para visualizar el gráfico.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            
                            <CardContent>
                                <div className="space-y-4 pt-4 border-t">
                                     <h3 className="text-lg font-semibold flex items-center text-primary">
                                        <BrainCircuit className="mr-2 h-5 w-5" /> Consulta Comparativa con IA
                                    </h3>
                                    <Button
                                        onClick={() => handleGenerateAnalysis(unit)}
                                        disabled={selectedIds.length < 2 || isAnalysisPending}
                                    >
                                        {isAnalysisPending ? 'Generando...' : 'Generar Consulta'}
                                    </Button>

                                    {isAnalysisPending && (
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-4/5" />
                                        </div>
                                    )}

                                    {currentError && (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{currentError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {currentAnalysis && (
                                        <Alert>
                                            <Info className="h-4 w-4"/>
                                            <AlertTitle>Consulta Generada</AlertTitle>
                                            <AlertDescription className="prose prose-sm max-w-none text-foreground leading-relaxed">
                                                {currentAnalysis.split('\n').map((paragraph, index) => (
                                                    <p key={index}>{paragraph}</p>
                                                ))}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    
                                    {selectedIds.length < 2 && !currentAnalysis && !isAnalysisPending && (
                                        <p className="text-sm text-muted-foreground">
                                            Por favor, selecciona al menos dos especies para generar una consulta comparativa.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <p className="text-muted-foreground">No hay especies que coincidan con los filtros aplicados.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </RoleBasedGuard>
    );
}
