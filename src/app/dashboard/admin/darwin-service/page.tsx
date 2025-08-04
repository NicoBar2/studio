
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Search, Play, RefreshCw, Server, Info, Hourglass } from 'lucide-react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';


type TaskStatus = 'pending' | 'processing' | 'completed' | 'error';
interface TaskResult {
    scientificName: string;
    commonName: string;
    family: string;
    iucnStatus: string;
}
interface TaskResponse {
    taskId: string;
    status: TaskStatus;
    progress: number;
    filesProcessed: number;
    totalFiles: number;
    runtimeSeconds: number;
    results?: TaskResult[];
    error?: string;
}

export default function DarwinServicePage() {
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const pollTaskStatus = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/darwin-consult?taskId=${id}`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch task status');
            }
            const data: TaskResponse = await response.json();
            setTaskStatus(data);

            if (data.status === 'completed' || data.status === 'error') {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setTaskId(null); // Stop polling
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, []);

    useEffect(() => {
      // Cleanup on unmount
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, []);

    const startSearch = async () => {
        if (searchTerm.trim().length < 3) {
            setError("El término de búsqueda debe tener al menos 3 caracteres.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setTaskStatus(null);
        if (intervalRef.current) clearInterval(intervalRef.current);

        try {
            const response = await fetch('/api/darwin-consult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchTerm }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to start search task');
            }

            const data = await response.json();
            setTaskId(data.taskId);

            // Start polling
            intervalRef.current = setInterval(() => pollTaskStatus(data.taskId), 3000);

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };
    
    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary"><Hourglass className="mr-1 h-3 w-3"/>Pendiente</Badge>;
            case 'processing': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600"><RefreshCw className="mr-1 h-3 w-3 animate-spin"/>Procesando</Badge>;
            case 'completed': return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3"/>Completado</Badge>;
            case 'error': return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/>Error</Badge>;
            default: return <Badge variant="secondary">Desconocido</Badge>;
        }
    };

    return (
        <RoleBasedGuard allowedRoles={['admin']}>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <Server className="mr-3 h-7 w-7" />
                            Servicio de Consulta de Datos de Darwin
                        </CardTitle>
                        <CardDescription>
                           Este servicio RESTful realiza una consulta en tiempo real sobre los archivos de datos de la Fundación Darwin. Introduce un término de búsqueda para iniciar la tarea. El proceso puede tardar varios minutos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input 
                                type="search"
                                placeholder="Buscar por nombre científico o común..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isLoading}
                                className="bg-input"
                                onKeyDown={(e) => { if (e.key === 'Enter') startSearch(); }}
                            />
                            <Button onClick={startSearch} disabled={isLoading}>
                                <Search className="mr-2 h-4 w-4" /> {isLoading ? 'Buscando...' : 'Iniciar Búsqueda'}
                            </Button>
                        </div>
                        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    </CardContent>
                </Card>
                
                {(isLoading || taskStatus) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado de la Tarea</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!taskStatus ? (
                                <Skeleton className="h-20 w-full" />
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p><strong>ID de Tarea:</strong> <span className="font-mono text-sm">{taskStatus.taskId}</span></p>
                                        {getStatusBadge(taskStatus.status)}
                                    </div>
                                    {(taskStatus.status === 'processing' || (taskStatus.status === 'pending' && taskStatus.totalFiles > 0)) && (
                                        <div>
                                            <Progress value={taskStatus.progress * 100} className="w-full" />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {taskStatus.totalFiles > 0 
                                                 ? `Procesado ${taskStatus.filesProcessed} de ${taskStatus.totalFiles} archivos... (${Math.round(taskStatus.progress * 100)}%)`
                                                 : 'Iniciando, buscando archivos...'}
                                            </p>
                                        </div>
                                    )}
                                    {taskStatus.error && (
                                         <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{taskStatus.error}</AlertDescription></Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {taskStatus?.status === 'completed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultados de la Búsqueda</CardTitle>
                            <CardDescription>
                                Se encontraron {taskStatus.results?.length || 0} coincidencias para "{searchTerm}" en {taskStatus.runtimeSeconds.toFixed(2)} segundos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur">
                                        <TableRow>
                                            <TableHead>Nombre Científico</TableHead>
                                            <TableHead>Nombre Común</TableHead>
                                            <TableHead>Familia</TableHead>
                                            <TableHead>Estado UICN</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {taskStatus.results && taskStatus.results.length > 0 ? (
                                            taskStatus.results.map((s, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{s.scientificName}</TableCell>
                                                    <TableCell>{s.commonName || 'N/A'}</TableCell>
                                                    <TableCell>{s.family || 'N/A'}</TableCell>
                                                    <TableCell>{s.iucnStatus || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">No se encontraron resultados.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </RoleBasedGuard>
    );
}
