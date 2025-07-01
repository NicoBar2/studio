
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteSpeciesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type DeleteSpeciesButtonProps = {
  speciesId: string;
  speciesName: string;
  onDeleteSuccess: (id: string) => void;
};

const initialState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Eliminando..." : "Sí, eliminar"}
    </Button>
  );
}

export default function DeleteSpeciesButton({ speciesId, speciesName, onDeleteSuccess }: DeleteSpeciesButtonProps) {
  const { toast } = useToast();
  const { role } = useAuth();
  const [state, formAction] = useActionState(deleteSpeciesAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const prevMessageRef = useRef<string>();

  useEffect(() => {
    if (state.message && state.message !== prevMessageRef.current) {
      toast({
        title: state.success ? "Éxito" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        onDeleteSuccess(speciesId);
        setIsOpen(false); // Close the dialog on success
      }
      prevMessageRef.current = state.message;
    }
  }, [state, toast, speciesId, onDeleteSuccess]);
  
  // Only admins can delete
  if (role !== 'admin') {
      return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
            ¿Estás seguro?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar permanentemente la especie <strong>{speciesName}</strong>. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="speciesId" value={speciesId} />
            <input type="hidden" name="userRole" value={role || ''} />
            <AlertDialogAction asChild>
              <SubmitButton />
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
