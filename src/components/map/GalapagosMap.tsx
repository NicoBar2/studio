"use client";

import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";
import mapImage from './map_galapagos-islands.png';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin } from 'lucide-react';

const mapIslandsData = [
  { id: 'Darwin', name: 'Darwin' },
  { id: 'Wolf', name: 'Wolf' },
  { id: 'Pinta', name: 'Pinta' },
  { id: 'Marchena', name: 'Marchena' },
  { id: 'Genovesa', name: 'Genovesa' },
  { id: 'Santiago', name: 'Santiago' },
  { id: 'Fernandina', name: 'Fernandina' },
  { id: 'Isabela', name: 'Isabela' },
  { id: 'Pinzón', name: 'Pinzón' },
  { id: 'Santa Cruz', name: 'Santa Cruz' },
  { id: 'North Seymour', name: 'North Seymour' },
  { id: 'Santa Fé', name: 'Santa Fé' },
  { id: 'San Cristobal', name: 'San Cristobal' },
  { id: 'Floreana', name: 'Floreana' },
  { id: 'Española', name: 'Española' },
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

type GalapagosMapProps = {
  onIslandClick: (islandName: string) => void;
  selectedIsland: string | null;
};

const GalapagosMap: React.FC<GalapagosMapProps> = ({ onIslandClick, selectedIsland }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start p-4 bg-muted/30 rounded-lg shadow-md">
      {/* Left side: Island List */}
      <div className="w-full md:w-1/3 lg:w-1/4">
        <h3 className="font-semibold mb-2 text-lg text-primary flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Seleccionar Isla
        </h3>
        <ScrollArea className="h-64 md:h-96 pr-3">
            <div className="flex flex-col gap-1">
                {mapIslandsData.map(island => (
                    <Button
                        key={island.id}
                        onClick={() => onIslandClick(island.name)}
                        variant={selectedIsland === island.name ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto py-2"
                        aria-pressed={selectedIsland === island.name}
                    >
                        {island.name}
                    </Button>
                ))}
            </div>
        </ScrollArea>
      </div>

      {/* Right side: Map Image */}
      <div className="relative w-full md:w-2/3 lg:w-3/4">
        <Image
          src={mapImage}
          alt="Mapa de las Islas Galápagos"
          className="w-full h-auto rounded-md shadow-sm"
          priority
        />
        <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 pointer-events-none" />
        {selectedIsland && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-sm font-bold py-1 px-3 rounded-full shadow-lg">
            {selectedIsland}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalapagosMap;
