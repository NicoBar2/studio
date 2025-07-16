
"use client";

import type { Researcher } from '@/lib/types';
import { useActionState, useEffect, useRef } from 'react';
import { deleteResearcherAction, toggleResearcherVerificationAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Mail, Building, Award, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type ResearcherItemProps = {
  researcher: Researcher;
  onDelete: (researcherId: string) => void;
  onVerificationChange: (updatedResearcher: Researcher) => void;
};

const initialDeleteState = {
  success: false,
  message: '',
  deletedResearcherId: undefined as string | undefined,
};

const initialVerifyState = {
  success: false,
  message: '',
  updatedResearcher: undefined as Researcher | undefined,
};

export default function ResearcherItem({ researcher, onDelete, onVerificationChange }: ResearcherItemProps) {
  const { toast } = useToast();
  const { role } = useAuth();
  const { t } = useLanguage();
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteResearcherAction,
    initialDeleteState
  );
  const [verifyState, verifyFormAction, isVerifying] = useActionState(
    toggleResearcherVerificationAction,
    initialVerifyState
  );

  const prevDeleteMessageRef = useRef<string>();
  const prevVerifyMessageRef = useRef<string>();

  useEffect(() => {
    if (deleteState.message && deleteState.message !== prevDeleteMessageRef.current) {
      toast({
        title: deleteState.success ? t.success : t.error,
        description: deleteState.message,
        variant: deleteState.success ? 'default' : 'destructive',
      });
      if (deleteState.success && deleteState.deletedResearcherId) {
        onDelete(deleteState.deletedResearcherId);
      }
      prevDeleteMessageRef.current = deleteState.message;
    }
  }, [deleteState, toast, onDelete, t]);

  useEffect(() => {
    if (verifyState.message && verifyState.message !== prevVerifyMessageRef.current) {
      toast({
        title: verifyState.success ? t.success : t.error,
        description: verifyState.message,
        variant: verifyState.success ? 'default' : 'destructive',
      });
      if (verifyState.success && verifyState.updatedResearcher) {
        onVerificationChange(verifyState.updatedResearcher);
      }
      prevVerifyMessageRef.current = verifyState.message;
    }
  }, [verifyState, toast, onVerificationChange, t]);

  return (
    <li className="p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary shrink-0" />
            <h3 className="text-lg font-semibold text-primary">{researcher.name}</h3>
            <Badge variant={researcher.isVerified ? 'default' : 'secondary'} className="ml-auto sm:ml-2">
              {researcher.isVerified ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
              {researcher.isVerified ? t.verified : t.pending}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> {researcher.email}
          </p>
          {researcher.institution && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" /> {researcher.institution}
            </p>
          )}
          {researcher.specialization && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> {researcher.specialization}
            </p>
          )}
           <p className="text-xs text-muted-foreground">ID: {researcher.id}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-2 shrink-0">
          <form action={verifyFormAction} className="w-full sm:w-auto">
            <input type="hidden" name="researcherId" value={researcher.id} />
            <input type="hidden" name="userRole" value={role || ''} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-center"
              disabled={isVerifying}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isVerifying ? t.updating : (researcher.isVerified ? t.markUnverified : t.markVerified)}
            </Button>
          </form>
          <form action={deleteFormAction} className="w-full sm:w-auto">
            <input type="hidden" name="researcherId" value={researcher.id} />
            <input type="hidden" name="userRole" value={role || ''} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="w-full justify-center"
              aria-label={`${t.deleteButton} ${researcher.name}`}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? t.deleting : t.deleteButton}
            </Button>
          </form>
        </div>
      </div>
    </li>
  );
}

    