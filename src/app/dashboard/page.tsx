
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type Species } from '@/lib/species';
import { getSpeciesListAction } from '@/app/actions';
import { Edit3, BarChart3, Turtle, Bird, Footprints, ShieldQuestion, Waves, Bug, type LucideIcon, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, LucideIcon> = {
  Turtle,
  Bird,
  Footprints,
  ShieldQuestion,
  Waves,
  Bug,
  Default: HelpCircle, // Fallback icon
};

export default function DashboardPage() {
  const { role } = useAuth();
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      setIsLoading(true);
      const data = await getSpeciesListAction();
      setSpeciesList(data);
      setIsLoading(false);
    };
    fetchSpecies();
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">
          ¡Bienvenido/a, {role === 'admin' ? 'Administrador/a' : 'Investigador/a'}!
        </h1>
        <p className="text-lg text-foreground">
          Gestiona y analiza los datos de las especies de Galápagos.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
            <CardDescription>
              Ver y editar datos estadísticos para cada especie.
              {role === 'admin' && " Como administrador/a, tienes control total sobre los datos de las especies."}
              {role === 'researcher' && " Como investigador/a, puedes actualizar y contribuir a los datos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Selecciona una especie abajo para editar su información.</p>
            {/* List species with edit links */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualización de Datos</CardTitle>
            <CardDescription>
              Accede a gráficos interactivos para un análisis profundo.
              {role === 'researcher' && " Usa estas herramientas para explorar tendencias y patrones."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Selecciona una especie abajo para visualizar sus datos.</p>
            {/* List species with visualize links */}
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Resumen de Especies</h2>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : (
            speciesList.map(species => {
              const IconComponent = iconMap[species.icon] || iconMap.Default;
              return (
                <Card key={species.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {species.name}
                      <IconComponent className="h-6 w-6 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>{species.scientificName}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/edit/${species.id}`}>
                        <Edit3 className="mr-2 h-4 w-4" /> Editar Datos
                      </Link>
                    </Button>
                    {(role === 'researcher' || role === 'admin') && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/visualize/${species.id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" /> Ver Visualizaciones
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90">
                      <Link href={`/species/${species.id}`}>
                        Ver Página Pública
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
