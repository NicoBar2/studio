"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Import the plugin
import { useLanguage } from '@/contexts/LanguageContext';

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// We need the coordinates to place the heat points
const islandCoordinates: { [key: string]: [number, number] } = {
    'Isabela': [-0.67, -91.13],
    'Santa Cruz': [-0.64, -90.35],
    'Fernandina': [-0.36, -91.55],
    'Santiago': [-0.26, -90.76],
    'San Cristóbal': [-0.82, -89.45],
    'Floreana': [-1.29, -90.43],
    'Marchena': [0.33, -90.46],
    'Española': [-1.37, -89.68],
    'Pinta': [0.58, -90.75],
    'Santa Fé': [-0.82, -90.06],
    'Genovesa': [0.32, -89.96],
    'Pinzón': [-0.60, -90.66],
    'North Seymour': [-0.39, -90.28],
    'Wolf': [1.39, -91.82],
    'Darwin': [1.66, -91.99],
};


type HeatmapComponentProps = {
  data: Record<string, number>; // { "IslandName": count }
};

const HeatmapComponent = ({ data }: HeatmapComponentProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const heatLayerRef = useRef<L.HeatLayer | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const southWest = L.latLng(-2.5, -93);
            const northEast = L.latLng(2.5, -88.5);
            const bounds = L.latLngBounds(southWest, northEast);

            const map = L.map(mapContainerRef.current, {
                center: [-0.95, -90.96],
                zoom: 7,
                scrollWheelZoom: true,
                maxBounds: bounds,
                minZoom: 7,
                maxBoundsViscosity: 1.0,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);
            
            mapRef.current = map;
        }

        const heatPoints: [number, number, number][] = Object.entries(data)
            .map(([islandName, count]) => {
                const coords = islandCoordinates[islandName];
                if (coords && count > 0) {
                    return [...coords, count] as [number, number, number];
                }
                return null;
            })
            .filter((p): p is [number, number, number] => p !== null);

        if (mapRef.current) {
            if (!heatLayerRef.current) {
                heatLayerRef.current = (L as any).heatLayer(heatPoints, {
                    radius: 35,
                    blur: 20,
                    maxZoom: 1,
                    max: Math.max(...Object.values(data), 1),
                }).addTo(mapRef.current);
            } else {
                 heatLayerRef.current.setLatLngs(heatPoints);
                 heatLayerRef.current.setOptions({max: Math.max(...Object.values(data), 1)});
            }
        }

    }, [data, t]); 
  
    return <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden"></div>;
};

export default HeatmapComponent;
