
import { getResearchersAction } from '@/app/actions';
import CollaboratorsPageClient from './CollaboratorsPageClient';
import { getTranslations } from '@/lib/translations';

export async function generateMetadata() {
    const t = getTranslations('es'); 
    return {
        title: `${t.collaborators} | Galápagos DataLens`
    }
}

export default async function CollaboratorsPage() {
    const allResearchers = await getResearchersAction();
    const verifiedResearchers = allResearchers.filter(r => r.isVerified);
    
    return <CollaboratorsPageClient researchers={verifiedResearchers} />;
}
