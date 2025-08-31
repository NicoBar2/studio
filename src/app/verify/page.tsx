
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyResearcherAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Home } from 'lucide-react';
import Link from 'next/link';

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando tu cuenta, por favor espera...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se proporcionó un token de verificación. El enlace puede ser inválido.');
      return;
    }

    const verifyToken = async () => {
      const result = await verifyResearcherAction(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <Card className="w-full max-w-md shadow-xl text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          {status === 'verifying' && 'Verificando Cuenta'}
          {status === 'success' && '¡Verificación Exitosa!'}
          {status === 'error' && 'Error de Verificación'}
        </CardTitle>
        <CardDescription>
          {status === 'verifying' && 'Estamos procesando tu verificación.'}
          {status === 'success' && 'Tu cuenta ha sido activada.'}
          {status === 'error' && 'No pudimos verificar tu cuenta.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-center h-24">
          {status === 'verifying' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
        </div>
        <p className="text-lg text-foreground">{message}</p>
        {status === 'success' && (
          <Button asChild>
            <Link href="/login">Ir a Iniciar Sesión</Link>
          </Button>
        )}
        {status === 'error' && (
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Si crees que esto es un error, por favor contacta al administrador.</p>
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Volver a la Página Principal
                    </Link>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function VerifyPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
                <VerificationContent />
            </Suspense>
        </div>
    )
}
