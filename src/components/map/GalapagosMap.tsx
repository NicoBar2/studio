"use client";

import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";

// Datos para los puntos de acceso sobre los nombres de las islas en la imagen del mapa.
// Las coordenadas son porcentajes (x: left, y: top).
const mapIslandsData = [
  { id: 'Pinta', name: 'Pinta', hotspot: { x: 33, y: 6, width: 8, height: 4 } },
  { id: 'Marchena', name: 'Marchena', hotspot: { x: 48, y: 15, width: 12, height: 4 } },
  { id: 'Genovesa', name: 'Genovesa', hotspot: { x: 77, y: 18, width: 12, height: 4 } },
  { id: 'Santiago', name: 'Santiago', hotspot: { x: 40, y: 36, width: 11, height: 4 } },
  { id: 'Fernandina', name: 'Fernandina', hotspot: { x: 10, y: 42, width: 14, height: 4 } },
  { id: 'Isabela', name: 'Isabela', hotspot: { x: 30, y: 60, width: 10, height: 4 } },
  { id: 'Pinzón', name: 'Pinzón', hotspot: { x: 46, y: 48, width: 8, height: 3 } },
  { id: 'Santa Cruz', name: 'Santa Cruz', hotspot: { x: 55, y: 55, width: 15, height: 4 } },
  { id: 'Santa Fé', name: 'Santa Fé', hotspot: { x: 69, y: 63, width: 10, height: 4 } },
  { id: 'San Cristobal', name: 'San Cristobal', hotspot: { x: 81, y: 70, width: 18, height: 8 } },
  { id: 'Floreana', name: 'Floreana', hotspot: { x: 55, y: 86, width: 11, height: 4 } },
  { id: 'Española', name: 'Española', hotspot: { x: 78, y: 91, width: 11, height: 4 } },
  { id: 'North Seymour', name: 'North Seymour', hotspot: { x: 58, y: 42, width: 13, height: 3 } },
];


type GalapagosMapProps = {
  onIslandClick: (islandName: string) => void;
  selectedIsland: string | null;
};

const GalapagosMap: React.FC<GalapagosMapProps> = ({ onIslandClick, selectedIsland }) => {
  // IMPORTANTE: La imagen del mapa debe estar en public/images/galapagos_map_real.png
  const imageSrc = '/images/galapagos_map_real.png'; 

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[1.18] bg-secondary/30 rounded-lg shadow-md overflow-hidden">
      <Image
        src={imageSrc}
        alt="Mapa de las Islas Galápagos"
        layout="fill"
        objectFit="contain" 
        priority
        unoptimized={true} 
      />
      {mapIslandsData.map((island) => {
        const isSelected = selectedIsland === island.name;
        return (
          <React.Fragment key={island.id}>
            {/* Punto Clicable (Hotspot) sobre el nombre de la isla */}
            <button
              title={`Isla ${island.name}`}
              onClick={() => onIslandClick(island.name)}
              className={cn(
                "absolute rounded-md focus:outline-none transition-colors duration-200 ease-in-out",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                isSelected 
                  ? "bg-primary/50 border-2 border-primary" 
                  : "bg-transparent hover:bg-primary/30",
              )}
              style={{
                left: `${island.hotspot.x}%`,
                top: `${island.hotspot.y}%`,
                width: `${island.hotspot.width}%`,
                height: `${island.hotspot.height}%`,
              }}
              aria-label={`Seleccionar isla ${island.name}`}
              aria-pressed={isSelected}
            />
          </React.Fragment>
        );
      })}
      <p className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/70 p-1 rounded shadow">
        Haz clic en el nombre de una isla para ver sus especies
      </p>
    </div>
  );
};

export default GalapagosMap;
