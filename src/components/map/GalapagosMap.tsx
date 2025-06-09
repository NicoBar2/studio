
"use client";

import React from 'react';

// Representación de las Islas Galápagos con formas SVG más orgánicas.
// Coordenadas y dimensiones para un viewBox="0 0 350 300"
// cx, cy son los centroides aproximados para el texto.
const mapIslandsData = [
  { id: 'Isabela', name: 'Isabela', shape: 'path', 
    d: 'M60,80 C35,110 30,180 55,230 L75,235 C90,190 100,120 80,80 Q70,75 60,80 Z', 
    cx: 68, cy: 155 },
  { id: 'Santa Cruz', name: 'Santa Cruz', shape: 'ellipse', 
    cx: 165, cy: 165, rx: 42, ry: 38 },
  { id: 'San Cristobal', name: 'San Cristobal', shape: 'path', 
    d: 'M250,180 L315,185 L305,230 Q280,245 255,235 L250,200 Z', 
    cx: 285, cy: 210 },
  { id: 'Fernandina', name: 'Fernandina', shape: 'circle', 
    cx: 35, cy: 145, r: 26 },
  { id: 'Española', name: 'Española', shape: 'ellipse', 
    cx: 230, cy: 260, rx: 38, ry: 20 },
  { id: 'Genovesa', name: 'Genovesa', shape: 'path', 
    d: 'M220,50 Q245,40 270,55 C275,75 255,95 235,90 Q210,80 220,50 Z', 
    cx: 245, cy: 70 },
  // Ejemplo de una isla adicional más pequeña si se quisiera agregar
  // { id: 'Floreana', name: 'Floreana', shape: 'ellipse', cx: 140, cy: 230, rx: 25, ry: 20},
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
      
      <rect width="100%" height="100%" fill="hsl(var(--secondary))" />

      {mapIslandsData.map((island) => {
        const isSelected = selectedIsland === island.name;
        const islandBaseClasses = "cursor-pointer transition-all duration-200 ease-in-out";
        const islandStyle = {
          fill: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          stroke: isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
          strokeWidth: isSelected ? 1.5 : 0.7,
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
          case 'path':
            islandElement = <path d={island.d} style={islandStyle} className={islandBaseClasses} />;
            textX = island.cx;
            textY = island.cy + 3; // Ajustar línea base del texto
            break;
          case 'ellipse':
            islandElement = <ellipse cx={island.cx} cy={island.cy} rx={island.rx} ry={island.ry} style={islandStyle} className={islandBaseClasses} />;
            textX = island.cx;
            textY = island.cy + 3; // Ajustar línea base del texto
            break;
          case 'circle':
            islandElement = <circle cx={island.cx} cy={island.cy} r={island.r} style={islandStyle} className={islandBaseClasses} />;
            textX = island.cx;
            textY = island.cy + 3; // Ajustar línea base del texto
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
