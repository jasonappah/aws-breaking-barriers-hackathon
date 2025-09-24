import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {DeckGL} from '@deck.gl/react';
import {MapView, type PickingInfo} from '@deck.gl/core';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {Map} from 'react-map-gl/mapbox';

// Dallas, TX coordinates and cell tower data
const DALLAS_CENTER = [-96.7970, 32.7767]; // Dallas, TX coordinates
const ZOOM_LEVEL = 12;

// Generate truly random cell towers across Dallas area
function generateRandomTowers() {
    const towers = [];
    const radioTypes = ['LTE', '5G', 'GSM'];
    
    // Dallas area bounds for more realistic coverage
    const minLng = -96.9;
    const maxLng = -96.6;
    const minLat = 32.6;
    const maxLat = 32.9;
    
    for (let i = 1; i <= 120; i++) {
        // Generate truly random coordinates
        const longitude = minLng + Math.random() * (maxLng - minLng);
        const latitude = minLat + Math.random() * (maxLat - minLat);
        const radio = radioTypes[Math.floor(Math.random() * radioTypes.length)];
        const baseSignalStrength = 0.5 + Math.random() * 0.4; // 0.5 to 0.9
        
        towers.push({
            id: i,
            longitude,
            latitude,
            radio,
            signalStrength: baseSignalStrength
        });
    }
    
    return towers;
}

const CELL_TOWERS = generateRandomTowers();

// Risk areas (heatmap data) - positioned to affect specific towers
const RISK_AREAS = [
    {
        type: 'Feature',
        properties: { severity: 'high', name: 'High Risk Zone 1' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-96.8000, 32.7700],
                [-96.7900, 32.7700],
                [-96.7900, 32.7800],
                [-96.8000, 32.7800],
                [-96.8000, 32.7700]
            ]]
        }
    },
    {
        type: 'Feature',
        properties: { severity: 'medium', name: 'Medium Risk Zone 1' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-96.8200, 32.7500],
                [-96.8100, 32.7500],
                [-96.8100, 32.7600],
                [-96.8200, 32.7600],
                [-96.8200, 32.7500]
            ]]
        }
    },
    {
        type: 'Feature',
        properties: { severity: 'low', name: 'Low Risk Zone 1' },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [-96.7800, 32.7900],
                [-96.7700, 32.7900],
                [-96.7700, 32.8000],
                [-96.7800, 32.8000],
                [-96.7800, 32.7900]
            ]]
        }
    }
];

// Function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Function to check if a point is inside a polygon
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

// Function to calculate signal strength based on proximity to risk areas with gradient falloff
function calculateSignalStrength(tower: any, riskAreas: any[]): number {
    let maxBoost = 0;
    let minDistance = Infinity;

    // Check distance to all risk areas
    for (const riskArea of riskAreas) {
        const coordinates = riskArea.geometry.coordinates[0];
        const isInside = isPointInPolygon([tower.longitude, tower.latitude], coordinates);
        
        if (isInside) {
            // Tower is inside a risk area - get maximum boost
            const severityMultiplier = riskArea.properties.severity === 'critical' ? 2.5 :
                                     riskArea.properties.severity === 'high' ? 2.0 :
                                     riskArea.properties.severity === 'medium' ? 1.6 : 1.3;
            maxBoost = Math.max(maxBoost, severityMultiplier);
        } else {
            // Calculate distance to the nearest edge of the risk area
            const distance = calculateDistanceToPolygon([tower.longitude, tower.latitude], coordinates);
            minDistance = Math.min(minDistance, distance);
        }
    }

    const baseStrength = tower.signalStrength;

    if (maxBoost > 0) {
        // Tower is inside a risk area - get maximum boost
        return Math.min(1.0, baseStrength * maxBoost);
    } else {
        // Tower is outside risk areas - apply simple gradient boost
        const maxBoostDistance = 0.04; // ~4.4km in degrees
        
        if (minDistance <= maxBoostDistance) {
            // Tower is close to risk area - give it a boost that decreases with distance
            const proximityBoost = 1.0 + (1.0 - minDistance / maxBoostDistance) * 1.2; // 1.0x to 2.2x boost
            return Math.min(1.0, baseStrength * proximityBoost);
        } else {
            // Tower is far from risk areas - normal signal strength
            return baseStrength;
        }
    }
}

