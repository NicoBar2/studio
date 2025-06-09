
import Link from 'next/link';
import Image from 'next/image';
import type { Species } from '@/lib/species';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Turtle, Bird, Footprints, ShieldQuestion, Waves, Bug, type LucideIcon, HelpCircle } from 'lucide-react';

type SpeciesCardProps = {
  species: Species;
};

const iconMap: Record<string, LucideIcon> = {
  Turtle,
  Bird,
  Footprints,
  ShieldQuestion,
  Waves,
  Bug,
  Default: HelpCircle, // Fallback icon
};

export default function SpeciesCard({ species }: SpeciesCardProps) {
  const IconComponent = iconMap[species.icon] || iconMap.Default;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <Image
          src={species.imageUrl}
          alt={species.name}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
          data-ai-hint={species.dataAiHint}
        />
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex items-center mb-2">
          <IconComponent className="h-8 w-8 text-primary mr-3" />
          <CardTitle className="text-2xl font-headline text-primary">{species.name}</CardTitle>
        </div>
        <CardDescription className="italic text-sm text-muted-foreground mb-3">{species.scientificName}</CardDescription>
        <p className="text-sm text-foreground mb-4 line-clamp-3 flex-grow">{species.description}</p>
        
        <div className="mb-4">
          <Badge variant={species.conservationStatus === 'En Peligro' || species.conservationStatus === 'En Peligro Crítico' ? 'destructive' : 'secondary'}>
            {species.conservationStatus}
          </Badge>
        </div>
        
        <div className="mt-auto">
          <Button asChild variant="default" className="w-full group">
            <Link href={`/species/${species.id}`} className="flex items-center justify-center">
              Saber Más
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    