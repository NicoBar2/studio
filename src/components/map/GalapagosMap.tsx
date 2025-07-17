
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

    return (
        <div className="w-full rounded-lg overflow-hidden border bg-background shadow-inner">
            {/*
              INSTRUCCIONES:
              Por favor, reemplaza el contenido de este <svg> con el código de tu archivo N.B.ai.
              Asegúrate de que cada isla tenga un 'id' único (por ejemplo, id="Isabela")
              y una función `onClick={() => handleClick("Isabela")}` para que la interactividad funcione.
            */}
            <svg viewBox="0 0 800 600" className="w-full h-auto" aria-label={t.mapAriaLabel}>
                <rect width="800" height="600" className="fill-blue-100 dark:fill-sky-900/40" />
                
                {/* PEGA AQUÍ EL CÓDIGO DE TU NUEVO SVG */}

                {/* Ejemplo de cómo debería ser una isla en tu SVG: */}
                {/* <path id="Isabela" d="..." onClick={() => handleClick("Isabela")} className="..." /> */}

                <text x="400" y="300" textAnchor="middle" className="fill-foreground">
                    Pega aquí tu código SVG para el mapa de Galápagos.
                </text>
            </svg>
        </div>
    );
};

export default GalapagosMap;
