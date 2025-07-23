
import { getResearchersAction } from '@/app/actions';
import { getTranslations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Award, Fingerprint, Users } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata() {
    const t = getTranslations('es'); 
    return {
        title: `${t.collaborators} | Galápagos DataLens`,
        description: t.collaborators_description,
    }
}

export default async function CollaboratorsPage() {
    const t = getTranslations('es'); // Defaulting to Spanish for server-side text
    const allResearchers = await getResearchersAction();
    const verifiedResearchers = allResearchers.filter(r => r.isVerified);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
                    <Users className="mr-3 h-8 w-8" />
                    {t.collaborators_title}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    {t.collaborators_description}
                </p>
            </div>

            {verifiedResearchers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {verifiedResearchers.map(researcher => (
                        <Card key={researcher.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                                    <AvatarImage src={researcher.profileImageUrl || undefined} alt={researcher.name} />
                                    <AvatarFallback>{researcher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold text-primary">{researcher.name}</h2>

                                <div className="mt-4 space-y-2 text-sm text-muted-foreground w-full">
                                    {researcher.institution && (
                                        <div className="flex items-start justify-center gap-2">
                                            <Building className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span className="text-left">{researcher.institution}</span>
                                        </div>
                                    )}
                                    {researcher.specialization && (
                                        <div className="flex items-start justify-center gap-2">
                                            <Award className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span className="text-left">{researcher.specialization}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start justify-center gap-2 pt-2">
                                        <Fingerprint className="h-4 w-4 mt-0.5 shrink-0" />
                                        <Link 
                                            href={`https://orcid.org/${researcher.orcid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {researcher.orcid}
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border border-dashed rounded-lg">
                    <p className="text-lg font-medium text-foreground">
                        {t.collaborators_no_results}
                    </p>
                    <p className="text-muted-foreground mt-1">
                        {t.collaborators_check_back}
                    </p>
                </div>
            )}
        </div>
    );
}
