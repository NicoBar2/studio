
"use client";

import React from 'react';

// Simplified representation of some major Galapagos Islands for the map
// Positions (x, y) and dimensions (width, height) are for a viewBox="0 0 350 300"
// Shapes can be 'rect', 'ellipse', or 'circle'
const mapIslandsData = [
  { id: 'Isabela', name: 'Isabela', x: 50, y: 80, width: 60, height: 150, shape: 'rect' },
  { id: 'Santa Cruz', name: 'Santa Cruz', x: 150, y: 150, width: 80, height: 70, shape: 'ellipse' },
  { id: 'San Cristobal', name: 'San Cristobal', x: 250, y: 180, width: 70, height: 60, shape: 'rect' },
  { id: 'Fernandina', name: 'Fernandina', x: 20, y: 130, width: 50, height: 50, shape: 'circle' },
  { id: 'Española', name: 'Española', x: 200, y: 250, width: 70, height: 35, shape: 'ellipse' },
  { id: 'Genovesa', name: 'Genovesa', x: 220, y: 50, width: 50, height: 40, shape: 'rect' },
  // Add more islands here if needed, adjusting viewBox accordingly
];

type GalapagosMapProps = {
  onIslandClick: (islandName: string) => void;
  selectedIsland: string | null;
};

const GalapagosMap: React.FC<GalapagosMapProps> = ({ onIslandClick, selectedIsland }) => {
  return (
    <svg 
      viewBox="0 0 350 300" 
      className="w-full max-w-xl mx-auto border border-border rounded-lg bg-card shadow-md" 
      aria-labelledby="mapTitle"
      role="graphics-document"
    >
      <title id="mapTitle">Mapa interactivo de las Islas Galápagos</title>
      
      {/* Optional: Background styling for the "ocean" */}
      <rect width="100%" height="100%" fill="hsl(var(--secondary))" />

      {mapIslandsData.map((island) => {
        const isSelected = selectedIsland === island.name;
        const islandBaseClasses = "cursor-pointer transition-all duration-200 ease-in-out";
        const islandStyle = {
          fill: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          stroke: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
          strokeWidth: isSelected ? 1.5 : 0.5,
          filter: isSelected ? 'drop-shadow(0 0 5px hsl(var(--primary)))' : 'none',
        };
        
        const textStyle = {
          textAnchor: "middle" as const,
          fontSize: "10px",
          fill: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
          pointerEvents: "none" as const,
          fontWeight: isSelected ? "bold" as const : "normal" as const,
        };

        let islandElement;
        let textX, textY;

        switch (island.shape) {
          case 'rect':
            islandElement = <rect x={island.x} y={island.y} width={island.width} height={island.height} rx="3" ry="3" style={islandStyle} className={islandBaseClasses} />;
            textX = island.x + island.width / 2;
            textY = island.y + island.height / 2 + 4; // Center text, +4 for baseline
            break;
          case 'ellipse':
            const rx = island.width / 2;
            const ry = island.height / 2;
            islandElement = <ellipse cx={island.x + rx} cy={island.y + ry} rx={rx} ry={ry} style={islandStyle} className={islandBaseClasses} />;
            textX = island.x + rx;
            textY = island.y + ry + 4; // Center text, +4 for baseline
            break;
          case 'circle':
            const r = island.width / 2; // Assuming width is diameter for circle
            islandElement = <circle cx={island.x + r} cy={island.y + r} r={r} style={islandStyle} className={islandBaseClasses} />;
            textX = island.x + r;
            textY = island.y + r + 4; // Center text, +4 for baseline
            break;
          default:
            return null;
        }

        return (
          <g key={island.id} onClick={() => onIslandClick(island.name)} role="button" aria-label={`Seleccionar isla ${island.name}`} tabIndex={0} 
             onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onIslandClick(island.name);}}
             className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
           >
            {islandElement}
            <text x={textX} y={textY} style={textStyle}>{island.name}</text>
          </g>
        );
      })}
      <text x="10" y="20" fontSize="12px" fontWeight="bold" fill="hsl(var(--foreground))">
        Haz clic en una isla para ver sus especies
      </text>
    </svg>
  );
};

export default GalapagosMap;

