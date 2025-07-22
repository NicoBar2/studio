
"use client";

import { useEffect, useState, useActionState, useRef } from 'react';
import { createResearcherAction, getResearchersAction } from '@/app/actions';
import type { Researcher } from '@/lib/types';
import ResearcherItem from './ResearcherItem'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ListChecks, Fingerprint } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

const initialFormState = {
  success: false,
  message: '',
  researcher: undefined as Researcher | undefined,
};

export default function ResearcherManagementClient() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, formAction, isCreating] = useActionState(createResearcherAction, initialFormState);
  
  const [researcherName, setResearcherName] = useState('');
  const [email, setEmail] = useState('');
  const [orcid, setOrcid] = useState('');
  const [institution, setInstitution] = useState('');
  const [specialization, setSpecialization] = useState('');


  useEffect(() => {
    async function fetchResearchers() {
      setIsLoadingList(true);
      const fetchedResearchers = await getResearchersAction();
      setResearchers(fetchedResearchers);
      setIsLoadingList(false);
    }
    fetchResearchers();
  }, []);
  
  useEffect(() => {
    if (formState.message && formState.message !== initialFormState.message) { 
      toast({
        title: formState.success ? t.success : t.error,
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success && formState.researcher) {
        setResearchers(prev => [formState.researcher!, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        // Reset form fields
        setResearcherName('');
        setEmail('');
        setOrcid('');
        setInstitution('');
        setSpecialization('');
        formRef.current?.reset();
      }
    }
  }, [formState, toast, t]);

  const handleDeleteResearcher = (researcherId: string) => {
    setResearchers(prev => prev.filter(r => r.id !== researcherId));
  };

  const handleVerificationChange = (updatedResearcher: Researcher) => {
    setResearchers(prev => 
      prev.map(r => r.id === updatedResearcher.id ? updatedResearcher : r)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary">
            <UserPlus className="mr-3 h-7 w-7" />
            {t.admin_create_researcher_title}
          </CardTitle>
          <CardDescription>
            {t.admin_create_researcher_desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            ref={formRef}
            action={(formData) => {
              formAction(formData);
            }} 
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="researcherNameAdmin" className="font-semibold">{t.fullName}</Label>
                <Input 
                  id="researcherNameAdmin" 
                  name="researcherName" 
                  placeholder={t.fullNamePlaceholder}
                  className="mt-1" 
                  required 
                  minLength={3}
                  value={researcherName}
                  onChange={(e) => setResearcherName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="emailAdmin" className="font-semibold">{t.email}</Label>
                <Input 
                  id="emailAdmin" 
                  name="email" 
                  type="email"
                  placeholder={t.emailPlaceholder}
                  className="mt-1" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="orcidAdmin" className="font-semibold">ORCID ID</Label>
                <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        id="orcidAdmin" 
                        name="orcid" 
                        placeholder="0000-0000-0000-0000"
                        className="mt-1 pl-10" 
                        required 
                        value={orcid}
                        onChange={(e) => setOrcid(e.target.value)}
                    />
                </div>
              </div>
              <div>
                <Label htmlFor="institutionAdmin" className="font-semibold">{t.institution} ({t.optional})</Label>
                <Input 
                  id="institutionAdmin" 
                  name="institution" 
                  placeholder={t.institutionPlaceholder}
                  className="mt-1" 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="specializationAdmin" className="font-semibold">{t.specialization} ({t.optional})</Label>
                <Input 
                  id="specializationAdmin" 
                  name="specialization" 
                  placeholder={t.specializationPlaceholder}
                  className="mt-1" 
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
              {isCreating ? t.creating : t.createResearcherButton}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline text-primary">
            <ListChecks className="mr-3 h-7 w-7" />
            {t.researcherList}
          </CardTitle>
          <CardDescription>
            {t.researcherListDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-4/5 rounded-md" />
            </div>
          ) : researchers.length > 0 ? (
            <ul className="space-y-3">
              {researchers.map((researcher) => (
                <ResearcherItem 
                  key={researcher.id} 
                  researcher={researcher} 
                  onDelete={handleDeleteResearcher}
                  onVerificationChange={handleVerificationChange}
                />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">{t.noResearchersYet}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
