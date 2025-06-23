"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { enrichSpeciesDataAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Species } from "@/lib/species";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline" size="sm">
      <BrainCircuit className="mr-2 h-4 w-4" />
      {pending ? "Enriqueciendo..." : "Enriquecer con IA"}
    </Button>
  );
}

const initialState = { success: false, message: "" };

export default function EnrichButton({ species }: { species: Species }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(enrichSpeciesDataAction, initialState);
  const prevMessageRef = useRef<string>();

  useEffect(() => {
    if (state.message && state.message !== prevMessageRef.current) {
      toast({
        title: state.success ? "Éxito" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      prevMessageRef.current = state.message;
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <input type="hidden" name="speciesId" value={species.id} />
      <SubmitButton />
    </form>
  );
}
