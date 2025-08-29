
"use client";

import type { Researcher } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Building, Award, Users, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type CollaboratorsPageClientProps = {
  researchers: Omit<Researcher, 'password'>[];
};

export default function CollaboratorsPageClient({ researchers }: CollaboratorsPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
                <Users className="h-10 w-10" />
                {t.collaborators_title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.collaborators_description}
            </p>
        </div>

        {researchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {researchers.map((researcher) => (
                    <Card key={researcher.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 border-4 border-primary mb-4">
                                <AvatarImage src={researcher.profileImageUrl || undefined} alt={researcher.name} />
                                <AvatarFallback>{researcher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl font-semibold text-primary">{researcher.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                                {researcher.institution && (
                                    <p className="flex items-start gap-2">
                                        <Building className="h-4 w-4 mt-0.5 shrink-0" /> 
                                        <span>{researcher.institution}</span>
                                    </p>
                                )}
                                {researcher.specialization && (
                                    <p className="flex items-start gap-2">
                                        <Award className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span>{researcher.specialization}</span>
                                    </p>
                                )}
                                <p className="flex items-start gap-2">
                                    <Mail className="h-4 w-4 mt-0.5 shrink-0" /> 
                                    <a href={`mailto:${researcher.email}`} className="hover:underline text-primary break-all">{researcher.email}</a>
                                </p>
                                <p className="flex items-start gap-2">
                                    <Fingerprint className="h-4 w-4 mt-0.5 shrink-0" />
                                     <a href={`https://orcid.org/${researcher.orcid}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary break-all">{researcher.orcid}</a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-lg font-medium text-foreground">{t.collaborators_no_results}</p>
                <p className="text-muted-foreground mt-1">{t.collaborators_check_back}</p>
            </div>
        )}
    </div>
  );
}
