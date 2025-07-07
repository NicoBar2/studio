"use client";

import { useActionState, useEffect, useRef, useState } from 'react';
import RoleBasedGuard from '@/components/auth/RoleBasedGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot, FileQuestion, Sparkles, User, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { askQuestionAboutFileAction } from '@/app/actions';
import { useFormStatus } from 'react-dom';

const initialState = {
  success: false,
  message: '',
  answer: undefined as string | undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Hacer Pregunta
        </>
      )}
    </Button>
  );
}

export default function ChatWithFilePage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [state, formAction] = useActionState(askQuestionAboutFileAction, initialState);

  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<{question: string, answer: string}[]>([]);


  useEffect(() => {
    if (state.message && state.answer !== undefined) {
      if (state.success) {
        setConversation(prev => [...prev, { question, answer: state.answer! }]);
        setQuestion(''); // Clear question input
      } else {
        toast({
            title: 'Error',
            description: state.message,
            variant: 'destructive',
        });
      }
    } else if (state.message && state.answer === undefined && !state.success) {
        // Handle errors that happen before getting an answer (e.g., file upload error)
        toast({
            title: 'Error',
            description: state.message,
            variant: 'destructive',
        });
    }
  }, [state, toast, question]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      // When a new file is selected, clear the old conversation
      setConversation([]);
    } else {
      setFileName('');
    }
  };
  
  const handleFormSubmit = (formData: FormData) => {
    // Keep the question in state to display it in the conversation history
    setQuestion(formData.get('question') as string);
    formAction(formData);
  }

  return (
    <RoleBasedGuard allowedRoles={['admin', 'researcher']}>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel Principal
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline text-primary">
              <FileQuestion className="mr-3 h-7 w-7" />
              Bot de Conocimiento Personalizado
            </CardTitle>
            <CardDescription>
              Sube un archivo (PDF o TXT) y hazle preguntas al bot. La IA responderá basándose únicamente en el contenido del documento que proporciones. Cada vez que subas un nuevo archivo, la conversación se reiniciará.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentFile" className="font-semibold">Sube tu Archivo</Label>
                <Input 
                  id="documentFile" 
                  name="documentFile" 
                  type="file" 
                  ref={fileInputRef}
                  className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  accept=".pdf,.txt"
                  required
                  onChange={handleFileChange}
                />
                 {fileName && <p className="text-sm text-muted-foreground mt-1">Archivo seleccionado: {fileName}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="question" className="font-semibold">Tu Pregunta</Label>
                  <Textarea
                      id="question"
                      name="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={3}
                      className="mt-1"
                      placeholder="Ej: ¿Cuáles son las principales amenazas para la especie X según este documento?"
                      required
                  />
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        {conversation.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Conversación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {conversation.map((entry, index) => (
                        <div key={index}>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-muted rounded-full"><User className="h-5 w-5 text-muted-foreground"/></div>
                                <div className="flex-1 p-3 bg-muted rounded-lg">
                                    <p className="font-semibold">Tú</p>
                                    <p>{entry.question}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 mt-4">
                                <div className="p-2 bg-primary/10 rounded-full"><Bot className="h-5 w-5 text-primary"/></div>
                                <div className="flex-1 p-3 bg-primary/10 rounded-lg">
                                    <p className="font-semibold text-primary">Bot Asistente</p>
                                    <p className="whitespace-pre-wrap">{entry.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>
    </RoleBasedGuard>
  );
}
