
"use client";

import { useEffect, useState, useActionState } from 'react';
import { createResearcherAction, getResearchersAction } from '@/app/actions';
import type { Researcher } from '@/lib/researchers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ListChecks, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialFormState = {
  success: false,
  message: '',
  researcher: undefined as Researcher | undefined,
};

function SubmitButton() {
  // useFormStatus must be used within a <form>
  // We'll define it inside the form component below if needed,
  // or just use a regular button and handle pending state manually if useActionState is at this level.
  // For now, this button is part of the form directly.
  return null; 
}


export default function ResearcherManagementClient() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const { toast } = useToast();

  const [formState, formAction, isPending] = useActionState(createResearcherAction, initialFormState);

  useEffect(() => {
    async function fetchResearchers() {
      setIsLoadingList(true);
      const fetchedResearchers = await getResearchersAction();
      setResearchers(fetchedResearchers);
      setIsLoadingList(false);
    }
    fetchResearchers();
  }, []);
  
  useEffect(() => {
    if (formState.message) {
      toast({
        title: formState.success ? '¡Éxito!' : 'Error',
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success && formState.researcher) {
        // Add new researcher to the list without re-fetching
        setResearchers(prev => [...prev, formState.researcher!]);
        // Reset form or input field if needed - form.reset() if using react-hook-form
        // For a simple form, the browser might reset it or we might need to manually clear.
      }
    }
  }, [formState, toast]);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary">
            <UserPlus className="mr-3 h-7 w-7" />
            Crear Nuevo Investigador
          </CardTitle>
          <CardDescription>
            Añade un nuevo investigador al sistema. Podrán gestionar datos de especies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="researcherName" className="font-semibold">Nombre del Investigador</Label>
              <Input 
                id="researcherName" 
                name="researcherName" 
                placeholder="Ej: Dra. Jane Goodall" 
                className="mt-1" 
                required 
                minLength={3}
              />
            </div>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? 'Creando...' : 'Crear Investigador'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary">
            <ListChecks className="mr-3 h-7 w-7" />
            Lista de Investigadores
          </CardTitle>
          <CardDescription>
            Investigadores actualmente registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : researchers.length > 0 ? (
            <ul className="space-y-3">
              {researchers.map((researcher) => (
                <li key={researcher.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-medium">{researcher.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">ID: {researcher.id}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay investigadores registrados todavía.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
