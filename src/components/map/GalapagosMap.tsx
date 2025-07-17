
"use client"

import React from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';

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
    
    const islandData = [
      { id: 'Isabela', name: 'Isabela', x: 280, y: 770 },
      { id: 'Fernandina', name: 'Fernandina', x: 90, y: 790 },
      { id: 'Santiago', name: 'Santiago', x: 480, y: 780 },
      { id: 'Santa Cruz', name: 'Santa Cruz', x: 500, y: 920 },
      { id: 'San Cristóbal', name: 'San Cristóbal', x: 800, y: 1060 },
      { id: 'Floreana', name: 'Floreana', x: 520, y: 1150 },
      { id: 'Española', name: 'Española', x: 700, y: 1210 },
      { id: 'Marchena', name: 'Marchena', x: 580, y: 350 },
      { id: 'Pinta', name: 'Pinta', x: 480, y: 260 },
      { id: 'Genovesa', name: 'Genovesa', x: 780, y: 300 },
      { id: 'Pinzón', name: 'Pinzón', x: 420, y: 860 },
      { id: 'North Seymour', name: 'North Seymour', x: 500, y: 840 },
      { id: 'Santa Fé', name: 'Santa Fé', x: 600, y: 960 },
      { id: 'Darwin', name: 'Darwin', x: 100, y: 100 },
      { id: 'Wolf', name: 'Wolf', x: 200, y: 150 },
    ];
    
    const getPathCenter = (d: string | undefined): { x: number; y: number } => {
        if (!d) return { x: 0, y: 0 }; // Return a default if path data is missing
        const points = d.replace(/[M,L,Z,m,l,z,c,C,s,S,q,Q,t,T,a,A,h,H,v,V]/g, ' ').trim().split(/\s+/).map(Number);
        let xSum = 0, ySum = 0;
        let count = 0;
        for (let i = 0; i < points.length; i += 2) {
            if(!isNaN(points[i]) && !isNaN(points[i+1])) {
              xSum += points[i];
              ySum += points[i+1];
              count++;
            }
        }
        return count > 0 ? { x: xSum / count, y: ySum / count } : { x: 0, y: 0 };
    };

    return (
        <div className="w-full rounded-lg overflow-hidden border bg-background shadow-inner">
           <svg xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" width="1612.0133" height="1578.6801" viewBox="0 0 1612.0133 1578.6801" className="w-full h-auto" aria-label={t.mapAriaLabel}>
              <g id="layer-MC0">
                <path id="path1" d="M 0,0 H 1209.01 V 1184.012 H 0 Z" className="fill-blue-100 dark:fill-sky-900/40" transform="matrix(1.3333333,0,0,-1.3333333,0,1578.68)"/>
              </g>
              <g id="Islands" className="[&>path]:fill-green-200/50 dark:[&>path]:fill-green-900/50 [&>path]:stroke-green-600/50 dark:[&>path]:stroke-green-300/50 stroke-1 transition-colors duration-200">
                
                <path id="Pinta" onClick={() => handleClick("Pinta")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Pinta" })} d="m 700.8,1127.85 c 4.03,-1.19 8.28,-0.68 7.98,-6.21 -0.05,-0.94 0.37,-1.39 1.2,-1.54 0.55,-0.1 1.51,0.08 1.63,-0.18 1.84,-3.88 5.78,-4.69 8.8,-6.83 4.2,-2.97 0.51,-13.4 -5.31,-14.43 -7.04,-1.24 -6.97,-6.68 -8.63,-11.08 -2.54,-6.74 -2.43,-14.31 -6.11,-20.74 -0.68,-1.17 -0.17,-2.13 -0.02,-3.23 0.8,-5.75 -1.19,-8.52 -6.79,-8.3 -5.43,0.21 -7.69,-2.88 -8.73,-7.24 -0.84,-3.52 -2.65,-4.78 -6.16,-5.39 -6.75,-1.17 -13.33,-3.26 -20.33,-1.37 -1.73,0.47 -3.88,-0.34 -5.12,-1.9 -4.5,-5.74 -10.7,-8.53 -17.47,-10.46 -1.55,-0.45 -3.24,-0.92 -3.84,-2.93 -0.48,-1.6 -2.01,-2.06 -3.13,-0.98 -3.25,3.13 -6.45,1.19 -9.45,-0.02 -5.79,-2.32 -11.43,-5.03 -17.14,-7.57 -0.34,-0.15 -0.94,-0.16 -1.03,-0.39 -5.1,-12.21 -13.48,0.92 -19.68,-2.56 -7.77,6.88 -18.09,5.21 -27.13,7.72 -7.56,2.1 -15.83,1.72 -23.63,-0.54 -6.2,-1.8 -22.77,4.94 -25.88,10.49 -1.13,2.02 -0.28,3.54 0.09,5.36 1.03,4.98 -1.02,7.2 -5.91,8.65 -8.71,2.6 -18.99,13.44 -12.57,24.87 2.67,4.76 6.1,8.49 9.64,12.39 4.49,4.96 9.52,9.34 13.76,14.68 2.83,3.56 6.83,8.55 12.97,9.69 6.09,1.13 8.64,7.39 12.79,11.26 2.93,2.74 6.65,4.76 8.33,9.56 1.62,4.62 8.15,3.01 12.42,3.16 5.66,0.2 10.31,0.5 15.14,4.69 5.55,4.83 12.23,1.63 18.06,-1.53 5.45,-2.96 11.53,-0.51 13,5.31 0.13,0.54 0.39,1.48 0.66,1.51 5,0.45 7.87,6.34 12.05,6.22 6.3,-0.18 6.2,5.07 8.98,7.78 0.48,0.47 0.19,2.83 -0.35,3.1 -4.82,2.4 -6.11,8.51 -11.19,10.48 -3.29,1.27 -5.6,3.88 -8.15,6.03 -8.65,7.25 -17.37,14.49 -25.31,22.48 -4.42,4.45 -3.47,11.12 -3.12,17.03 0.6,10.21 0.7,10.11 -9.22,12.07 -2.93,0.58 -4.54,3.14 -5.99,5.55 -1.39,2.29 -2.85,4.38 -5.7,5.07 -12.63,3.03 -19.63,11.8 -23.73,23.47 -0.37,1.06 -0.3,2.46 -1.41,2.97 -8.42,3.85 -7.85,11.87 -6.31,18.2 1.2,4.91 0.77,8.41 -1.76,11.9 -5.28,7.24 -2.22,15.5 -3.06,23.23 -0.57,5.16 -1.28,10.38 -1.25,15.71 0.05,7.83 -11.04,14.21 -18.48,11.24 -8.02,-3.2 -15.95,-6.64 -23.78,-10.27 -6.08,-2.81 -8.31,-2.27 -9.83,4.03 -0.79,3.26 -2.59,5.27 -4.98,7.21 -3.9,3.15 -3.72,6.41 0.69,8.81 3.97,2.17 8.09,4.16 12.35,5.65 5.66,1.99 10.1,5.89 15.09,8.9 3.93,2.37 5.77,6.3 4.91,11.23 -0.77,4.42 1.12,5.95 5.45,4.48 3.23,-1.09 6.35,-1.15 8.83,1.75 1,1.17 2.37,0.97 3.69,1 8.42,0.2 14.84,3.8 19.03,11.19 0.68,1.18 1.69,2.66 2.91,2.46 6.19,-1.01 13.12,1.88 18.51,-3.3 -2.39,-2.3 -3.58,-4.63 -2.58,-8.51 1.71,-6.6 2.02,-11.88 6.41,-16.41 1.16,-1.19 3.41,-1.95 2.98,-3.73 -1.68,-6.95 4.41,-9.88 7.14,-14.53 0.34,-0.57 1.24,-1.29 1.75,-1.2 6.55,1.1 8.56,-5.95 13.6,-7.53 0.58,-0.18 1.2,-1.06 1.34,-1.72 1.26,-5.79 2.24,-11.64 3.63,-17.41 2.23,-9.23 -2,-18.12 -1.17,-27.25 1.34,-14.75 8.24,-26.07 21.06,-33.51 4.2,-2.43 4.98,-7.22 6.52,-10.62 2.49,-5.49 7.3,-6.87 11,-10.11 4.41,-3.86 10.41,-4.61 15.15,-8.28 6.61,-5.11 10.11,-12.62 16.08,-18.08 0.81,-0.73 1.71,-2.39 2.22,-2.26 7.08,1.85 5.71,-3.66 5.07,-6.65 -0.74,-3.5 2.86,-4.62 2.66,-7.57 -0.28,-4.11 1.01,-8.63 -0.29,-12.29 -2.42,-6.83 1.27,-14.78 -4.27,-20.82 -0.43,-0.47 -0.56,-0.89 -0.01,-1.31 4.94,-3.76 -3.72,-11.52 4.66,-14.79 3.38,-1.32 5.38,-0.5 7.7,0.96 6.68,4.21 9.61,3.08 11.58,-4.82 0.36,-1.46 0.14,-3.6 1.84,-3.77 5.05,-0.49 6.41,-3.45 6.43,-7.93 C -3.05,8.51 -2.15,7.14 -1.3,6.76 2.53,5.05 2.42,2.69 0,0" transform="matrix(1.3333333,0,0,-1.3333333,425.602,338.122)"/>
                <path id="Genovesa" onClick={() => handleClick("Genovesa")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Genovesa" })} d="m 1035.55,1171.66 c 2.45,0.09 4.82,0.27 6.71,-1.94 1.96,-2.3 1.89,-5.25 1.23,-7.41 -0.56,-1.83 -3.28,-0.15 -5.07,0.02 -2.1,0.21 -4.3,0.36 -5.9,1.61 -1.42,1.12 -5.1,-0.26 -4.29,2.94 0.61,2.4 1.65,5.65 5.64,4.55 -1.17,-0.36 -0.56,-0.08 0,0" transform="matrix(1.3333333,0,0,-1.3333333, -331.750, 866.403)"/>
                <path id="Santiago" onClick={() => handleClick("Santiago")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Santiago" })} d="m 373.43,957.98 c 11.61,-2.38 21.52,4.65 32.51,5.71 0.35,0.03 0.77,0.23 1.01,0.48 7.31,7.8 14.6,4.97 22.09,0.18 10.41,-6.66 13.62,-17.06 15.61,-28.36 1.14,-6.5 -0.74,-12.04 -3.81,-17.5 -0.42,-0.75 -0.82,-2.15 -0.44,-2.61 1.92,-2.4 3.35,-5.04 1.15,-7.63 -3.83,-4.51 -7.67,-9.45 -13.96,-10.51 -6.66,-1.12 -13.4,-1.67 -19.95,-3.47 -3.09,-0.85 -5.88,0.52 -8.62,1.87 -7.02,3.47 -14.78,3.83 -22.3,5.11 -2.55,0.43 -3.67,1.31 -4.77,3.77 -2.22,4.93 -4.8,9.77 -7.3,14.55 -3.47,6.62 -5.54,13.01 -4.9,20.5 0.29,3.44 -0.17,6.99 -2.17,10.33 -2.01,3.34 -1.1,5.84 3.51,6.64 C -8.22,-0.21 -4.13,-0.05 0,0" transform="matrix(1.3333333,0,0,-1.3333333, -51.832, 319.04)"/>
                <path id="Isabela" onClick={() => handleClick("Isabela")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Isabela" })} d="m 437.74,835.09 c 9.85,0.65 17.5,-2.5 22.75,-11.4 1.93,-3.26 -2.62,-3.08 -1.57,-5.59 0.49,-1.18 -1.57,-0.63 -2.6,-0.65 -10.82,-0.3 -19.99,4.54 -29.26,9.18 -2.7,1.36 -3.03,3.43 -0.69,4.5 C 430.05,832.81 433.62,834.45 437.74,835.09" transform="matrix(1.3333333,0,0,-1.3333333, -332.939, 290.988)"/>
                <path id="Santa Cruz" onClick={() => handleClick("Santa Cruz")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Santa Cruz" })} d="m 726.66,894.17 c 5.04,-1.38 11.35,-0.34 15.54,-5.79 0.96,-1.25 3.35,-1.7 5.16,-1.93 2.83,-0.35 4.24,-1.2 6.12,-3.95 1.94,-2.83 7.18,-4.49 11.06,-4.67 7.55,-0.35 12.93,-4.78 19.07,-7.92 7.07,-3.61 9.35,-9.69 10.15,-17.1 0.28,-2.65 2.08,-5.26 5.25,-6.64 3.58,-1.56 5.25,-4.01 0.5,-6.67 -2.22,-1.24 -3.53,-3.5 -4.58,-5.66 -5.63,-11.61 -7.18,-12.19 -18.88,-7.29 -4.24,1.78 -8.89,1.69 -13,-5.07 -2.22,-1.82 -7.75,1 -11.71,1.74 -7.11,1.31 -12.78,0.6 -18.39,-4.29 -2.93,-2.54 -7.04,-4.13 -11.49,-2.52 -3.13,1.13 -8.38,-2.97 -8.47,-6.31 -0.17,-6.41 -3.59,-10.89 -9.74,-12.97 -0.96,-0.33 -3.01,-0.61 -2.5,1.62 0.98,1.91 0.55,4.25 2.62,5.91 6.07,4.86 10.63,10.45 8.6,19.22 C 710.8,887.73 719.65,894.6 726.66,894.17" transform="matrix(1.3333333,0,0,-1.3333333, -332.657, 303.882)"/>
                <path id="San Cristóbal" onClick={() => handleClick("San Cristóbal")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "San Cristóbal" })} d="m 857.05,671.85 c 5.15,-2.76 10.12,-4.79 14.26,-7.9 2.3,-1.73 4.49,-3.24 7.17,-4.15 4,-1.36 5.14,-4.01 3.66,-7.94 -4.38,-11.64 -15.13,-13.3 -25.17,-16.04 -0.63,-0.17 -1.81,0.07 -2.1,0.52 -3.12,4.91 -8.58,5.66 -13.22,8.06 -6.76,3.48 -8.07,13.85 -3.36,19.86 0.35,0.44 0.75,1.1 1.2,1.16 C 845.8,1.24 851.29,-2.14 857.05,0" transform="matrix(1.3333333,0,0,-1.3333333, -156.061, 888.665)"/>
                <path id="Floreana" onClick={() => handleClick("Floreana")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Floreana" })} d="m 742.81,583.52 c -0.21,-1 -0.68,-3.38 -1.23,-5.75 -0.12,-0.53 -0.49,-1.4 -0.8,-1.43 -3.94,-0.33 -7.47,1 -10.95,2.7 -2.01,0.98 -3.6,1.79 -2.8,4.55 1.6,5.57 0.55,11.06 -1.09,16.45 -0.62,2.04 -1.48,4.25 0.55,5.69 2.37,1.68 4.09,-0.09 5.81,-1.76 C 737.78,20.4 743.07,15.15 742.81,5.85" transform="matrix(1.3333333,0,0,-1.3333333, -152.837, 1020.91)"/>
                <path id="Marchena" onClick={() => handleClick("Marchena")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Marchena" })} d="m 760.2,1015.3 c -3.14,1.28 -6.12,3.1 -5.46,6.03 0.67,2.98 2.45,6.92 6.38,6.7 3.16,-0.17 3.3,-4 3.12,-6.29 -0.21,-2.57 -1.82,-5.02 -4.04,-6.44" transform="matrix(1.3333333,0,0,-1.3333333, -200.226, 461.326)"/>
                <path id="Española" onClick={() => handleClick("Española")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Española" })} d="m 372.36,716.75 c -0.6,-2.71 -1.53,-4.86 -4.66,-4.82 -2.02,0.03 -4.06,0.42 -3.68,2.98 0.44,2.94 2.4,5.36 5.29,5.71 C 370.15,10.84 371.77,8.4 372.36,5.75" transform="matrix(1.3333333,0,0,-1.3333333, -93.111, 482.029)"/>
                <path id="Fernandina" onClick={() => handleClick("Fernandina")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Fernandina" })} d="m 322.13,327.18 c -0.2,-2.34 -1.39,-3.82 -3.57,-3.65 -2.49,0.2 -5.11,1.22 -5.31,4.05 -0.15,2.04 1.25,4.21 3.77,3.94 C 299.54,7.25 321.54,5.8 322.13,3.45" transform="matrix(1.3333333,0,0,-1.3333333, -37.892, 1141.25)"/>
                <path id="North Seymour" onClick={() => handleClick("North Seymour")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "North Seymour" })} d="M 308.68,332.7 C 310.01,332.59 311.62,331.91 311.85,329.99 312.04,328.28 310.78,327.24 309.1,327.27 307.39,327.29 306.47,328.49 306.27,330.11 306.09,331.51 305.82,332.74 308.68,332.7" transform="matrix(1.3333333,0,0,-1.3333333, 191.09, 1133.58)"/>
                <path id="Santa Fé" onClick={() => handleClick("Santa Fé")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Santa Fé" })} d="m 693.33,1266.83 c -0.01,-1.93 -0.83,-3.19 -1.93,-2.21 -1.91,1.68 -3.41,1.74 -5.77,0.94 -1.58,-0.54 -1.81,1.48 -1.36,2.81 0.75,2.23 2.61,3.45 4.77,3.1 C 691.69,1271.03 692.94,1268.86 693.33,1266.83" transform="matrix(1.3333333,0,0,-1.3333333, -173.341, -127.359)"/>
                <path id="Wolf" onClick={() => handleClick("Wolf")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Wolf" })} d="M 935.21,1405.27 C 933.61,1405.37 932.72,1406.49 932.72,1407.8 932.71,1409.63 934.39,1410.1 935.86,1410.28 937.24,1410.45 937.79,1409.48 937.78,1408.2 937.78,1406.46 937,1405.37 935.21,1405.27" transform="matrix(1.3333333,0,0,-1.3333333, -735.207, -275.214)"/>
                <path id="Pinzón" onClick={() => handleClick("Pinzón")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Pinzón" })} d="m 372.4,957.98 c -0.09,-3.91 -1.95,-5.84 -4.38,-7.38 -2.46,-1.56 -4.35,-0.48 -6.6,1.15 -2.82,2.06 -5.57,3.79 -5.73,7.68 -0.14,3.3 1.02,5.78 4.11,7.38 3.14,1.62 5.82,0.63 7.54,-1.76 C 369.15,969.59 373.1,961.41 372.4,957.98" transform="matrix(1.3333333,0,0,-1.3333333, 53.689, 235.84)"/>
                <path id="Darwin" onClick={() => handleClick("Darwin")} className={cn("cursor-pointer hover:fill-primary/50", { "fill-accent dark:fill-accent/70": selectedIsland === "Darwin" })} d="M 236.84,207.51 C 236.75,210.69 238.19,212.76 241.83,212.55 244.42,212.4 246.34,210.88 246.08,208.27 245.78,205.15 244.14,202.42 240.58,202.22 237.19,202.04 236.75,204.59 236.84,207.51" transform="matrix(1.3333333,0,0,-1.3333333, -36.839, 1271.09)"/>

              </g>

               {islandData.filter(i => i.x && i.y).map(island => (
                  <text 
                      key={island.id}
                      x={island.x}
                      y={island.y}
                      className="fill-foreground/80 dark:fill-foreground/70 font-sans text-sm pointer-events-none"
                      textAnchor="middle"
                      style={{ fontSize: Math.max(10, Math.min(24, 1200 / island.name.length / 5)) }}
                  >
                      {island.name}
                  </text>
              ))}

            </svg>
        </div>
    );
};

export default GalapagosMap;
