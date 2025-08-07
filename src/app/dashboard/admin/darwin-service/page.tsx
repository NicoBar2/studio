
"use client";

import { useState, useEffect } from 'react';
import { getDarwinServiceDataAction } from '@/app/actions';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DatabaseZap, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DarwinServicePage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            const result = await getDarwinServiceDataAction();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    return (
        <RoleBasedGuard allowedRoles={['admin']}>
            <div className="space-y-6">
                <Button variant="outline" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
                    </Link>
                </Button>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <DatabaseZap className="mr-3 h-7 w-7" />
                            Conexión con Servicio Darwin
                        </CardTitle>
                        <CardDescription>
                            Esta página es un ejemplo de cómo conectar y mostrar datos desde un microservicio externo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                             <div className="space-y-4">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        )}

                        {error && !isLoading && (
                             <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error de Conexión</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {data && !isLoading && (
                             <Alert variant="default" className="bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>¡Conexión Exitosa!</AlertTitle>
                                <AlertDescription>
                                    <p className="mb-4">Se han recibido los siguientes datos desde el microservicio:</p>
                                    <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
