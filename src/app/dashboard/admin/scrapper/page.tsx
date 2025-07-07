
"use client";

import { useActionState, useEffect, useRef } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Webhook } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { scrapeSpeciesAction } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Procesando...' : 'Iniciar Proceso'}
    </Button>
  );
}

export default function ScrapperPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(scrapeSpeciesAction, initialState);
  const { role } = useAuth();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Éxito' : 'Operación Fallida',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel Principal
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline text-primary">
              <Webhook className="mr-3 h-7 w-7" />
              Importar Especies por Scrapping con IA
            </CardTitle>
            <CardDescription>
              Esta herramienta utiliza un agente de IA para investigar en la web y crear nuevos registros de especies. Introduce los nombres de las especies que deseas importar (uno por línea). El proceso es automático pero puede tardar varios minutos dependiendo de la cantidad de nombres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
               <input type="hidden" name="userRole" value={role || ''} />
              <div>
                <Label htmlFor="speciesNames" className="font-semibold">Nombres de Especies</Label>
                <Textarea
                  id="speciesNames"
                  name="speciesNames"
                  rows={10}
                  className="mt-1"
                  placeholder="Ej: Tortuga Gigante de Pinta\nPinzón de Darwin de pico afilado..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Escribe un nombre de especie por línea.</p>
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleBasedGuard>
  );
}
