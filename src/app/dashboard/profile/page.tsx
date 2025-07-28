
"use client";

import { useEffect, useState, useActionState, useRef, type ChangeEvent, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Researcher } from '@/lib/types';
import { getMyResearcherDataAction, updateMyProfileAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Fingerprint, Mail, Building, Award, User, Upload, DatabaseZap, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

const initialUpdateState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando...' : 'Guardar Cambios'}
    </Button>
  );
}

function ScrapingTrigger() {
    const { toast } = useToast();
    const [isScraping, setIsScraping] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const today = new Date();
        // The button will only be visible on July 27th.
        if (today.getMonth() === 6 && today.getDate() === 27) {
            setShowButton(true);
        }
    }, []);

    const handleScrape = async () => {
        setIsScraping(true);
        try {
            const response = await fetch('https://us-central1-galapagos-datalens.cloudfunctions.net/scrapeDarwinData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: {} }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error en la respuesta del servidor.');
            }

            const result = await response.json();
            toast({
                title: 'Éxito',
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

    if (!showButton) {
        return null;
    }

    return (
        <Card className="mt-8 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <CardHeader>
                <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
                    <DatabaseZap className="mr-3 h-6 w-6" />
                    Acción Anual de Sincronización de Datos
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                    Este botón está disponible solo hoy, 27 de julio, para iniciar el proceso anual de scraping de datos desde la Fundación Darwin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Al hacer clic, se ejecutará la Cloud Function `scrapeDarwinData` para actualizar la base de datos con la información más reciente. Este proceso puede tardar varios minutos.
                </p>
                <Button onClick={handleScrape} disabled={isScraping} variant="outline" className="border-amber-600 text-amber-800 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-200 dark:hover:bg-amber-900/40">
                    {isScraping ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando Proceso...
                        </>
                    ) : (
                        'Iniciar Scraping Anual'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

function ProfileForm({ researcher, isAdmin }: { researcher: Researcher, isAdmin: boolean }) {
  const { toast } = useToast();
  const { userEmail } = useAuth();
  const [state, formAction] = useActionState(updateMyProfileAction, initialUpdateState);

  const [imagePreview, setImagePreview] = useState<string | null>(researcher.profileImageUrl || null);
  const [imageFileValue, setImageFileValue] = useState<string>(researcher.profileImageUrl || '');
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Éxito' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setImageFileValue(dataUri);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(researcher.profileImageUrl || null);
      setImageFileValue(researcher.profileImageUrl || '');
    }
  };


  return (
      <>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userEmail" value={userEmail || ''} />
          <input type="hidden" name="profileImageUrl" value={imageFileValue} />

          <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={imagePreview || undefined} alt={researcher.name} />
                  <AvatarFallback>{researcher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                  <Label htmlFor="imageUpload" className="font-semibold">Actualizar Foto de Perfil</Label>
                  <div className="relative">
                      <Button asChild variant="outline" size="sm">
                          <label htmlFor="imageUpload" className="cursor-pointer">
                              <Upload className="mr-2 h-4 w-4" />
                              Seleccionar Archivo
                          </label>
                      </Button>
                      <Input 
                          id="imageUpload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                          className="absolute w-full h-full opacity-0 cursor-pointer"
                      />
                  </div>
                  <p className="text-xs text-muted-foreground">Sube una nueva foto. Formatos recomendados: JPG, PNG.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <Label htmlFor="researcherName">Nombre Completo</Label>
                  <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="researcherName" name="researcherName" defaultValue={researcher.name} required className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico (No modificable)</Label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="email" name="email" value={researcher.email} readOnly disabled className="pl-10 bg-muted/50 cursor-not-allowed" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID iD (No modificable)</Label>
                  <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="orcid" name="orcid" value={researcher.orcid} readOnly disabled className="pl-10 bg-muted/50 cursor-not-allowed" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="institution">Institución</Label>
                  <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="institution" name="institution" defaultValue={researcher.institution || ''} placeholder="Ej: Universidad de Galápagos" className="pl-10" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="specialization">Especialización</Label>
                  <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="specialization" name="specialization" defaultValue={researcher.specialization || ''} placeholder="Ej: Biología Marina" className="pl-10" />
                  </div>
              </div>
          </div>

          <div className="flex justify-end">
              <SubmitButton />
          </div>
        </form>
        
        {isAdmin && <ScrapingTrigger />}
      </>
  );
}


function ProfilePageContent() {
  const { userEmail, researcher, role, isLoading: authIsLoading } = useAuth();
  const { t } = useLanguage();
  
  if (authIsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <div className="flex items-center gap-6 mt-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!researcher) {
    return (
      <p>No se pudo cargar la información del perfil. Por favor, intenta iniciar sesión de nuevo.</p>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Mi Perfil</CardTitle>
        <CardDescription>
          Aquí puedes ver y actualizar tu información personal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm researcher={researcher} isAdmin={role === 'admin'} />
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<p>Cargando perfil...</p>}>
           <ProfilePageContent />
        </Suspense>
    );
}
