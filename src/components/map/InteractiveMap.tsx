
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


type InteractiveMapProps = {
  onIslandClick: (islandName: string) => void;
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

const InteractiveMap = ({ onIslandClick }: InteractiveMapProps) => {
  const position: [number, number] = [-0.95, -90.96]; // Center of Galapagos
  const { t, language } = useLanguage();
  const router = useRouter();

  const handlePopupClick = (islandName: string) => {
    router.push(`/islas/${encodeURIComponent(islandName)}`);
  };

  return (
    <MapContainer center={position} zoom={7} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {islandCoordinates.map((island) => (
        <Marker key={island.name} position={island.position}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">{island.name}</h3>
              <Button
                size="sm"
                variant="link"
                className="p-0 h-auto"
                onClick={() => handlePopupClick(island.name)}
              >
                {language === 'es' ? 'Ver Especies' : 'View Species'}
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default InteractiveMap;