// Function to calculate distance from a point to the nearest edge of a polygon
function calculateDistanceToPolygon(point: [number, number], polygon: number[][]): number {
    let minDistance = Infinity;
    
    for (let i = 0; i < polygon.length; i++) {
        const start = polygon[i];
        const end = polygon[(i + 1) % polygon.length];
        const distance = calculateDistanceToLineSegment(point, start, end);
        minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
}

// Function to calculate distance from a point to a line segment
function calculateDistanceToLineSegment(point: [number, number], lineStart: number[], lineEnd: number[]): number {
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;
    
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
        // Line segment is actually a point
        return Math.sqrt(A * A + B * B);
    }
    
    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

interface DemoMapCanvasProps {
    crisisMode: boolean;
}

export default function DemoMapCanvas({ crisisMode }: DemoMapCanvasProps) {
    const [towers, setTowers] = useState(CELL_TOWERS);
    const [riskAreas, setRiskAreas] = useState(RISK_AREAS);
    
    const token = useMemo(() => import.meta.env.VITE_MAPBOX_TOKEN as string, []);

    // Update signal strengths based on risk proximity and crisis mode
    useEffect(() => {
        const updatedTowers = CELL_TOWERS.map(tower => {
            let baseSignalStrength = calculateSignalStrength(tower, riskAreas);

            // In crisis mode, boost towers in risk areas and shrink towers outside risk areas
            if (crisisMode) {
                if (baseSignalStrength > tower.signalStrength) {
                    // This tower is in a risk area, give it even more boost in crisis
                    baseSignalStrength = Math.min(1.0, baseSignalStrength * 1.5);
                } else {
                    // This tower is outside risk areas, shrink its signal dramatically in crisis
                    baseSignalStrength = Math.max(0.1, baseSignalStrength * 0.2);
                }
            }

            return {
                ...tower,
                signalStrength: baseSignalStrength
            };
        });
        setTowers(updatedTowers);
    }, [riskAreas, crisisMode]);

    // Update risk areas in crisis mode
    useEffect(() => {
        if (crisisMode) {
            // Expand risk areas and add new ones during crisis
            const crisisRiskAreas = [
                ...RISK_AREAS,
                {
                    type: 'Feature',
                    properties: { severity: 'critical', name: 'Critical Crisis Zone' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [-96.8100, 32.7600],
                            [-96.7800, 32.7600],
                            [-96.7800, 32.7900],
                            [-96.8100, 32.7900],
                            [-96.8100, 32.7600]
                        ]]
                    }
                },
                {
                    type: 'Feature',
                    properties: { severity: 'high', name: 'Expanded High Risk Zone' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [-96.8300, 32.7400],
                            [-96.7900, 32.7400],
                            [-96.7900, 32.8000],
                            [-96.8300, 32.8000],
                            [-96.8300, 32.7400]
                        ]]
                    }
                }
            ];
            setRiskAreas(crisisRiskAreas);
        } else {
            setRiskAreas(RISK_AREAS);
        }
    }, [crisisMode]);

    const getTooltip = useCallback(({object}: PickingInfo) => {
        if (!object) return null;
        if (!object.radio) return null;
        return {
            html: `<div style="font: 12px/1.4 system-ui, sans-serif">
                <div><b>Radio</b>: ${object.radio ?? "—"}</div>
                <div><b>Signal Strength</b>: ${(object.signalStrength * 100).toFixed(1)}%</div>
                <div><b>Coverage Radius</b>: ${(object.signalStrength * 400).toFixed(0)}m</div>
            </div>`
        };
    }, []);

    // Map severity to color
    const severityToColor = (severity: string) => {
        switch (severity) {
            case 'critical': return [255, 0, 0, 150]; // Bright Red
            case 'high': return [255, 80, 80, 120]; // Red
            case 'medium': return [255, 140, 0, 100]; // Orange
            case 'low': return [255, 255, 0, 80]; // Yellow
            default: return [128, 128, 128, 80]; // Gray
        }
    };

    const layers = useMemo(() => {
        const layers: any[] = [];

        // Risk areas layer
        layers.push(new GeoJsonLayer({
            id: 'risk-areas',
            data: {
                type: 'FeatureCollection',
                features: riskAreas
            } as any,
            pickable: true,
            filled: true,
            stroked: true,
            getFillColor: (feature: any) => severityToColor(feature?.properties?.severity) as any,
            getLineColor: [255, 255, 255, 200],
            lineWidthScale: 2,
        }));

        // Cell towers with signal strength circles
        layers.push(new ScatterplotLayer({
            id: 'cell-towers',
            data: towers,
            pickable: true,
            getPosition: (d: any) => [d.longitude, d.latitude],
            getRadius: (d: any) => Math.max(150, d.signalStrength * 300), // Slightly larger circles
            getFillColor: (d: any) => {
                // Single blue color for all signal strength circles
                // Opacity based on signal strength for better contrast
                if (d.signalStrength > 0.8) {
                    return [0, 100, 255, 180]; // Bright blue for strong signal
                } else if (d.signalStrength > 0.4) {
                    return [0, 100, 255, 120]; // Medium blue for medium signal
                } else {
                    return [0, 100, 255, 60]; // Light blue for weak signal
                }
            },
            getLineColor: [255, 255, 255, 200],
            lineWidthScale: 2,
        }));

        // Cell tower centers (small dots)
        layers.push(new ScatterplotLayer({
            id: 'cell-tower-centers',
            data: towers,
            pickable: true,
            getPosition: (d: any) => [d.longitude, d.latitude],
            getRadius: 3, // Smaller center dots
            getFillColor: [0, 0, 0, 255], // Black centers
        }));

        return layers;
    }, [towers, riskAreas]);

    return (
        <DeckGL
            initialViewState={{
                longitude: DALLAS_CENTER[0],
                latitude: DALLAS_CENTER[1],
                zoom: ZOOM_LEVEL
            }}
            controller={false} // Disable interaction as requested
            getTooltip={getTooltip}
            layers={layers}
        >
            <Map 
                mapStyle="mapbox://styles/mapbox/light-v9" 
                mapboxAccessToken={token}
                interactive={false}
            />
        </DeckGL>
    );
}