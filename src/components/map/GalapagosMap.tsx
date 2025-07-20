
"use client"

import React from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';

type GalapagosMapProps = {
  onIslandClick: (islandName: string | null) => void;
  selectedIsland?: string | null;
};

export default function GalapagosMap({ onIslandClick, selectedIsland }: GalapagosMapProps) {
    const { t } = useLanguage();
    
    // Fallback component as it's being replaced by InteractiveMap
    return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
            <p>Cargando mapa interactivo...</p>
        </div>
    );
};
