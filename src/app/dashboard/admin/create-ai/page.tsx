"use client";

import { useActionState, useEffect, useRef } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createSpeciesWithAIAction } from '@/app/actions';
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
      {pending ? (
        <>
          <BrainCircuit className="mr-2 h-5 w-5 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Generar Especie
        </>
      )}
    </Button>
  );
}

export default function CreateSpeciesWithAIPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { role } = useAuth();
  const [state, formAction] = useActionState(createSpeciesWithAIAction, initialState);

  // The server action redirects on success, so we only need to handle errors here.
  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        title: 'Operación Fallida',
        description: state.message,
        variant: 'destructive',
      });
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
              <Wand2 className="mr-3 h-7 w-7" />
              Generador de Especie
            </CardTitle>
            <CardDescription>
              Introduce el nombre de una especie y la IA generará una ficha de datos inicial. Podrás revisar y editar la información antes de guardarla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <input type="hidden" name="userRole" value={role || ''} />
              <div>
                <Label htmlFor="speciesName" className="font-semibold">Nombre de la Especie</Label>
                <Input 
                  id="speciesName" 
                  name="speciesName" 
                  type="text" 
                  className="mt-1"
                  placeholder="Ej: Fregata magnificens, Piquero de patas azules, etc."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">La IA buscará la información y creará un borrador inicial para la especie.</p>
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleBasedGuard>
  );
}
