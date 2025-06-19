
"use client"; // Charts are interactive, client component needed

import { getSpeciesById, type Species, type HistoricalDataPoint } from '@/lib/species';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { notFound, useRouter } from 'next/navigation';
import SpeciesDataChart from '@/components/charts/SpeciesDataChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, MinusSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type VisualizeSpeciesPageProps = {
  params: { id: string };
};


export default function VisualizeSpeciesPage({ params }: VisualizeSpeciesPageProps) {
  const [species, setSpecies] = useState<Species | null | undefined>(undefined);
  const { role, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const foundSpecies = getSpeciesById(params.id);
    setSpecies(foundSpecies);
  }, [params.id]);

  useEffect(() => {
    if (species) {
      document.title = `Visualizar ${species.name} | Galapagos DataLens`;
    } else if (species === null) {
      document.title = `Especie No Encontrada | Galapagos DataLens`;
    }
  }, [species]);

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

  const stats = species && species.historicalData && species.historicalData.length > 0 
    ? getHistoricalStats(species.historicalData) 
    : null;


  if (authLoading || species === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p>Cargando datos de la especie...</p>
      </div>
    );
  }
  
  if (!species) {
    notFound();
  }

  return (
    <RoleBasedGuard allowedRoles={['researcher', 'admin']} fallbackPath="/dashboard">
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
          </Link>
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Visualización de Datos: {species.name}</CardTitle>
            <CardDescription>Gráficos de barras interactivos que muestran datos históricos para {species.scientificName}.</CardDescription>
          </CardHeader>
          <CardContent>
            {species.historicalData && species.historicalData.length > 0 ? (
              <SpeciesDataChart 
                data={species.historicalData} 
                dataKey="value" 
                nameKey="year"
                unit={species.historicalData[0]?.unit || 'conteo'} 
                chartType="bar"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No hay datos históricos disponibles para visualización.</p>
                <p className="text-sm text-muted-foreground">Considera agregar datos a través de la página de edición.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {stats && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Estadísticas Históricas Clave</CardTitle>
              <CardDescription>Un resumen de los datos históricos de {species.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Métrica</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> Máximo Histórico
                    </TableCell>
                    <TableCell>{stats.maxPoint.year}</TableCell>
                    <TableCell className="text-right">{stats.maxPoint.value.toLocaleString()} {stats.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center">
                      <TrendingDown className="mr-2 h-5 w-5 text-red-600" /> Mínimo Histórico
                    </TableCell>
                    <TableCell>{stats.minPoint.year}</TableCell>
                    <TableCell className="text-right">{stats.minPoint.value.toLocaleString()} {stats.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center">
                      <MinusSquare className="mr-2 h-5 w-5 text-blue-600" /> Promedio Histórico
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
