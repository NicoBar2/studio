"use client";

import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";
import mapImage from './map_galapagos-islands.png';

// Datos para los puntos de acceso (hotspots) sobre los nombres de las islas en la imagen del mapa.
// Las coordenadas son porcentajes (x: left, y: top).
const mapIslandsData = [
  { id: 'Darwin', name: 'Darwin', hotspot: { x: 7, y: 1, width: 10, height: 4 } },
  { id: 'Wolf', name: 'Wolf', hotspot: { x: 12, y: 7, width: 8, height: 4 } },
  { id: 'Pinta', name: 'Pinta', hotspot: { x: 31, y: 22, width: 9, height: 4 } },
  { id: 'Marchena', name: 'Marchena', hotspot: { x: 46, y: 27, width: 13, height: 4 } },
  { id: 'Genovesa', name: 'Genovesa', hotspot: { x: 75, y: 29, width: 13, height: 4 } },
  { id: 'Santiago', name: 'Santiago', hotspot: { x: 41, y: 49, width: 13, height: 5 } },
  { id: 'Fernandina', name: 'Fernandina', hotspot: { x: 6, y: 53, width: 15, height: 4 } },
  { id: 'Isabela', name: 'Isabela', hotspot: { x: 26, y: 73, width: 12, height: 5 } },
  { id: 'Pinzón', name: 'Pinzón', hotspot: { x: 44, y: 59, width: 9, height: 3 } },
  { id: 'Santa Cruz', name: 'Santa Cruz', hotspot: { x: 53, y: 64, width: 16, height: 4 } },
  { id: 'North Seymour', name: 'North Seymour', hotspot: { x: 56, y: 54, width: 14, height: 3 } },
  { id: 'Santa Fé', name: 'Santa Fé', hotspot: { x: 66, y: 72, width: 11, height: 4 } },
  { id: 'San Cristobal', name: 'San Cristobal', hotspot: { x: 78, y: 78, width: 20, height: 8 } },
  { id: 'Floreana', name: 'Floreana', hotspot: { x: 52, y: 89, width: 12, height: 4 } },
  { id: 'Española', name: 'Española', hotspot: { x: 76, y: 93, width: 12, height: 4 } },
];


type GalapagosMapProps = {
  onIslandClick: (islandName: string) => void;
  selectedIsland: string | null;
};

const GalapagosMap: React.FC<GalapagosMapProps> = ({ onIslandClick, selectedIsland }) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto bg-secondary/30 rounded-lg shadow-md">
      <Image
        src={mapImage}
        alt="Mapa de las Islas Galápagos"
        className="w-full h-auto"
        priority
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
