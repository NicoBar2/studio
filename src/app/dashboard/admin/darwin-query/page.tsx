
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { AlertTriangle, CheckCircle, Search, Play, RefreshCw, Server, Info, List } from 'lucide-react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSpeciesFromFirestoreAction } from '@/app/actions';
import type { Species } from '@/lib/types';


type ScrapingProgress = {
  sessionId: string;
  status: 'in_progress' | 'completed' | 'error' | 'continuing';
  processedFiles: number;
  totalFiles: number;
  totalRecords: number;
  error?: string;
  progressPercentage: number;
  message?: string;
};

export default function DarwinQueryPage() {
    const [progress, setProgress] = useState<ScrapingProgress | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [species, setSpecies] = useState<Species[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);

    const functions = getFunctions(app, 'us-central1');

    const checkProgress = useCallback(async (sessionId?: string) => {
        setIsChecking(true);
        setError(null);
        try {
            const checkScrapingProgress = httpsCallable(functions, 'checkScrapingProgress');
            const result: any = await checkScrapingProgress({ sessionId });
            setProgress(result.data);
        } catch (err: any) {
            console.error("Error checking progress:", err);
            setError("No se pudo verificar el progreso. Puede que no haya ninguna tarea en ejecución.");
            setProgress(null);
        } finally {
            setIsChecking(false);
        }
    }, [functions]);
    
    useEffect(() => {
        checkProgress();
    }, [checkProgress]);
    
    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (progress?.status === 'in_progress' || progress?.status === 'continuing') {
          interval = setInterval(() => {
              checkProgress(progress.sessionId);
          }, 30000); // Check every 30 seconds
      }
      return () => clearInterval(interval);
    }, [progress, checkProgress]);

    const startScraping = async (forceRestart = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const scrapeDarwinData = httpsCallable(functions, 'scrapeDarwinData');
            const result: any = await scrapeDarwinData({ forceRestart, sessionId: progress?.sessionId });
            setProgress(result.data);
        } catch (err: any) {
            console.error("Error starting scraping:", err);
            setError(err.message || "Ocurrió un error desconocido al iniciar el proceso.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        setIsSearching(true);
        const allData = await getAllSpeciesFromFirestoreAction();
        setSpecies(allData);
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            const filtered = allData.filter(s => 
                s.ScientificName?.toLowerCase().includes(lowercasedTerm) || 
                s.CommonNameEnglish?.toLowerCase().includes(lowercasedTerm) ||
                s.family?.toLowerCase().includes(lowercasedTerm)
            );
            setFilteredSpecies(filtered);
        } else {
            setFilteredSpecies(allData);
        }
        setIsSearching(false);
    };

    return (
        <RoleBasedGuard allowedRoles={['admin']}>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <Server className="mr-3 h-7 w-7" />
                            Servicio de Datos de la Fundación Darwin
                        </CardTitle>
                        <CardDescription>
                            Esta herramienta inicia un proceso en el servidor para extraer y centralizar todos los datos de especies de los archivos CSV de la Fundación Darwin. Una vez completado, podrás realizar búsquedas rápidas en la base de datos unificada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                           <Button onClick={() => startScraping(true)} disabled={isLoading}>
                                <Play className="mr-2 h-4 w-4" /> Iniciar/Reiniciar Proceso
                            </Button>
                            <Button onClick={() => checkProgress(progress?.sessionId)} variant="outline" disabled={isChecking}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} /> Verificar Estado
                            </Button>
                        </div>
                        {isChecking && !progress && <Skeleton className="h-20 w-full" />}
                        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                        {progress && (
                             <Alert variant={progress.status === 'completed' ? 'default' : 'destructive'} className={progress.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}>
                                {progress.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                <AlertTitle>
                                    Estado del Proceso (Sesión: {progress.sessionId}) - {
                                        {
                                            'in_progress': 'En Progreso',
                                            'continuing': 'En Progreso (procesando lotes)',
                                            'completed': 'Completado',
                                            'error': 'Error'
                                        }[progress.status] || 'Desconocido'
                                    }
                                </AlertTitle>
                                <AlertDescription>
                                    <p>Archivos procesados: {progress.processedFiles} de {progress.totalFiles}</p>
                                    <p>Registros totales guardados: {progress.totalRecords || 0}</p>
                                    {progress.message && <p className="font-semibold mt-2">{progress.message}</p>}
                                    {progress.status !== 'completed' && progress.totalFiles > 0 && <Progress value={progress.progressPercentage} className="mt-2" />}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <List className="mr-3 h-7 w-7" />
                            Consulta de Especies (Datos de Darwin)
                        </CardTitle>
                        <CardDescription>
                           Busca en la base de datos unificada de especies importadas desde la Fundación Darwin. La búsqueda se realiza sobre los nombres científicos, comunes en inglés y familias.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input 
                                type="search"
                                placeholder="Buscar especie..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-input"
                            />
                            <Button onClick={handleSearch} disabled={isSearching}>
                                <Search className="mr-2 h-4 w-4" /> {isSearching ? 'Buscando...' : 'Buscar'}
                            </Button>
                        </div>
                        
                        {isSearching && <Skeleton className="h-40 w-full" />}
                        
                        {!isSearching && filteredSpecies.length > 0 && (
                             <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre Científico</TableHead>
                                            <TableHead>Nombre Común (Inglés)</TableHead>
                                            <TableHead>Familia</TableHead>
                                            <TableHead>Estado UICN</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSpecies.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">{s.ScientificName}</TableCell>
                                                <TableCell>{s.CommonNameEnglish || 'N/A'}</TableCell>
                                                <TableCell>{s.family || 'N/A'}</TableCell>
                                                <TableCell>{s.iucnStatus || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {!isSearching && species.length > 0 && filteredSpecies.length === 0 && (
                             <p className="text-center text-muted-foreground p-4">No se encontraron resultados para "{searchTerm}".</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
