
"use client";

import { useState, useEffect } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { DatabaseZap, LoaderCircle, Calendar, Info } from 'lucide-react';
import Link from 'next/link';

export default function ScrapeoPage() {
    const { toast } = useToast();
    const [isScraping, setIsScraping] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const checkDate = () => {
            const today = new Date();
            const targetDay = 27;
            const targetMonth = 6; // July (0-indexed, so 6 is July)
            const currentYear = today.getFullYear();
            
            const activationDate = new Date(currentYear, targetMonth, targetDay);

            if (today >= activationDate) {
                setIsButtonEnabled(true);
                setTimeRemaining('El período de scraping manual para este año está activo.');
            } else {
                setIsButtonEnabled(false);
                const diff = activationDate.getTime() - today.getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                setTimeRemaining(`El botón se habilitará el 27 de julio. Faltan ${days} día(s).`);
            }
        };

        checkDate();
        const interval = setInterval(checkDate, 1000 * 60 * 60); // Check every hour
        return () => clearInterval(interval);
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
                description: result.message || 'El proceso de scraping ha comenzado. Revisa el progreso en Firebase.',
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
                            Esta función está diseñada para ejecutarse anualmente. El botón se activa el <strong>27 de julio</strong> y permanece activo por si el proceso automático falla o es olvidado. {timeRemaining}
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
                        
                        {!isButtonEnabled && (
                             <Alert variant="destructive" className="mt-4">
                               <Info className="h-4 w-4" />
                               <AlertTitle>Botón Deshabilitado</AlertTitle>
                               <AlertDescription>
                                 El botón solo se activa a partir del 27 de julio de cada año para prevenir ejecuciones accidentales y sobrecarga del sistema.
                               </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="text-sm text-muted-foreground pt-4">
                            <p><strong>Nota:</strong> Se extraen y se limpian datos de la base de datos <a href="https://datazone.darwinfoundation.org/es/checklist/checklists-archive" target="_blank" rel="noopener noreferrer" className="text-primary underline">Datazone de la Fundación Darwin</a> con el fin de mantener la autenticidad de los datos. Este proceso puede tardar varios minutos.</p>
                            <p className="mt-2">Se recomienda forzar un reinicio (`forceRestart: true`) para asegurar una importación limpia cada año.</p>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
