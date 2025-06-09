
"use client";

import Image from 'next/image';
import React from 'react';
import { cn } from "@/lib/utils";

// Data for island hotspots and labels. Coordinates are percentages (top, left, width, height for hotspot; top, left for label).
// These are estimations and might need adjustment based on the final image rendering and aspect ratio.
const mapIslandsData = [
  { id: 'Isabela', name: 'Isabela', hotspot: { x: 12, y: 18, width: 28, height: 65 }, labelPos: { x: 28, y: 50 } },
  { id: 'Fernandina', name: 'Fernandina', hotspot: { x: 4, y: 33, width: 13, height: 22 }, labelPos: { x: 10, y: 45 } },
  { id: 'Santa Cruz', name: 'Santa Cruz', hotspot: { x: 43, y: 42, width: 22, height: 23 }, labelPos: { x: 54, y: 53 } },
  { id: 'San Cristobal', name: 'San Cristobal', hotspot: { x: 73, y: 50, width: 22, height: 18 }, labelPos: { x: 84, y: 59 } },
  { id: 'Española', name: 'Española', hotspot: { x: 73, y: 84, width: 18, height: 10 }, labelPos: { x: 82, y: 90 } },
  { id: 'Floreana', name: 'Floreana', hotspot: { x: 48, y: 76, width: 18, height: 13 }, labelPos: { x: 57, y: 83 } },
  { id: 'Santiago', name: 'Santiago', hotspot: { x: 38, y: 30, width: 20, height: 16 }, labelPos: { x: 48, y: 37 } },
  { id: 'Genovesa', name: 'Genovesa', hotspot: { x: 78, y: 12, width: 13, height: 13 }, labelPos: { x: 85, y: 18 } },
  { id: 'Pinta', name: 'Pinta', hotspot: { x: 43, y: 3, width: 10, height: 8 }, labelPos: { x: 48, y: 7 } },
  { id: 'Marchena', name: 'Marchena', hotspot: { x: 58, y: 9, width: 11, height: 9 }, labelPos: { x: 63, y: 14 } },
];

type GalapagosMapProps = {
  onIslandClick: (islandName: string) => void;
  selectedIsland: string | null;
};

const GalapagosMap: React.FC<GalapagosMapProps> = ({ onIslandClick, selectedIsland }) => {
  // IMPORTANT: Place your map image at public/images/galapagos_map_real.png
  const imageSrc = '/images/galapagos_map_real.png'; 

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square bg-secondary/30 rounded-lg shadow-md overflow-hidden">
      <Image
        src={imageSrc}
        alt="Mapa de las Islas Galápagos"
        layout="fill"
        objectFit="contain" 
        priority
        unoptimized={true} // Good for local images in public folder if optimization is not needed or causing issues
      />
      {mapIslandsData.map((island) => {
        const isSelected = selectedIsland === island.name;
        return (
          <React.Fragment key={island.id}>
            {/* Clickable Hotspot */}
            <button
              title={`Isla ${island.name}`}
              onClick={() => onIslandClick(island.name)}
              className={cn(
                "absolute border rounded-sm focus:outline-none transition-colors duration-150",
                "focus:ring-2 focus:ring-primary focus:ring-offset-1",
                isSelected ? "border-primary bg-primary/30" : "border-transparent hover:bg-primary/20 hover:border-primary/70",
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
            {/* Label */}
            <span
              className={cn(
                "absolute pointer-events-none text-xs md:text-sm font-medium p-0.5 rounded",
                isSelected ? "text-primary-foreground bg-primary font-bold shadow" : "text-foreground bg-background/60",
              )}
              style={{
                left: `${island.labelPos.x}%`,
                top: `${island.labelPos.y}%`,
                transform: 'translate(-50%, -50%)', // Center the label on its coordinates
              }}
            >
              {island.name}
            </span>
          </React.Fragment>
        );
      })}
      <p className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/70 p-1 rounded shadow">
        Haz clic en una isla para ver sus especies
      </p>
    </div>
  );
};

export default GalapagosMap;
