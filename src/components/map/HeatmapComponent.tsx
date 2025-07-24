
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geojson } from '@/lib/data/islandsGeoJson';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { t } = useLanguage();

    // New color palette from yellow to orange to red for better visual impact
    const getColor = (count: number, maxCount: number) => {
        if (count === 0 || maxCount === 0) return '#FFFFE0'; // Light yellow for no data or zero count
        const intensity = count / maxCount;
        if (intensity > 0.8) return '#d73027'; // Dark Red
        if (intensity > 0.6) return '#fc8d59'; // Orange
        if (intensity > 0.4) return '#fee08b'; // Yellow-Orange
        if (intensity > 0.2) return '#ffffbf'; // Lighter Yellow
        return '#f7f7f7'; // Off-white for very low counts
    };

    const highlightFeature = (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    const resetHighlight = (e: L.LeafletMouseEvent) => {
        geoJsonLayerRef.current?.resetStyle(e.target);
    }
    
    const onEachFeature = (feature: any, layer: L.Layer) => {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }

    const style = (feature: any) => {
        const islandName = feature.properties.island;
        const count = data[islandName] || 0;
        const allCounts = Object.values(data);
        const maxCount = allCounts.length > 0 ? Math.max(...allCounts, 1) : 1;
        
        return {
            fillColor: getColor(count, maxCount),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8
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

            geoJsonLayerRef.current = L.geoJSON(geojson as any, { style, onEachFeature }).addTo(map);
            mapRef.current = map;
        }

        // Update layer styles when data changes
        if (geoJsonLayerRef.current) {
            geoJsonLayerRef.current.eachLayer(layer => {
                if ('feature' in layer && layer.feature) {
                    (layer as L.Path).setStyle(style(layer.feature));
                    const islandName = layer.feature.properties.island;
                    const count = data[islandName] || 0;
                    const tooltipText = `${islandName}: ${count} ${t.species.toLocaleLowerCase()}`;
                    layer.bindTooltip(tooltipText, {
                        sticky: true,
                        direction: 'top',
                        className: 'leaflet-tooltip-custom'
                    });
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
                const div = L.DomUtil.create('div', 'info legend p-2 bg-white bg-opacity-90 rounded-md shadow-lg w-40');
                const allCounts = Object.values(data);
                const maxCount = allCounts.length > 0 ? Math.max(...allCounts) : 0;
                
                // Smart grades for the legend
                let grades = [0];
                if (maxCount > 0) {
                    const step = Math.ceil(maxCount / 4);
                    if (step > 0) {
                      for (let i = 1; i <= 4; i++) {
                        grades.push(step * i);
                      }
                      grades = [...new Set(grades)].sort((a,b) => a-b); // Remove duplicates and sort
                      if(grades[grades.length-1] > maxCount) grades[grades.length-1] = maxCount;
                    } else if (maxCount > 0) {
                       grades = [0, maxCount];
                    }
                }


                div.innerHTML += `<h4 class="font-headline text-sm font-bold mb-1 text-black">${t.species}</h4>`;
                
                // loop through our density intervals and generate a label with a colored square for each interval
                for (let i = 0; i < grades.length; i++) {
                    const from = grades[i];
                    const to = grades[i + 1];
                    const color = getColor(from + 1, maxCount);

                    div.innerHTML +=
                        `<div class="flex items-center">
                            <i class="h-4 w-4 inline-block mr-2" style="background:${color}; border: 1px solid #AAA"></i> ` +
                            `<span class="text-black">${from}${to ? '&ndash;' + to : '+'}</span>` +
                        `</div>`;
                }

                return div;
            };
            legend.addTo(mapRef.current);
            legendRef.current = legend;
        }

    }, [data, style, t]);
  
    return <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden"></div>;
};

export default HeatmapComponent;
