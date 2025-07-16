
"use client"; 

import { type Species, type HistoricalDataPoint } from '@/lib/types';
import { getSpeciesByIdAction } from '@/app/actions';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, MinusSquare, Filter, FilterX, TableIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const SpeciesDataChart = dynamic(() => import('@/components/charts/SpeciesDataChart'), {
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center">
      <Skeleton className="h-full w-full" />
    </div>
  ),
  ssr: false
});

type VisualizeSpeciesPageProps = {
  params: { id: string };
};


export default function VisualizeSpeciesPage({ params }: VisualizeSpeciesPageProps) {
  const [species, setSpecies] = useState<Species | null | undefined>(undefined);
  const { isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  const [yearFilter, setYearFilter] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [valueFilter, setValueFilter] = useState<{ min: string; max: string }>({ min: '', max: '' });
  

  useEffect(() => {
    const fetchSpeciesData = async () => {
        const foundSpecies = await getSpeciesByIdAction(params.id);
        setSpecies(foundSpecies);
        if (foundSpecies) {
          document.title = `${t.visualize_title_prefix} ${t.getSpeciesName(foundSpecies)} | Galápagos DataLens`;
        } else if (foundSpecies === null) {
          document.title = `${t.speciesNotFound} | Galápagos DataLens`;
        }
    };
    fetchSpeciesData();
  }, [params.id, t]);


  const filteredHistoricalData = useMemo(() => {
    if (!species?.historicalData) return [];
    return species.historicalData.filter(point => {
      const minYear = yearFilter.min !== '' ? parseInt(yearFilter.min) : -Infinity;
      const maxYear = yearFilter.max !== '' ? parseInt(yearFilter.max) : Infinity;
      const minValue = valueFilter.min !== '' ? parseFloat(valueFilter.min) : -Infinity;
      const maxValue = valueFilter.max !== '' ? parseFloat(valueFilter.max) : Infinity;

      const yearPass = (!isNaN(minYear) ? point.year >= minYear : true) &&
                       (!isNaN(maxYear) ? point.year <= maxYear : true);
      const valuePass = (!isNaN(minValue) ? point.value >= minValue : true) &&
                        (!isNaN(maxValue) ? point.value <= maxValue : true);
      return yearPass && valuePass;
    }).sort((a, b) => a.year - b.year); 
  }, [species?.historicalData, yearFilter, valueFilter]);


  const getHistoricalStats = (data: HistoricalDataPoint[]) => {
    if (!data || data.length === 0) {
      return null;
    }

    const values = data.map(d => d.value);
    const maxPoint = data.reduce((max, p) => p.value > max.value ? p : max, data[0]);
    const minPoint = data.reduce((min, p) => p.value < min.value ? p : min, data[0]);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      maxPoint,
      minPoint,
      average: parseFloat(average.toFixed(2)),
      unit: data[0]?.unit || '',
    };
  };

  const stats = filteredHistoricalData.length > 0
    ? getHistoricalStats(filteredHistoricalData)
    : null;

  const handleFilterChange = (
    filterType: 'year' | 'value',
    boundary: 'min' | 'max',
    inputValue: string
  ) => {
    if (filterType === 'year') {
      setYearFilter(prev => ({ ...prev, [boundary]: inputValue }));
    } else {
      setValueFilter(prev => ({ ...prev, [boundary]: inputValue }));
    }
  };

  const clearFilters = () => {
    setYearFilter({ min: '', max: '' });
    setValueFilter({ min: '', max: '' });
  };


  if (authLoading || species === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }
  
  if (species === null) {
    notFound();
  }

  return (
    <RoleBasedGuard allowedRoles={['researcher', 'admin']} fallbackPath="/dashboard">
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t.backToDashboard}
          </Link>
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Filter className="mr-2 h-6 w-6" /> {t.visualize_filters_title}
            </CardTitle>
            <CardDescription>{t.visualize_filters_desc(t.getSpeciesName(species))}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minYear">{t.visualize_minYear}</Label>
                <Input 
                  id="minYear" 
                  type="number" 
                  placeholder={t.startYear}
                  value={yearFilter.min}
                  onChange={(e) => handleFilterChange('year', 'min', e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxYear">{t.visualize_maxYear}</Label>
                <Input 
                  id="maxYear" 
                  type="number" 
                  placeholder={t.endYear} 
                  value={yearFilter.max}
                  onChange={(e) => handleFilterChange('year', 'max', e.target.value)}
                  className="bg-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">{t.visualize_minValue(filteredHistoricalData[0]?.unit || species.historicalData[0]?.unit || t.unit)}</Label>
                <Input 
                  id="minValue" 
                  type="number" 
                  placeholder={t.visualize_value_placeholder} 
                  value={valueFilter.min}
                  onChange={(e) => handleFilterChange('value', 'min', e.target.value)}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">{t.visualize_maxValue(filteredHistoricalData[0]?.unit || species.historicalData[0]?.unit || t.unit)}</Label>
                <Input 
                  id="maxValue" 
                  type="number" 
                  placeholder={t.visualize_value_placeholder_max}
                  value={valueFilter.max}
                  onChange={(e) => handleFilterChange('value', 'max', e.target.value)}
                  className="bg-input"
                />
              </div>
            </div>
            <Button onClick={clearFilters} variant="outline">
              <FilterX className="mr-2 h-4 w-4" /> {t.clearFilters}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">{t.visualize_main_title_prefix} {t.getSpeciesName(species)}</CardTitle>
            <CardDescription>{t.visualize_main_title_desc(t.getSpeciesName(species))}</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistoricalData && filteredHistoricalData.length > 0 ? (
              <SpeciesDataChart 
                data={filteredHistoricalData} 
                dataKey="value" 
                nameKey="year"
                unit={filteredHistoricalData[0]?.unit || species.historicalData[0]?.unit || 'conteo'} 
                chartType="bar"
                lang={language}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">{t.noDataForFilters}</p>
                <p className="text-sm text-muted-foreground">{t.tryAdjustingFilters}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredHistoricalData && filteredHistoricalData.length > 0 && (
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <TableIcon className="mr-2 h-6 w-6" /> {t.visualize_table_title}
              </CardTitle>
              <CardDescription>{t.visualize_table_desc(t.getSpeciesName(species))}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t.year}</TableHead>
                    <TableHead>{t.description}</TableHead>
                    <TableHead className="w-[150px] text-right">{t.value}</TableHead>
                    <TableHead className="w-[150px]">{t.unit}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistoricalData.map((point) => (
                    <TableRow key={point.year}>
                      <TableCell className="font-medium">{point.year}</TableCell>
                      <TableCell>{point.description || <span className="text-muted-foreground">N/A</span>}</TableCell>
                      <TableCell className="text-right">{point.value.toLocaleString()}</TableCell>
                      <TableCell>{point.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {stats && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">{t.visualize_stats_title}</CardTitle>
              <CardDescription>{t.visualize_stats_desc(t.getSpeciesName(species))}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{t.metric}</TableHead>
                    <TableHead>{t.year}</TableHead>
                    <TableHead className="text-right">{t.value}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> {t.maxInRange}
                    </TableCell>
                    <TableCell>{stats.maxPoint.year}</TableCell>
                    <TableCell className="text-right">{stats.maxPoint.value.toLocaleString()} {stats.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center">
                      <TrendingDown className="mr-2 h-5 w-5 text-red-600" /> {t.minInRange}
                    </TableCell>
                    <TableCell>{stats.minPoint.year}</TableCell>
                    <TableCell className="text-right">{stats.minPoint.value.toLocaleString()} {stats.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center">
                      <MinusSquare className="mr-2 h-5 w-5 text-blue-600" /> {t.avgInRange}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell className="text-right">{stats.average.toLocaleString()} {stats.unit}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedGuard>
  );
}

    