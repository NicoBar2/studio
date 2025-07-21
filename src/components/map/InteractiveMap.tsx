
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


type InteractiveMapProps = {
  onIslandClick: (islandName: string | null) => void;
  selectedIsland?: string | null;
  dashboardMode?: boolean; 
};

const islandCoordinates: { name: string; position: [number, number] }[] = [
    { name: 'Isabela', position: [-0.67, -91.13] },
    { name: 'Santa Cruz', position: [-0.64, -90.35] },
    { name: 'Fernandina', position: [-0.36, -91.55] },
    { name: 'Santiago', position: [-0.26, -90.76] },
    { name: 'San Cristóbal', position: [-0.82, -89.45] },
    { name: 'Floreana', position: [-1.29, -90.43] },
    { name: 'Marchena', position: [0.33, -90.46] },
    { name: 'Española', position: [-1.37, -89.68] },
    { name: 'Pinta', position: [0.58, -90.75] },
    { name: 'Santa Fé', position: [-0.82, -90.06] },
    { name: 'Genovesa', position: [0.32, -89.96] },
    { name: 'Pinzón', position: [-0.60, -90.66] },
    { name: 'North Seymour', position: [-0.39, -90.28] },
    { name: 'Wolf', position: [1.39, -91.82] },
    { name: 'Darwin', position: [1.66, -91.99] },
];

const InteractiveMap = ({ onIslandClick, selectedIsland, dashboardMode = false }: InteractiveMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { t } = useLanguage();
  const router = useRouter();
  
  const handleIslandInteraction = (islandName: string) => {
    if (dashboardMode) {
      onIslandClick(islandName);
    } else {
      router.push(`/islas/${encodeURIComponent(islandName)}`);
    }
  };


  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) { 
      const map = L.map(mapContainerRef.current, {
          center: [-0.95, -90.96],
          zoom: 7,
          scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      islandCoordinates.forEach((island) => {
        const marker = L.marker(island.position).addTo(map);
        const popupContent = `
          <div class="text-center font-sans">
            <h3 class="font-bold">${island.name}</h3>
            ${!dashboardMode ? `<button class="leaflet-popup-button" data-island-name="${island.name}">${t.viewPublicPage}</button>` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);
      });
      
      map.on('popupopen', (e) => {
          const button = e.popup.getElement()?.querySelector('.leaflet-popup-button');
          if (button) {
            button.addEventListener('click', (ev) => {
                const islandName = (ev.target as HTMLElement).dataset.islandName;
                if(islandName) {
                    handleIslandInteraction(islandName);
                }
            });
          }
      });
      
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  useEffect(() => {
    if (mapRef.current) {
      if (selectedIsland) {
        const island = islandCoordinates.find(i => i.name === selectedIsland);
        if (island) {
          mapRef.current.flyTo(island.position, 8);
        }
      } else {
        mapRef.current.flyTo([-0.95, -90.96], 7);
      }
    }
  }, [selectedIsland]);

  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-lg"></div>
  );
};

export default InteractiveMap;
