import { useCallback, useEffect, useMemo } from 'react';
import {DeckGL} from '@deck.gl/react';
import {FirstPersonView, MapView, type PickingInfo} from '@deck.gl/core';
import {GeoJsonLayer, LineLayer} from '@deck.gl/layers';
import {ZoomWidget} from '@deck.gl/react';
import {Map} from 'react-map-gl/mapbox';
import { orpc } from '@/utils/orpc';
import { useQuery } from "@tanstack/react-query";

const fileList = [
    "us_data/us_310_split_part1.geojson",
    "us_data/us_311_split_part2.geojson",
    "us_data/us_312.geojson",
    "us_data/us_313.geojson",
    "us_data/us_314.geojson"
]

const epochToISO = (x?: number) => (x ? new Date(Number(x) * 1000).toISOString() : "—");

function App() {
    const token = useMemo(() => import.meta.env.VITE_MAPBOX_TOKEN as string, []);

    const getTooltip = useCallback(({object}: PickingInfo) => {
        if (!object) return null;
        const p = object.properties as any;
        return {
            html: `<div style="font: 12px/1.4 system-ui, sans-serif">
        <div><b>Radio</b>: ${p.radio ?? "—"}</div>
        <div><b>MCC-MNC</b>: ${p.mcc ?? "—"}-${p.mnc ?? "—"}</div>
        <div><b>Area</b>: ${p.area ?? "—"} | <b>Cell</b>: ${p.cell ?? "—"} | <b>Unit</b>: ${p.unit ?? "—"}</div>
        <div><b>Range</b>: ${p.range ?? "—"} m | <b>Samples</b>: ${p.samples ?? "—"}</div>
        <div><b>Avg Signal</b>: ${p.averageSignal ?? "—"}</div>
        <div><b>First seen</b>: ${epochToISO(p.created)}<br/>
             <b>Last update</b>: ${epochToISO(p.updated)}</div>
        </div>
        `
        };
      }, []);

    const riskData = useQuery(orpc.risk.getDummyData.queryOptions());

    // Map a severity string/number to an RGBA color (alpha 0-255)
    const severityToColor = (severity: any, forLine = false) => {
        // Accept numbers or strings like 'low'|'medium'|'high'|'critical'
        const s = typeof severity === 'string' ? severity.toLowerCase() : severity;
        // Colors: low -> light yellow, medium -> orange, high -> red
        if (s === 'low') return forLine ? [255, 215, 0, 200] : [255, 255, 153, 100]; // pale yellow fill
        if (s === 'high') return forLine ? [255, 87, 34, 200] : [255, 140, 0, 120]; // dark orange fill
        if (s === 'critical') return forLine ? [220, 20, 60, 200] : [255, 80, 80, 120]; // red
        // default / medium
        return forLine ? [255, 200, 100, 180] : [255, 220, 160, 90]; // light orange
    }
  
    const layers = useMemo(() => {
        const base = fileList.map((file) => new GeoJsonLayer({
            id: file,
            data: file,
            pickable: true,
            getLineWidth: 20,
            getPointRadius: 4,
            filled: true,
            stroked: true,
            getFillColor: () => ([255, 140, 0, 120] as any),
            getLineColor: () => ([255, 140, 0, 200] as any),
            lineWidthScale: 1,
        }));

        const layers: any[] = [...base];

        if (riskData.data) {
            layers.push(new GeoJsonLayer({
                id: 'risk',
                data: riskData.data,
                pickable: true,
                filled: true,
                stroked: true,
                getFillColor: (feature: any) => (severityToColor(feature?.properties?.severity, false) as any),
                getLineColor: (feature: any) => (severityToColor(feature?.properties?.severity, true) as any),
                lineWidthScale: 1,
                getPointRadius: 50,
            }));
        }

        return layers;
    }, [riskData.data]);

    return (
        <DeckGL
            initialViewState={{
                longitude: -122.41669,
                latitude: 37.7853,
                zoom: 5
            }}
            controller
            getTooltip={getTooltip}
            layers={layers}
        >

        <MapView id="map" width="100%" controller >
            <Map mapStyle="mapbox://styles/mapbox/light-v9" mapboxAccessToken={token} />
        </MapView>

        <FirstPersonView width="50%" x="50%" fovy={50} />

        <ZoomWidget/>
        </DeckGL>
    );
}

export default App;