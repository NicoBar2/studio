
"use client"; // Charts are interactive, client component needed

import { getSpeciesById, Species } from '@/lib/species';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { notFound, useRouter } from 'next/navigation';
import SpeciesDataChart from '@/components/charts/SpeciesDataChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

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

  // Metadata would typically be generated server-side if possible
  // For client component, you might set document.title in useEffect
  useEffect(() => {
    if (species) {
      document.title = `Visualizar ${species.name} | Galapagos DataLens`;
    } else if (species === null) {
      document.title = `Especie No Encontrada | Galapagos DataLens`;
    }
  }, [species]);


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
            <CardDescription>Gráficos interactivos que muestran datos históricos para {species.scientificName}.</CardDescription>
          </CardHeader>
          <CardContent>
            {species.historicalData && species.historicalData.length > 0 ? (
              <SpeciesDataChart 
                data={species.historicalData} 
                dataKey="value" 
                nameKey="year"
                unit={species.historicalData[0]?.unit || 'conteo'} // Use unit from first data point or default
                chartType="line" 
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
         {/* Add more charts or data views here as needed */}
      </div>
    </RoleBasedGuard>
  );
}

// This page is client-rendered due to chart interactions and RoleBasedGuard.
// generateStaticParams might not be suitable here unless parts are server-rendered.
// If static generation is needed, consider structuring with server component fetching data
// and passing to a client component for rendering charts.
// For this setup, we'll rely on client-side fetching via getSpeciesById.
