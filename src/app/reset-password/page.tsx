
"use client";

import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPasswordAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFormStatus } from 'react-dom';
import { KeyRound, Lock, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Restableciendo...' : 'Restablecer Contraseña'}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if(state.message) {
        if (!state.success) {
            toast({
                title: 'Error al Restablecer',
                description: state.message,
                variant: 'destructive',
            });
        }
        // Success is handled by redirect in the server action
    }
  }, [state, toast, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary">
            <KeyRound className="mr-2 h-6 w-6" />
            Restablecer Contraseña
          </CardTitle>
          <CardDescription>
            Introduce tu correo electrónico y tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" name="password" type="password" placeholder="••••••••" required className="pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required className="pl-10" />
              </div>
            </div>

            <SubmitButton />
          </form>
            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Volver a Iniciar Sesión
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    