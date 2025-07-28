
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Species, ConservationStatus } from '@/lib/types';
import { getSpeciesListAction } from '@/app/actions';
import { useLanguage } from '@/contexts/LanguageContext';
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, Edit, ExternalLink, ListChecks, Search } from 'lucide-react';
import Link from 'next/link';

type SortKey = 'spanishCommonName' | 'family' | 'iucnStatus' | 'createdAt';

const CONSERVATION_STATUSES: ConservationStatus[] = [
    'En Peligro Crítico', 'En Peligro', 'Vulnerable', 'Casi Amenazada', 
    'Preocupación Menor', 'Datos Insuficientes'
];

export default function SpeciesCatalogPage() {
    const { t } = useLanguage();
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [familyFilter, setFamilyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [islandFilter, setIslandFilter] = useState('');

    // Sorting states
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
            if (s.family) families.add(s.family);
        });
        return Array.from(families).sort();
    }, [allSpecies]);

    const filteredAndSortedSpecies = useMemo(() => {
        let filtered = allSpecies.filter(s => {
            const lowerSearch = searchTerm.toLowerCase();
            const nameMatch = lowerSearch === '' || 
                              s.spanishCommonName.toLowerCase().includes(lowerSearch) || 
                              (s.englishCommonName || '').toLowerCase().includes(lowerSearch) ||
                              (s.genus && s.specificEpithet && `${s.genus} ${s.specificEpithet}`.toLowerCase().includes(lowerSearch));
            
            const familyMatch = !familyFilter || (s.family && s.family === familyFilter);
            const statusMatch = !statusFilter || s.iucnStatus === statusFilter;
            
            let islandMatch = true;
            if (islandFilter) {
                const islandKey = `is_${islandFilter.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}` as keyof Species;
                islandMatch = !!s[islandKey];
            }

            return nameMatch && familyMatch && statusMatch && islandMatch;
        });

        return filtered.sort((a, b) => {
            const aVal = a[sortKey] || '';
            const bVal = b[sortKey] || '';
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    }, [allSpecies, searchTerm, familyFilter, statusFilter, islandFilter, sortKey, sortDirection]);

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
                        Explora, filtra y gestiona la base de datos completa de especies. Haz clic en las cabeceras para ordenar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                         <Select value={familyFilter} onValueChange={setFamilyFilter}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por Familia" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todas las Familias</SelectItem>
                                {uniqueFamilies.map(family => <SelectItem key={family} value={family}>{family}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por Estado UICN" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todos los Estados</SelectItem>
                                {CONSERVATION_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={islandFilter} onValueChange={setIslandFilter}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por Isla" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todas las Islas</SelectItem>
                                {GALAPAGOS_ISLANDS_NAMES.sort().map(island => <SelectItem key={island} value={island}>{island}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('spanishCommonName')}>
                                        <div className="flex items-center gap-2">Nombre Común {renderSortArrow('spanishCommonName')}</div>
                                    </TableHead>
                                    <TableHead>Nombre Científico</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('family')}>
                                        <div className="flex items-center gap-2">Familia {renderSortArrow('family')}</div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('iucnStatus')}>
                                        <div className="flex items-center gap-2">Estado UICN {renderSortArrow('iucnStatus')}</div>
                                    </TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredAndSortedSpecies.length > 0 ? (
                                    filteredAndSortedSpecies.map(species => (
                                        <TableRow key={species.id}>
                                            <TableCell className="font-medium">{species.spanishCommonName}</TableCell>
                                            <TableCell className="italic text-muted-foreground">{`${species.genus || ''} ${species.specificEpithet || ''}`.trim() || 'N/A'}</TableCell>
                                            <TableCell>{species.family || 'N/A'}</TableCell>
                                            <TableCell><Badge variant="secondary">{species.iucnStatus}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button asChild variant="outline" size="sm-icon" title="Editar Especie">
                                                    <Link href={`/dashboard/edit/${species.id}`}><Edit className="h-4 w-4" /></Link>
                                                </Button>
                                                <Button asChild variant="ghost" size="sm-icon" title="Ver Página Pública">
                                                    <Link href={`/species/${species.id}`}><ExternalLink className="h-4 w-4" /></Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
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
