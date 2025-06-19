
"use client";

import { useEffect, useState, useActionState, useRef } from 'react';
import { createResearcherAction, getResearchersAction } from '@/app/actions';
import type { Researcher } from '@/lib/researchers';
import ResearcherItem from './ResearcherItem'; 
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
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, formAction, isCreating] = useActionState(createResearcherAction, initialFormState);
  
  // States for controlled inputs to allow form reset
  const [researcherName, setResearcherName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [specialization, setSpecialization] = useState('');


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
    if (formState.message && formState.message !== initialFormState.message) { 
      toast({
        title: formState.success ? '¡Éxito!' : 'Error',
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success && formState.researcher) {
        setResearchers(prev => [formState.researcher!, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        // Reset form fields
        setResearcherName('');
        setEmail('');
        setInstitution('');
        setSpecialization('');
        formRef.current?.reset(); // Also try native form reset
      }
    }
  }, [formState, toast]);

  const handleDeleteResearcher = (researcherId: string) => {
    setResearchers(prev => prev.filter(r => r.id !== researcherId));
  };

  const handleVerificationChange = (updatedResearcher: Researcher) => {
    setResearchers(prev => 
      prev.map(r => r.id === updatedResearcher.id ? updatedResearcher : r)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
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
            ref={formRef}
            action={(formData) => {
              formAction(formData);
            }} 
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="researcherName" className="font-semibold">Nombre del Investigador</Label>
                <Input 
                  id="researcherName" 
                  name="researcherName" 
                  placeholder="Ej: Dra. Jane Goodall" 
                  className="mt-1" 
                  required 
                  minLength={3}
                  value={researcherName}
                  onChange={(e) => setResearcherName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email" className="font-semibold">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="investigador@ejemplo.com" 
                  className="mt-1" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="institution" className="font-semibold">Institución (Opcional)</Label>
                <Input 
                  id="institution" 
                  name="institution" 
                  placeholder="Ej: Universidad de Galápagos" 
                  className="mt-1" 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="specialization" className="font-semibold">Especialización (Opcional)</Label>
                <Input 
                  id="specialization" 
                  name="specialization" 
                  placeholder="Ej: Biología Marina, Ornitología" 
                  className="mt-1" 
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
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
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-4/5 rounded-md" />
            </div>
          ) : researchers.length > 0 ? (
            <ul className="space-y-3">
              {researchers.map((researcher) => (
                <ResearcherItem 
                  key={researcher.id} 
                  researcher={researcher} 
                  onDelete={handleDeleteResearcher}
                  onVerificationChange={handleVerificationChange}
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
