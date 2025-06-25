
"use client";

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFormStatus } from 'react-dom';
import { KeyRound, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary">
            <KeyRound className="mr-2 h-6 w-6" />
            Recuperar Contraseña
          </CardTitle>
          <CardDescription>
            Introduce tu correo electrónico y te enviaremos (de forma simulada) un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {state.message && (
              <Alert variant={state.success ? 'default' : 'destructive'} className={state.success ? "bg-green-50 border-green-200" : ""}>
                 {state.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>{state.success ? 'Solicitud Enviada' : 'Error'}</AlertTitle>
                <AlertDescription>
                  {state.message}
                  {state.success && (
                    <>
                      {' '}
                      <Link href="/reset-password" className="font-bold underline hover:text-primary">
                         Haz clic aquí para continuar.
                      </Link>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

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
