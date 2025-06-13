
"use client";

import type { Researcher } from '@/lib/researchers';
import { useActionState, useEffect } from 'react';
import { deleteResearcherAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Users } from 'lucide-react';

type ResearcherItemProps = {
  researcher: Researcher;
  onDelete: (researcherId: string) => void;
};

const initialDeleteState = {
  success: false,
  message: '',
  deletedResearcherId: undefined as string | undefined,
};

export default function ResearcherItem({ researcher, onDelete }: ResearcherItemProps) {
  const { toast } = useToast();
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteResearcherAction,
    initialDeleteState
  );

  useEffect(() => {
    if (deleteState.message && deleteState.message !== initialDeleteState.message) { // Ensure message has changed
      toast({
        title: deleteState.success ? '¡Éxito!' : 'Error',
        description: deleteState.message,
        variant: deleteState.success ? 'default' : 'destructive',
      });
      if (deleteState.success && deleteState.deletedResearcherId) {
        onDelete(deleteState.deletedResearcherId);
      }
    }
  }, [deleteState, toast, onDelete]);

  return (
    <li className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
      <div className="flex items-center">
        <Users className="h-5 w-5 mr-3 text-primary shrink-0" />
        <div>
            <span className="font-medium">{researcher.name}</span>
            <p className="text-xs text-muted-foreground">ID: {researcher.id}</p>
        </div>
      </div>
      <form action={deleteFormAction} className="ml-2">
        <input type="hidden" name="researcherId" value={researcher.id} />
        <Button
          type="submit"
          variant="destructive"
          size="sm-icon"
          aria-label={`Eliminar a ${researcher.name}`}
          disabled={isDeleting}
          className="shrink-0"
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Trash2 className="h-4 w-4 text-destructive-foreground" />
          )}
        </Button>
      </form>
    </li>
  );
}
