
"use client";

import type { Species } from '@/lib/species';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useTransition } from 'react';
import { getAISummary } from '@/app/actions';
import { 
  AlertCircle, Brain, Edit, BarChart2, Tag, TrendingUp, ShieldAlert, Home, ListChecks,
  Turtle, Bird, Footprints, ShieldQuestion, Waves, Bug, type LucideIcon, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import SpeciesDataChart from '@/components/charts/SpeciesDataChart';

type SpeciesDetailClientProps = {
  species: Species;
};

const iconMap: Record<string, LucideIcon> = {
  Turtle,
  Bird,
  Footprints,
  ShieldQuestion,
  Waves,
  Bug,
  Default: HelpCircle,
};

const populationTrendTranslations: Record<Species['populationTrend'], string> = {
  increasing: 'Creciente',
  decreasing: 'Decreciente',
  stable: 'Estable',
  unknown: 'Desconocida',
};

export default function SpeciesDetailClient({ species }: SpeciesDetailClientProps) {
  const { role } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const IconComponent = iconMap[species.icon] || iconMap.Default;

  const handleGenerateSummary = () => {
    startTransition(async () => {
      setError(null);
      setSummary(null);
      const result = await getAISummary(species.id);
      if (result.summary) {
        setSummary(result.summary);
      } else {
        setError(result.error || "Ocurrió un error desconocido.");
      }
    });
  };

  const displayPopulationTrend = populationTrendTranslations[species.populationTrend] || species.populationTrend;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="relative p-0">
          <Image
            src={species.imageUrl}
            alt={species.name}
            width={1200}
            height={400}
            className="w-full h-64 md:h-96 object-cover"
            priority
            data-ai-hint={species.dataAiHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <div className="flex items-center mb-2">
              <IconComponent className="h-12 w-12 text-accent mr-4" />
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">{species.name}</h1>
            </div>
            <p className="text-xl italic text-gray-200">{species.scientificName}</p>
          </div>
           {(role === 'admin' || role === 'researcher') && (
            <Button asChild size="sm" className="absolute top-4 right-4 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href={`/dashboard/edit/${species.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Datos
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-headline font-semibold text-primary mb-3 flex items-center">
              <Tag className="mr-2 h-6 w-6" /> Información General
            </h2>
            <p className="text-foreground leading-relaxed">{species.longDescription}</p>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary"><ShieldAlert className="mr-2 h-5 w-5" /> Conservación y Población</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Estado:</strong> <Badge variant={species.conservationStatus === 'En Peligro' || species.conservationStatus === 'En Peligro Crítico' ? 'destructive' : 'secondary'}>{species.conservationStatus}</Badge></p>
                <p><strong>Tendencia Poblacional:</strong> <span className={`font-medium ${species.populationTrend === 'decreasing' ? 'text-destructive' : species.populationTrend === 'increasing' ? 'text-green-600' : 'text-foreground'}`}>{displayPopulationTrend}</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary"><Home className="mr-2 h-5 w-5" /> Hábitat</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{species.habitat}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-primary"><ListChecks className="mr-2 h-5 w-5" /> Estadísticas Clave</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {species.keyStats.map(stat => (
                  <li key={stat.label}><strong>{stat.label}:</strong> {stat.value} {stat.unit || ''}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary"><AlertCircle className="mr-2 h-5 w-5" /> Amenazas Principales</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {species.threats.map((threat, index) => (
                  <li key={index}>{threat}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-primary">
                <Brain className="mr-2 h-5 w-5" /> Resumen Generado por IA
              </CardTitle>
              <CardDescription>
                Obtén un resumen rápido del estado actual e importancia de esta especie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateSummary} disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending ? 'Generando...' : 'Generar Resumen con IA'}
              </Button>
              {isPending && (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
              {summary && !isPending && <p className="mt-4 p-4 bg-secondary rounded-md text-secondary-foreground">{summary}</p>}
              {error && !isPending && <p className="mt-4 text-destructive">{error}</p>}
            </CardContent>
          </Card>

          {(role === 'researcher' || role === 'admin') && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-primary"><BarChart2 className="mr-2 h-5 w-5" /> Visualización de Datos Históricos</CardTitle>
                     <CardDescription>
                       Gráficos que muestran datos históricos de la población u otras métricas relevantes.
                     </CardDescription>
                </CardHeader>
                <CardContent>
                    {species.historicalData && species.historicalData.length > 0 ? (
                        <SpeciesDataChart data={species.historicalData} dataKey="value" nameKey="year" unit={species.historicalData[0].unit || 'conteo'} />
                    ) : (
                        <p className="text-muted-foreground">No hay datos históricos disponibles para visualización.</p>
                    )}
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    