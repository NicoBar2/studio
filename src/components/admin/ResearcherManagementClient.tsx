
"use client";

import { useEffect, useState, useActionState } from 'react';
import { createResearcherAction, getResearchersAction } from '@/app/actions';
import type { Researcher } from '@/lib/researchers';
import ResearcherItem from './ResearcherItem'; // Import the new component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ListChecks } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialFormState = {
  success: false,
  message: '',
  researcher: undefined as Researcher | undefined,
};

export default function ResearcherManagementClient() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const { toast } = useToast();

  const [formState, formAction, isCreating] = useActionState(createResearcherAction, initialFormState);
  const [newResearcherName, setNewResearcherName] = useState('');


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
    // This effect handles feedback for the CREATE action
    if (formState.message && formState.message !== initialFormState.message) { // Ensure message has changed
      toast({
        title: formState.success ? '¡Éxito!' : 'Error',
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success && formState.researcher) {
        setResearchers(prev => [...prev, formState.researcher!]);
        setNewResearcherName(''); // Reset the input field
      }
    }
  }, [formState, toast]);

  const handleDeleteResearcher = (researcherId: string) => {
    setResearchers(prev => prev.filter(r => r.id !== researcherId));
  };


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
          <form 
            action={(formData) => {
              formAction(formData);
            }} 
            className="space-y-4"
          >
            <div>
              <Label htmlFor="researcherName" className="font-semibold">Nombre del Investigador</Label>
              <Input 
                id="researcherName" 
                name="researcherName" 
                placeholder="Ej: Dra. Jane Goodall" 
                className="mt-1" 
                required 
                minLength={3}
                value={newResearcherName}
                onChange={(e) => setNewResearcherName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
              {isCreating ? 'Creando...' : 'Crear Investigador'}
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
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-4/5 rounded-md" />
            </div>
          ) : researchers.length > 0 ? (
            <ul className="space-y-3">
              {researchers.map((researcher) => (
                <ResearcherItem 
                  key={researcher.id} 
                  researcher={researcher} 
                  onDelete={handleDeleteResearcher} 
                />
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

