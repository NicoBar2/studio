
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Species, ConservationStatus } from '@/lib/types';
import { getAllSpeciesFromFirestoreAction } from '@/app/actions';
import { useLanguage } from '@/contexts/LanguageContext';
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, Edit, ExternalLink, ListChecks } from 'lucide-react';
import Link from 'next/link';

type SortKey = 'spanishCommonName' | 'family' | 'iucnStatus' | 'createdAt' | 'kingdom' | 'phylum' | 'class' | 'order' | 'genus';

export default function SpeciesCatalogPage() {
    const { t } = useLanguage();
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtering states
    const [islandFilter, setIslandFilter] = useState('');

    // Sorting states
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchSpecies = async () => {
            setIsLoading(true);
            const data = await getAllSpeciesFromFirestoreAction();
            setAllSpecies(data);
            setIsLoading(false);
        };
        fetchSpecies();
    }, []);

    const filteredAndSortedSpecies = useMemo(() => {
        let filtered = allSpecies.filter(s => {
            if (!islandFilter) return true;
            
            const islandKey = `is_${islandFilter.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species;
            return !!s[islandKey];
        });

        return filtered.sort((a, b) => {
            const aVal = a[sortKey] || '';
            const bVal = b[sortKey] || '';
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    }, [allSpecies, islandFilter, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const renderSortArrow = (key: SortKey) => {
        if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
        return sortDirection === 'asc' 
            ? <ArrowUpDown className="h-4 w-4" data-test-id="asc-arrow" /> 
            : <ArrowUpDown className="h-4 w-4 transform rotate-180" data-test-id="desc-arrow" />;
    };


    return (
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-3xl font-headline text-primary">
                        <ListChecks className="mr-3 h-8 w-8" />
                        Catálogo de Especies
                    </CardTitle>
                    <CardDescription>
                        Explora, filtra y gestiona la base de datos completa de especies. Haz clic en las cabeceras para ordenar. La tabla es desplazable horizontalmente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Select value={islandFilter} onValueChange={(value) => setIslandFilter(value === 'all' ? '' : value)}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por Isla" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Islas</SelectItem>
                                {GALAPAGOS_ISLANDS_NAMES.sort().map(island => <SelectItem key={island} value={island}>{island}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-md overflow-x-auto">
                        <Table className="min-w-max">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer hover:bg-muted sticky left-0 bg-card z-10 w-[250px]" onClick={() => handleSort('spanishCommonName')}>
                                        <div className="flex items-center gap-2">Nombre Común {renderSortArrow('spanishCommonName')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted w-[150px]" onClick={() => handleSort('kingdom')}>
                                        <div className="flex items-center gap-2">Reino {renderSortArrow('kingdom')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted w-[150px]" onClick={() => handleSort('phylum')}>
                                        <div className="flex items-center gap-2">Filo {renderSortArrow('phylum')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted w-[150px]" onClick={() => handleSort('class')}>
                                        <div className="flex items-center gap-2">Clase {renderSortArrow('class')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted w-[150px]" onClick={() => handleSort('order')}>
                                        <div className="flex items-center gap-2">Orden {renderSortArrow('order')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted w-[150px]" onClick={() => handleSort('family')}>
                                        <div className="flex items-center gap-2">Familia {renderSortArrow('family')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted w-[150px]" onClick={() => handleSort('genus')}>
                                        <div className="flex items-center gap-2">Género {renderSortArrow('genus')}</div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredAndSortedSpecies.length > 0 ? (
                                    filteredAndSortedSpecies.map(species => (
                                        <TableRow key={species.id}>
                                            <TableCell className="font-medium sticky left-0 bg-card z-10">{species.spanishCommonName}</TableCell>
                                            <TableCell>{species.kingdom || 'N/A'}</TableCell>
                                            <TableCell>{species.phylum || 'N/A'}</TableCell>
                                            <TableCell>{species.class || 'N/A'}</TableCell>
                                            <TableCell>{species.order || 'N/A'}</TableCell>
                                            <TableCell>{species.family || 'N/A'}</TableCell>
                                            <TableCell className="italic">{species.genus || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            No se encontraron especies que coincidan con los filtros.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
