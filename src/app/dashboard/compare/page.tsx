
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
import { AlertTriangle, BarChart, FileSearch, ArrowLeft, Filter, FilterX, TableIcon } from 'lucide-react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    const { t } = useLanguage();
    
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

    const filteredSpeciesList = useMemo(() => {
        if (!familyFilter) return allSpecies;
        return allSpecies.filter(s => s.family && s.family.toLowerCase() === familyFilter.toLowerCase());
    }, [allSpecies, familyFilter]);

    const speciesToSelectByUnit = useMemo(() => {
        const grouped: { [unit: string]: Species[] } = {};
        filteredSpeciesList.forEach(s => {
            if (s.historicalData && s.historicalData.length > 0) {
                const unit = s.historicalData[0].unit || t.unitless;
                if (!grouped[unit]) {
                    grouped[unit] = [];
                }
                grouped[unit].push(s);
            }
        });
        return grouped;
    }, [filteredSpeciesList, t]);

    const selectedSpecies = useMemo(() => {
        return allSpecies.filter(s => selectedSpeciesIds.includes(s.id));
    }, [allSpecies, selectedSpeciesIds]);

    const chartsToDisplayByUnit = useMemo(() => {
        const grouped: { [unit: string]: { species: Species[], tableData: any[] } } = {};
        const minYear = yearFilter.min ? parseInt(yearFilter.min, 10) : -Infinity;
        const maxYear = yearFilter.max ? parseInt(yearFilter.max, 10) : Infinity;
    
        selectedSpecies.forEach(s => {
            if (s.historicalData && s.historicalData.length > 0) {
                const unit = s.historicalData[0].unit || t.unitless;
                if (!grouped[unit]) {
                    grouped[unit] = { species: [], tableData: [] };
                }
                if (!grouped[unit].species.some(sp => sp.id === s.id)) {
                    grouped[unit].species.push(s);
                }
            }
        });
    
        for (const unit in grouped) {
            const speciesInGroup = grouped[unit].species;
            const allYears = new Set<number>();
            speciesInGroup.forEach(s => {
                s.historicalData.forEach(p => {
                    if (p.year >= minYear && p.year <= maxYear) {
                        allYears.add(p.year);
                    }
                });
            });
            const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    
            grouped[unit].tableData = sortedYears.map(year => {
                const row: { [key: string]: any } = { year };
                speciesInGroup.forEach(s => {
                    const dataPoint = s.historicalData.find(p => p.year === year);
                    row[s.id] = dataPoint?.value ?? 'N/A';
                });
                return row;
            });
        }
        return grouped;
    }, [selectedSpecies, yearFilter, t]);


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
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-headline font-bold text-primary flex items-center">
                            <FileSearch className="mr-3 h-7 w-7" />
                            {t.compare_title}
                        </h1>
                        <p className="text-muted-foreground">
                            {t.compare_description}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t.backToDashboard}
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* LEFT PANE: CONTROLS */}
                    <Card className="lg:col-span-1 lg:sticky lg:top-24 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="mr-2 h-5 w-5" />
                                {t.compare_filters_title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="familyFilter">{t.compare_filter_family}</Label>
                                <Select
                                    value={familyFilter}
                                    onValueChange={(value) => setFamilyFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger id="familyFilter" className="bg-input">
                                        <SelectValue placeholder={t.compare_filter_family_placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t.compare_filter_family_all}</SelectItem>
                                        {uniqueFamilies.map(family => (
                                            <SelectItem key={family} value={family}>
                                                {family}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t.compare_filter_year}</Label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder={t.startYear} 
                                        value={yearFilter.min}
                                        onChange={(e) => setYearFilter(prev => ({ ...prev, min: e.target.value }))}
                                        className="bg-input"
                                        aria-label={t.startYearAria}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input 
                                        type="number" 
                                        placeholder={t.endYear} 
                                        value={yearFilter.max}
                                        onChange={(e) => setYearFilter(prev => ({ ...prev, max: e.target.value }))}
                                        className="bg-input"
                                        aria-label={t.endYearAria}
                                    />
                                </div>
                            </div>
                            <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
                                <FilterX className="mr-2 h-4 w-4" /> {t.clearFilters}
                            </Button>

                            <hr className="my-4 border-border" />

                            <div className="space-y-2">
                                <Label>{t.compare_select_species}</Label>
                                <ScrollArea className="h-80 rounded-md border p-2">
                                    {isLoading ? (
                                        <div className="p-2 space-y-2">
                                            <Skeleton className="h-6 w-full" />
                                            <Skeleton className="h-6 w-full" />
                                            <Skeleton className="h-6 w-4/5" />
                                        </div>
                                    ) : Object.keys(speciesToSelectByUnit).length === 0 ? (
                                        <div className="text-center text-sm text-muted-foreground p-4">
                                            {t.compare_no_species_match}
                                        </div>
                                    ) : (
                                     Object.entries(speciesToSelectByUnit).map(([unit, speciesList]) => (
                                         <div key={unit}>
                                             <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider px-2 py-2">{unit}</h4>
                                             <div className="space-y-1">
                                                {speciesList.map(s => (
                                                    <div key={s.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-muted">
                                                        <Checkbox
                                                            id={`select-${s.id}`}
                                                            checked={selectedSpeciesIds.includes(s.id)}
                                                            onCheckedChange={() => handleSpeciesSelection(s.id)}
                                                        />
                                                        <Label htmlFor={`select-${s.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                                            {t.getSpeciesName(s)}
                                                        </Label>
                                                    </div>
                                                ))}
                                             </div>
                                         </div>
                                     ))
                                    )}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT PANE: CHARTS & TABLES */}
                    <div className="lg:col-span-3 space-y-6">
                        {isLoading ? (
                            <Skeleton className="h-[400px] w-full" />
                        ) : Object.keys(chartsToDisplayByUnit).length === 0 ? (
                             <Card className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed bg-muted/30">
                                <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">{t.compare_chart_placeholder_title}</h3>
                                <p className="text-muted-foreground mt-2">{t.compare_chart_placeholder_desc}</p>
                             </Card>
                         ) : (
                             Object.entries(chartsToDisplayByUnit).map(([unit, { species, tableData }]) => (
                                 <Card key={unit} className="shadow-lg">
                                     <CardHeader>
                                         <CardTitle className="flex items-center text-primary">
                                            <BarChart className="mr-2 h-6 w-6" /> 
                                            {t.compare_chart_title_prefix} {unit}
                                        </CardTitle>
                                     </CardHeader>
                                     <CardContent className="space-y-4">
                                         <SpeciesComparisonChart species={species} yearFilter={yearFilter} />
                                        
                                         <div>
                                            <h4 className="font-semibold text-lg flex items-center mb-2">
                                                <TableIcon className="mr-2 h-5 w-5" />
                                                {t.visualize_table_title}
                                            </h4>
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>{t.year}</TableHead>
                                                            {species.map(s => (
                                                                <TableHead key={s.id} className="text-right">{t.getSpeciesName(s)}</TableHead>
                                                            ))}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {tableData.map(row => (
                                                            <TableRow key={row.year}>
                                                                <TableCell className="font-medium">{row.year}</TableCell>
                                                                {species.map(s => (
                                                                    <TableCell key={s.id} className="text-right">
                                                                        {typeof row[s.id] === 'number' ? row[s.id].toLocaleString() : row[s.id]}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                         </div>
                                     </CardContent>
                                 </Card>
                             ))
                         )}
                    </div>
                </div>
            </div>
        </RoleBasedGuard>
    );
}
