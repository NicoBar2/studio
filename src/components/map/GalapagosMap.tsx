
"use client"

import React from 'react';
import { cn } from "@/lib/utils";
import { GALAPAGOS_ISLANDS_NAMES } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const islandPaths: { [key: string]: string } = {
  "Isabela": "M 163.4,83.9 C 161.7,82.2 159.2,80.7 156.4,79.5 C 152.2,77.7 149.3,75.1 146,71.1 C 143.9,68.5 142.3,65.6 141.2,62.5 C 139.7,58.3 139.4,53.8 140.4,49.5 C 141.6,44.2 144.1,39.5 147.8,35.8 C 149.9,33.6 152.4,31.9 155.2,30.8 C 157.9,29.8 160.8,29.4 163.6,29.7 C 166.4,30 169,31 171.3,32.6 C 175.7,35.8 178.6,40.6 179.9,46 C 180.9,50.1 180.4,54.4 178.6,58.3 C 176.7,62.3 173.6,65.7 169.8,68.2 L 163,80.8 L 160.2,95.6 C 159.4,103.4 159.4,111.3 160.2,119.1 L 157.7,126 C 155.4,132.3 153.2,138.6 151.2,144.9 C 150.3,147.6 149.8,150.4 149.8,153.2 C 149.8,157.4 151,161.5 153.4,164.9 C 155,167.3 157.2,169.2 159.8,170.5 C 162.8,171.9 166.1,172.5 169.3,172.2 C 174.1,171.7 178.6,169.2 181.8,165.4 C 183.1,164 184.1,162.4 184.9,160.7 L 182,146.9 L 176.3,130.6 L 173.4,115.9 L 169,102.2 L 163.4,83.9 Z",
  "Santa Cruz": "M 221.8,129.5 C 218.4,127.3 215.3,125.6 212,124.6 C 207.2,123.1 202.8,123.4 198.7,125.4 C 195.4,127.1 192.7,129.7 190.8,132.9 C 189.4,135.3 188.8,138.1 189.1,140.8 C 189.5,144.4 191.4,147.6 194.4,149.8 C 197,151.7 200.2,152.7 203.4,152.7 C 210.1,152.7 216.1,149.5 220.1,144.4 C 223.1,140.6 224.8,136.1 224.8,131.4 C 224.7,130.7 223.4,129.9 221.8,129.5 Z",
  "Fernandina": "M 115.4,103.9 C 111.4,103.1 107.2,104 103.7,106.4 C 100.8,108.4 98.5,111.2 97.2,114.5 C 95.8,118 95.6,121.8 96.6,125.4 C 97.9,129.8 100.9,133.6 105,136.1 C 108.5,138.2 112.6,138.8 116.6,137.9 C 122.9,136.4 127.9,131.8 130.3,126.1 C 132.1,121.7 132.3,116.9 130.8,112.4 C 129.6,108.6 126.9,105.4 123.3,103.5 C 120.8,102.3 118.1,101.9 115.4,102.9 L 115.4,103.9 Z",
  "Santiago": "M 207,85.4 C 201.7,82.2 195.3,81.4 189.4,83.4 C 184.2,85.2 179.9,89 177.6,94.2 C 175.7,98.6 175.7,103.6 177.6,108.1 C 179.3,112.1 182.6,115.3 186.8,117.2 C 191.5,119.3 196.7,119.8 201.6,118.4 C 209.7,116.1 216,109.6 217.8,101.6 C 219.2,95.5 217.8,89.1 214.2,84.4 C 211.7,81.2 209.4,83.4 207,85.4 Z",
  "San Cristobal": "M 292,126.4 C 288.6,123.2 284.4,120.9 279.8,119.8 C 272.1,118 264.5,121.1 259.2,127.2 C 255.8,131.2 254.3,136.3 255.2,141.3 C 256.3,147.2 260.1,152.2 265.5,155 C 271.7,158.2 278.8,158.5 285.2,155.8 C 290.4,153.6 294.6,149.3 296.8,144 C 298.9,138.8 298.6,132.9 295.6,128.1 C 294.5,126.5 293.3,126.4 292,126.4 Z",
  "Floreana": "M 207.6,161.4 C 203.4,159.2 198.7,159.2 194.5,161.4 C 190.2,163.7 187,167.9 185.8,172.6 C 184.9,176.4 185.7,180.4 188.1,183.6 C 190.3,186.6 193.7,188.5 197.6,189 C 205.1,189.9 212.3,185.8 216.5,179.3 C 219.8,174.1 220.6,167.8 218.4,162.4 C 216.9,158.8 212.6,160.4 207.6,161.4 Z",
  "Marchena": "M 221.8,40.5 C 218.5,38.6 214.7,37.8 210.9,38.3 C 205.7,39 201.3,42.5 199.3,47.4 C 197.8,51.2 198.3,55.5 200.7,59 C 203.3,62.8 207.5,65.2 212.2,65.7 C 218.8,66.4 225.1,62.9 228.6,57.4 C 231.2,53.2 231.5,48.2 229.4,43.8 C 227.9,40.7 225.1,39.5 221.8,40.5 Z",
  "Española": "M 264.4,175.8 C 260.6,173.8 256.4,173.2 252.3,174.1 C 245.2,175.6 239.6,180.7 237.7,187.3 C 236.4,191.9 237.4,196.8 240.4,200.6 C 243,203.8 247,205.8 251.4,206.2 C 258.9,206.9 266.1,202.6 270,196.1 C 273.7,189.9 273.6,182.5 269.8,176.9 C 268.4,175.7 266.4,175.8 264.4,175.8 Z",
  "Pinta": "M 190.2,28.8 C 187.3,26.5 183.8,25.1 180.1,25 C 174,24.8 168.6,28.8 166.4,34.4 C 164.7,39 165.6,44.2 168.8,48.2 C 171.7,51.9 176.2,54.1 181,54.2 C 188,54.4 194.5,49.5 197.2,42.9 C 199.1,38.2 198.6,32.9 195.8,28.8 C 194.1,27.8 192.2,28.8 190.2,28.8 Z",
  "Genovesa": "M 256.4,46.7 C 253.9,44 250.7,42.1 247.1,41.3 C 241.6,40.1 236.1,41.9 232.4,46.1 C 229.3,49.6 228.1,54.3 229.2,58.8 C 230.5,64.2 234.5,68.6 240,70.5 C 245.9,72.5 252.4,71.4 257,67.3 C 261.2,63.5 262.8,57.7 261.5,52.3 C 260.6,49.3 258.4,46.7 256.4,46.7 Z",
  "Santa Fé": "M 252.5,133.3 C 250.5,131.2 248,129.7 245.2,129 C 240.9,127.9 236.5,129.1 233.1,132.3 C 230.1,135.1 228.5,139 228.9,142.9 C 229.4,147.5 232.4,151.4 236.8,153.5 C 241.1,155.5 245.9,155.5 250.2,153.5 C 254.9,151.3 258.2,146.9 259.1,141.9 C 259.7,138.4 258.3,135.1 255.8,132.8 C 254.5,132.2 253.5,133.3 252.5,133.3 Z",
  "Pinzón": "M 197.6,126.7 C 195.4,124.7 192.7,123.4 189.9,123.1 C 186.2,122.7 182.6,124.1 180,126.9 C 177,130.1 175.7,134.4 176.6,138.6 C 177.6,143.2 181,146.9 185.6,148.5 C 190.5,150.2 195.8,149.6 200,146.9 C 204.6,143.9 207.1,139 207.1,133.8 C 207.1,129.9 205.5,126.3 202.8,123.8 C 201.6,125.7 199.6,126.7 197.6,126.7 Z",
  "Wolf": "M 134,18.8 C 132.2,16.7 129.8,15.1 127.1,14.3 C 123.1,13.1 118.8,13.7 115.3,16.1 C 111.9,18.5 109.8,22.3 109.5,26.5 C 109.2,30.8 110.8,35.1 113.9,38.1 C 116.8,40.9 120.9,42.2 125,41.9 C 130.7,41.4 135.6,37.5 137.8,32.3 C 139.6,28.2 139,23.5 136.5,19.8 C 135.8,18.8 134,18.8 134,18.8 Z",
  "Darwin": "M 120.5,5.1 C 118.7,3 116.3,1.4 113.6,0.6 C 109.6,-0.6 105.3,0 101.8,2.4 C 98.4,4.8 96.3,8.6 96,12.8 C 95.7,17.1 97.3,21.4 100.4,24.4 C 103.3,27.2 107.4,28.5 111.5,28.2 C 117.2,27.7 122.1,23.8 124.3,18.6 C 126.1,14.5 125.5,9.8 123,6.1 C 122.3,5.1 121.5,5.1 120.5,5.1 Z",
  "North Seymour": "M 235.6,110.5 C 234.3,108.9 232.7,107.6 230.9,106.9 C 228.1,105.7 225,105.7 222.1,106.9 C 218.4,108.4 215.6,111.7 214.7,115.6 C 214.1,118.3 214.7,121.1 216.4,123.4 C 218.2,125.8 220.9,127.4 223.9,127.8 C 228.3,128.5 232.6,126.6 235.4,123.1 C 237.9,119.9 238.7,115.8 237.7,112.1 C 237.1,110.5 236.6,110.5 235.6,110.5 Z",
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
        <div className="w-full rounded-lg overflow-hidden border bg-background shadow-inner">
            <svg viewBox="0 0 300 220" className="w-full h-auto" aria-label={t.dashboard_map_title}>
                <defs>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                        <feOffset dx="1" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge> 
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/> 
                        </feMerge>
                    </filter>
                </defs>

                <rect width="300" height="220" className="fill-blue-100 dark:fill-sky-900/40" />
                
                <g style={{ filter: 'url(#dropShadow)' }}>
                    {GALAPAGOS_ISLANDS_NAMES.map(islandName => {
                        const pathData = islandPaths[islandName];
                        if (!pathData) return null;

                        return (
                            <path
                                key={islandName}
                                d={pathData}
                                className={cn(
                                    "fill-emerald-50/70 dark:fill-emerald-900/50 stroke-emerald-800/50 dark:stroke-emerald-300/40 stroke-[0.5] transition-all duration-200 cursor-pointer",
                                    "hover:fill-accent/70 hover:stroke-accent-foreground",
                                    selectedIsland === islandName && "fill-accent stroke-accent-foreground"
                                )}
                                onClick={() => handleClick(islandName)}
                                id={`map-island-${islandName.replace(/ /g, '-')}`}
                            >
                                <title>{islandName}</title>
                            </path>
                        )
                    })}
                </g>

                 {/* Labels */}
                {GALAPAGOS_ISLANDS_NAMES.map(islandName => {
                    const pathData = islandPaths[islandName];
                    if (!pathData) return null;

                    const center = getPathCenter(pathData);
                    const isSelected = selectedIsland === islandName;
                    
                    const pathArea = getPathArea(pathData);
                    let fontSize = '4px';
                    if (pathArea > 2000) fontSize = '9px'; // Isabela
                    else if (pathArea > 800) fontSize = '7px'; // Santa Cruz, San Cristobal
                    else if (pathArea > 300) fontSize = '5px'; // Santiago, etc.
                    
                    return (
                        <text
                            key={`label-${islandName}`}
                            x={center.x}
                            y={center.y}
                            fontSize={fontSize}
                            className={cn(
                                "pointer-events-none font-headline font-semibold transition-colors duration-200",
                                isSelected ? "fill-accent-foreground" : "fill-foreground/80 dark:fill-foreground/70",
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
    if (!d) return { x: 0, y: 0 };
    const points = d.replace(/[M,L,Z,C,A,Q,T,H,V,S]/gi, ' ').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if(points.length === 0) return { x: 0, y: 0 };
    let xSum = 0, ySum = 0;
    for (let i = 0; i < points.length; i += 2) {
        xSum += points[i];
        ySum += points[i+1];
    }
    const numPoints = points.length / 2;
    return { x: xSum / numPoints, y: ySum / numPoints };
}

function getPathArea(d: string): number {
    if (!d) return 0;
    const points = d.replace(/[M,L,Z,C,A,Q,T,H,V,S]/gi, ' ').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if(points.length < 2) return 0;
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

    