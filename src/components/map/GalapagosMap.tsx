
"use client"

import React from 'react';
import { cn } from "@/lib/utils";
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const islandPaths: { [key: string]: string } = {
  "Darwin": "M 100,5 L 102,5 L 102,7 L 100,7 Z",
  "Wolf": "M 110,12 L 112,12 L 112,14 L 110,14 Z",
  "Pinta": "M 175,25 L 180,22 L 183,28 L 178,31 Z",
  "Marchena": "M 205,35 L 212,34 L 214,40 L 207,41 Z",
  "Genovesa": "M 240,40 L 248,38 L 250,45 L 242,47 Z",
  "Santiago": "M 190,100 L 210,95 L 215,110 L 195,115 Z",
  "Fernandina": "M 90,110 L 105,105 L 110,125 L 95,130 Z",
  "Isabela": "M 120,60 L 160,80 L 150,150 L 110,140 L 120,90 Z",
  "Pinzón": "M 185,125 L 195,123 L 197,130 L 187,132 Z",
  "Santa Cruz": "M 200,120 L 225,118 L 230,135 L 205,138 Z",
  "North Seymour": "M 228,110 L 232,108 L 234,112 L 230,114 Z",
  "Santa Fé": "M 240,130 L 248,128 L 250,135 L 242,137 Z",
  "San Cristobal": "M 260,110 L 280,115 L 275,130 L 255,125 Z",
  "Floreana": "M 200,160 L 220,158 L 225,170 L 205,172 Z",
  "Española": "M 240,175 L 255,173 L 258,180 L 243,182 Z",
};

type GalapagosMapProps = {
  onIslandClick: (islandName: string | null) => void;
  selectedIsland: string | null;
};

const GalapagosMap: React.FC<GalapagosMapProps> = ({ onIslandClick, selectedIsland }) => {
    const { t } = useLanguage();

    const handleClick = (islandName: string) => {
        if (selectedIsland === islandName) {
            onIslandClick(null); // Deselect if clicked again
        } else {
            onIslandClick(islandName);
        }
    };

    return (
        <div className="w-full">
            <svg viewBox="0 0 300 200" className="w-full h-auto" aria-label={t.dashboard_map_title}>
                {GALAPAGOS_ISLANDS_NAMES.map(islandName => {
                    const pathData = islandPaths[islandName];
                    if (!pathData) return null; // FIX: Prevent rendering if path data is missing

                    return (
                        <path
                            key={islandName}
                            d={pathData}
                            className={cn(
                                "fill-muted-foreground/30 stroke-background stroke-[0.5] transition-all duration-200 cursor-pointer",
                                "hover:fill-primary/80 hover:stroke-primary-foreground",
                                selectedIsland === islandName && "fill-primary stroke-primary-foreground"
                            )}
                            onClick={() => handleClick(islandName)}
                            id={`map-island-${islandName.replace(/ /g, '-')}`}
                        >
                            <title>{islandName}</title>
                        </path>
                    )
                })}

                 {/* Labels */}
                {GALAPAGOS_ISLANDS_NAMES.map(islandName => {
                    const pathData = islandPaths[islandName];
                    if (!pathData) return null; // FIX: Prevent rendering if path data is missing

                    const center = getPathCenter(pathData);
                    const isSelected = selectedIsland === islandName;
                    
                    // Simple logic to adjust font size based on path 'size'
                    const pathArea = getPathArea(pathData);
                    let fontSize = 'text-[4px]';
                    if (pathArea > 1000) fontSize = 'text-[8px]';
                    else if (pathArea > 300) fontSize = 'text-[6px]';
                    if (islandName === "Isabela") fontSize = 'text-[10px]';

                    return (
                        <text
                            key={`label-${islandName}`}
                            x={center.x}
                            y={center.y}
                            className={cn(
                                "pointer-events-none fill-foreground font-semibold transition-opacity duration-200",
                                fontSize,
                                isSelected ? "fill-primary-foreground" : "fill-foreground",
                            )}
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {islandName}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};


// Helper functions to calculate properties of SVG paths
function getPathCenter(d: string): { x: number; y: number } {
    if (!d) return { x: 0, y: 0 }; // FIX: Added guard for undefined 'd'
    const points = d.replace(/[M,L,Z]/g, ' ').trim().split(/\s+/).map(Number);
    let xSum = 0, ySum = 0;
    for (let i = 0; i < points.length; i += 2) {
        xSum += points[i];
        ySum += points[i+1];
    }
    const numPoints = points.length / 2;
    return { x: xSum / numPoints, y: ySum / numPoints };
}

function getPathArea(d: string): number {
    if (!d) return 0; // FIX: Added guard for undefined 'd'
    const points = d.replace(/[M,L,Z]/g, ' ').trim().split(/\s+/).map(Number);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i+1]);
        maxY = Math.max(maxY, points[i+1]);
    }
    return (maxX - minX) * (maxY - minY);
}


export default GalapagosMap;
