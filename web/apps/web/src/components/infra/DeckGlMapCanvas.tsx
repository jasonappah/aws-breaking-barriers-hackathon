import { useCallback, useEffect, useMemo } from 'react';
import {DeckGL} from '@deck.gl/react';
import {FirstPersonView, MapView, type PickingInfo} from '@deck.gl/core';
import {GeoJsonLayer, LineLayer} from '@deck.gl/layers';
import {ZoomWidget} from '@deck.gl/react';
import {Map} from 'react-map-gl/mapbox';
import { orpc } from '@/utils/orpc';
import { useQuery } from "@tanstack/react-query";

const fileList = [
    // "us_data/us_310.geojson",
    // "us_data/us_311.geojson",
    // "us_data/us_312.geojson",
    // "us_data/us_313.geojson",
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
  
  return (
        <DeckGL
        initialViewState={{
            longitude: -122.41669,
            latitude: 37.7853,
            zoom: 13
        }}
        controller
        getTooltip={getTooltip}

        >

        {fileList.map((file) => (
            <GeoJsonLayer 
                key={file}
                id={file}
                data={file}
                pickable
                getLineWidth={20}
                getPointRadius={4}

            />
        ))}
        {riskData.data && <GeoJsonLayer 
            id={'risk'}
            data={riskData.data}
            // pickable
            // getLineWidth={20}
            // getPointRadius={4}

        />}

        <MapView id="map" width="100%" controller >
            <Map mapStyle="mapbox://styles/mapbox/light-v9" mapboxAccessToken={token} />
        </MapView>

        <FirstPersonView width="50%" x="50%" fovy={50} />

        <ZoomWidget/>
        </DeckGL>
  );
}

export default App;