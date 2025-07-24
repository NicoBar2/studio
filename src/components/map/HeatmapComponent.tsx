
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geojson } from '@/lib/data/islandsGeoJson';

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type HeatmapComponentProps = {
  data: Record<string, number>; // { "IslandName": count }
};

const HeatmapComponent = ({ data }: HeatmapComponentProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
    const legendRef = useRef<L.Control | null>(null);

    const getColor = (count: number, maxCount: number) => {
        if (count === 0 || maxCount === 0) return '#FFFFFF'; // White for no data
        const intensity = count / maxCount;
        if (intensity > 0.8) return '#08519c'; // Darkest blue
        if (intensity > 0.6) return '#3182bd';
        if (intensity > 0.4) return '#6baed6';
        if (intensity > 0.2) return '#9ecae1';
        return '#c6dbef'; // Lightest blue
    };

    const style = (feature: any) => {
        const islandName = feature.properties.island;
        const count = data[islandName] || 0;
        const allCounts = Object.values(data);
        const maxCount = allCounts.length > 0 ? Math.max(...allCounts) : 1;
        
        return {
            fillColor: getColor(count, maxCount),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

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

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            geoJsonLayerRef.current = L.geoJSON(geojson as any, { style }).addTo(map);
            mapRef.current = map;
        }

        // Update layer styles when data changes
        if (geoJsonLayerRef.current) {
            geoJsonLayerRef.current.eachLayer(layer => {
                if ('feature' in layer) {
                    (layer as L.Path).setStyle(style(layer.feature));
                    const islandName = layer.feature.properties.island;
                    const count = data[islandName] || 0;
                    layer.bindTooltip(`${islandName}: ${count} especies`);
                }
            });
        }
        
        // Update legend
        if(mapRef.current) {
            if(legendRef.current) {
                mapRef.current.removeControl(legendRef.current);
            }
            const legend = new L.Control({ position: 'bottomright' });
            legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend p-2 bg-white bg-opacity-80 rounded-md shadow-lg');
                const allCounts = Object.values(data);
                const maxCount = allCounts.length > 0 ? Math.max(...allCounts) : 0;
                const grades = [0, Math.round(maxCount*0.2), Math.round(maxCount*0.4), Math.round(maxCount*0.6), Math.round(maxCount*0.8)];
                
                div.innerHTML += '<h4 class="font-bold text-sm mb-1">Nº de Especies</h4>';
                for (let i = 0; i < grades.length; i++) {
                    const from = grades[i];
                    const to = grades[i + 1];
                    div.innerHTML +=
                        `<i class="h-[18px] w-[18px] float-left opacity-70 mr-2" style="background:${getColor(from + 1, maxCount)}"></i> ` +
                        from + (to ? `&ndash;${to}<br>` : '+');
                }
                return div;
            };
            legend.addTo(mapRef.current);
            legendRef.current = legend;
        }

    }, [data, style]);
  
    return <div ref={mapContainerRef} className="h-full w-full"></div>;
};

export default HeatmapComponent;
