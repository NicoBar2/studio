
"use client";

import { useState, useEffect } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { DatabaseZap, LoaderCircle, Calendar, Info, CheckCircle } from 'lucide-react';

// Define a type for the scrape info for better type safety
type ScrapeInfo = {
    status: 'completed' | 'in_progress' | 'error' | string;
    completedAt?: string;
    startedAt?: string;
    sessionId?: string;
};

export default function ScrapeoPage() {
    const { toast } = useToast();
    const [isScraping, setIsScraping] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Verificando estado...');
    const [lastScrapeInfo, setLastScrapeInfo] = useState<ScrapeInfo | null>(null);

    useEffect(() => {
        // This function is now self-contained and will run once on mount.
        const checkScrapeStatusAndSetButton = async () => {
            let info: ScrapeInfo | null = null;
            try {
                // Check for the latest scrape session
                const progressResponse = await fetch('https://us-central1-galapagos-datalens.cloudfunctions.net/checkScrapingProgress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: {} }), // No session ID to get the latest
                });

                if (progressResponse.ok) {
                    const result = await progressResponse.json();
                    info = result.result;
                    setLastScrapeInfo(info);
                } else {
                   setStatusMessage('No se pudo verificar el estado del último scraping.');
                   return;
                }
            } catch (error) {
                setStatusMessage('Error de conexión al verificar el estado del scraping.');
                return;
            }

            const today = new Date();
            const currentYear = today.getFullYear();
            let activationDate = new Date(currentYear, 6, 27); // Month is 0-indexed, so 6 is July.
            
            const lastScrapeYear = info?.startedAt ? new Date(info.startedAt).getFullYear() : 0;
            const isCompletedThisYear = info?.status === 'completed' && lastScrapeYear === currentYear;

            if (isCompletedThisYear) {
                setIsButtonEnabled(false);
                const completionDate = info.completedAt ? new Date(info.completedAt).toLocaleDateString() : 'recientemente';
                
                // Set activation for next year
                activationDate = new Date(currentYear + 1, 6, 27);
                const diff = activationDate.getTime() - today.getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                setStatusMessage(`La actualización de este año ya se realizó el ${completionDate}. La próxima activación será en ${days} día(s).`);
                
            } else if (today >= activationDate) {
                setIsButtonEnabled(true);
                setStatusMessage('El período de scraping manual para este año está activo.');
            } else {
                setIsButtonEnabled(false);
                const diff = activationDate.getTime() - today.getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                setStatusMessage(`El botón se habilitará el 27 de julio. Faltan ${days} día(s).`);
            }
        };

        checkScrapeStatusAndSetButton();
    }, []);

    const handleScrape = async () => {
        setIsScraping(true);
        try {
            const response = await fetch('https://us-central1-galapagos-datalens.cloudfunctions.net/scrapeDarwinData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: { forceRestart: true } }),
            });

            const result = await response.json();

            if (!response.ok) {
                 throw new Error(result.error?.message || 'Error en la respuesta del servidor.');
            }
            
            toast({
                title: 'Proceso Iniciado',
                description: result.result?.message || 'El proceso de scraping ha comenzado. Revisa el progreso en Firebase.',
            });

        } catch (error) {
            toast({
                title: 'Error de Scraping',
                description: error instanceof Error ? error.message : 'No se pudo iniciar el proceso de scraping.',
                variant: 'destructive',
            });
        } finally {
            setIsScraping(false);
        }
    };

    const isCompletedThisYear = lastScrapeInfo?.status === 'completed' && lastScrapeInfo?.startedAt && new Date(lastScrapeInfo.startedAt).getFullYear() === new Date().getFullYear();

    return (
        <RoleBasedGuard allowedRoles={['admin']}>
            <div className="space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <DatabaseZap className="mr-3 h-7 w-7" />
                            Scraping Anual de Datos
                        </CardTitle>
                        <CardDescription>
                            Esta herramienta inicia el proceso de actualización masiva de datos desde la fuente de la Fundación Darwin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                           <Calendar className="h-4 w-4" />
                           <AlertTitle>Funcionamiento Anual</AlertTitle>
                           <AlertDescription>
                            Esta función está diseñada para ejecutarse anualmente para mantener los datos actualizados. {statusMessage}
                           </AlertDescription>
                        </Alert>
                        
                        <div className="pt-4">
                             <Button onClick={handleScrape} disabled={isScraping || !isButtonEnabled} size="lg">
                                {isScraping ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                        Iniciando Proceso...
                                    </>
                                ) : (
                                    'Iniciar Proceso de Scraping Anual'
                                )}
                            </Button>
                        </div>
                        
                        {isCompletedThisYear && (
                            <Alert variant="default" className="mt-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertTitle>Proceso Completado</AlertTitle>
                                <AlertDescription>
                                    La actualización para este año ya se realizó con éxito.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="text-sm text-muted-foreground pt-4">
                            <p><strong>Nota:</strong> Se extraen y se limpian datos de la base de datos <a href="https://datazone.darwinfoundation.org/es/checklist/checklists-archive" target="_blank" rel="noopener noreferrer" className="text-primary underline">Datazone de la Fundación Darwin</a> con el fin de mantener la autenticidad de los datos. Este proceso puede tardar varios minutos.</p>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
