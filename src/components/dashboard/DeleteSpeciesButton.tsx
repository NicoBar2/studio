
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
import { useLanguage } from "@/contexts/LanguageContext";

type DeleteSpeciesButtonProps = {
  speciesId: string;
  speciesName: string;
  onDeleteSuccess: (id: string) => void;
};

const initialState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? t.deleting : t.confirmDelete}
    </Button>
  );
}

export default function DeleteSpeciesButton({ speciesId, speciesName, onDeleteSuccess }: DeleteSpeciesButtonProps) {
  const { toast } = useToast();
  const { role } = useAuth();
  const { t } = useLanguage();
  const [state, formAction] = useActionState(deleteSpeciesAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const prevMessageRef = useRef<string>();

  useEffect(() => {
    if (state.message && state.message !== prevMessageRef.current) {
      toast({
        title: state.success ? t.success : t.error,
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        onDeleteSuccess(speciesId);
        setIsOpen(false); // Close the dialog on success
      }
      prevMessageRef.current = state.message;
    }
  }, [state, toast, speciesId, onDeleteSuccess, t]);
  
  // Only admins can delete
  if (role !== 'admin') {
      return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          {t.deleteButton}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
            {t.areYouSure}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteWarning(speciesName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
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

    