
"use client";

import { useState } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, FileUp, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface ResultState {
  status: UploadStatus;
  message: string;
}

export default function AiImporterPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resultState, setResultState] = useState<ResultState>({ status: 'idle', message: '' });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setResultState({ status: 'idle', message: '' });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({
        title: 'Ningún archivo seleccionado',
        description: 'Por favor, selecciona un archivo CSV para subir.',
        variant: 'destructive',
      });
      return;
    }

    setResultState({ status: 'uploading', message: 'Subiendo archivo...' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setResultState({ status: 'success', message: result.message });
        toast({
          title: 'Éxito',
          description: result.message,
          variant: 'default',
        });
      } else {
        setResultState({ status: 'error', message: result.message || 'Ocurrió un error desconocido.' });
        toast({
          title: 'Error en la importación',
          description: result.message || 'No se pudo procesar el archivo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de red o del servidor.';
      setResultState({ status: 'error', message: errorMessage });
      toast({
        title: 'Error Crítico',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = () => {
    switch (resultState.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="mr-2 h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="mr-2 h-4 w-4" />;
      default:
        return <FileUp className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline text-primary">
              <UploadCloud className="mr-3 h-7 w-7" />
              Importador Inteligente de CSV
            </CardTitle>
            <CardDescription>
              Sube un archivo CSV con datos de especies. La IA analizará el contenido, extraerá las columnas relevantes y guardará la información en la base de datos de Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="speciesFile" className="font-semibold">Archivo CSV de Especies</Label>
                <Input
                  id="speciesFile"
                  name="speciesFile"
                  type="file"
                  className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  accept=".csv"
                  required
                  onChange={handleFileChange}
                  disabled={resultState.status === 'uploading' || resultState.status === 'processing'}
                />
                <p className="text-xs text-muted-foreground mt-1">Asegúrate de que el archivo esté en formato .csv.</p>
              </div>
              <Button type="submit" disabled={!selectedFile || resultState.status === 'uploading' || resultState.status === 'processing'} className="w-full sm:w-auto">
                {getStatusIcon()}
                {resultState.status === 'uploading' ? 'Subiendo...' : resultState.status === 'processing' ? 'Procesando con IA...' : 'Procesar Archivo'}
              </Button>
            </form>
            
            {resultState.status !== 'idle' && (
              <Alert className="mt-6" variant={resultState.status === 'error' ? 'destructive' : 'default'}>
                {resultState.status === 'success' && <CheckCircle className="h-4 w-4" />}
                {resultState.status === 'error' && <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>
                  {resultState.status === 'success' && 'Proceso Completado'}
                  {resultState.status === 'error' && 'Error en el Proceso'}
                  {(resultState.status === 'uploading' || resultState.status === 'processing') && 'Proceso en Curso'}
                </AlertTitle>
                <AlertDescription>
                  {resultState.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedGuard>
  );
}
