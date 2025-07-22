
"use client";

import { useState, type FormEvent, useActionState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, UserPlus, KeyRound, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createResearcherAction } from '@/app/actions';
import type { Researcher } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function LoginContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      toast({
        title: 'Éxito',
        description: 'Tu contraseña ha sido restablecida. Por favor, inicia sesión con tus nuevas credenciales.',
        variant: 'default',
      });
    }
  }, [searchParams, toast]);
  
  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
         <Card className="shadow-xl border-t-0 rounded-t-none">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Acceder</CardTitle>
            <CardDescription>
              Investigadores verificados, si es su primer acceso, la contraseña que ingresen se establecerá como su nueva contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="register">
         <Card className="shadow-xl border-t-0 rounded-t-none">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline text-primary">
              <UserPlus className="mr-2 h-6 w-6" />
              Registro de Investigador
            </CardTitle>
            <CardDescription>
              Crea una cuenta. Un administrador deberá verificarla antes de que puedas iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Error desconocido durante el inicio de sesión.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-input"
        />
        <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres.</p>
      </div>
       <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline flex items-center gap-1">
             <KeyRound className="h-4 w-4"/> ¿Olvidaste tu contraseña?
          </Link>
        </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}

const initialRegisterState = {
  success: false,
  message: '',
  researcher: undefined as Researcher | undefined,
};

function RegisterForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [state, formAction, isPending] = useActionState(createResearcherAction, initialRegisterState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        setShowSuccessDialog(true);
        formRef.current?.reset();
      } else {
        toast({
          title: 'Error de Registro',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="researcherName">Nombre Completo</Label>
          <Input id="researcherName" name="researcherName" placeholder="Ej: Dra. Jane Goodall" required />
          <p className="text-xs text-muted-foreground">Debe contener solo letras y al menos un nombre y un apellido.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Correo Electrónico</Label>
          <Input id="register-email" name="email" type="email" placeholder="tu@email.com" required />
          <p className="text-xs text-muted-foreground">Utiliza un correo electrónico institucional si es posible.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="institution">Institución (Opcional)</Label>
          <Input id="institution" name="institution" placeholder="Ej: Universidad de Galápagos" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Especialización (Opcional)</Label>
          <Input id="specialization" name="specialization" placeholder="Ej: Biología Marina" />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Crear Cuenta'}
        </Button>
      </form>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                ¡Registro Enviado!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {state.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
            Entendido
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
