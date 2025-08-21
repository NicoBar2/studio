
"use client";

import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DarwinServicePage() {
    return (
        <RoleBasedGuard allowedRoles={['admin']}>
            <div className="space-y-6 flex flex-col h-full">
                <div className="flex-shrink-0">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
                        </Link>
                    </Button>
                </div>

                <Card className="shadow-lg flex-grow flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle className="flex items-center text-2xl font-headline text-primary">
                            <DatabaseZap className="mr-3 h-7 w-7" />
                            Servicio Externo Darwin
                        </CardTitle>
                        <CardDescription>
                            Interactúa con la herramienta externa de búsqueda de especies directamente desde esta interfaz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-0 overflow-hidden">
                        <iframe
                            src="https://finaldataa.onrender.com/species_search.html"
                            title="Servicio Externo de Búsqueda de Especies"
                            className="w-full h-full border-0"
                        />
                    </CardContent>
                </Card>
            </div>
        </RoleBasedGuard>
    );
}
