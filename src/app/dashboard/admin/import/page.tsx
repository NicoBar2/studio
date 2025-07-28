
"use client";

import { useActionState, useEffect, useRef } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { importSpeciesDataAction } from '@/app/actions';
import { useFormStatus } from 'react-dom';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Procesando...' : 'Procesar Archivo'}
    </Button>
  );
}

export default function ImportDataPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(importSpeciesDataAction, initialState);

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
              <UploadCloud className="mr-3 h-7 w-7" />
              Importar Especies desde Archivo
            </CardTitle>
            <CardDescription>
              Sube un archivo Excel (.xlsx) para importar nuevas especies o actualizar las existentes.
              Puedes descargar la lista de especies más reciente desde {' '}
              <a href="https://datazone.darwinfoundation.org/es/checklist/checklists-archive" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                Datazone de la Fundación Darwin
              </a>.
              <br/>
              El sistema utiliza el <strong>Nombre Común en Español</strong> para identificar cada especie. Si una especie con el mismo nombre ya existe, sus datos se actualizarán. De lo contrario, se creará una nueva entrada. Los campos no proporcionados usarán valores predeterminados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="speciesFile" className="font-semibold">Archivo Excel de Especies (.xlsx)</Label>
                <Input 
                  id="speciesFile" 
                  name="speciesFile" 
                  type="file" 
                  className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  accept=".xlsx"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Sube el archivo en formato .xlsx descargado de la fuente oficial.</p>
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleBasedGuard>
  );
}
