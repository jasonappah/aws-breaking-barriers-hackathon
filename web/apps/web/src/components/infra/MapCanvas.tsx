import { useEffect, useMemo, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { useInfraStore } from "@/store/infraStore";

// === CONFIG: path to your generated GeoJSON (CSV -> GeoJSON) ===
const OVERLAY_URL = "/us_310.geojson";

// Helper: (re)attach the OpenCelliD overlay after style load / map init
function addCellsOverlay(map: Map, url: string) {
  // Remove prior layers/sources if they exist (style switches, hot reloads)
  if (map.getLayer("cells-unclustered")) map.removeLayer("cells-unclustered");
  if (map.getLayer("cells-cluster-count")) map.removeLayer("cells-cluster-count");
  if (map.getLayer("cells-clusters")) map.removeLayer("cells-clusters");
  if (map.getSource("cells")) map.removeSource("cells");

  map.addSource("cells", {
    type: "geojson",
    data: url,
    cluster: true,
    clusterRadius: 40,
    clusterMaxZoom: 12,
  });

  // Cluster bubbles
  map.addLayer({
    id: "cells-clusters",
    type: "circle",
    source: "cells",
    filter: ["has", "point_count"],
    paint: {
      "circle-radius": ["step", ["get", "point_count"], 14, 50, 18, 200, 24],
      "circle-color": ["step", ["get", "point_count"], "#78c6ff", 50, "#4da3ff", 200, "#1f78ff"],
      "circle-opacity": 0.8,
    },
  });

  // Cluster counts
  map.addLayer({
    id: "cells-cluster-count",
    type: "symbol",
    source: "cells",
    filter: ["has", "point_count"],
    layout: { "text-field": ["to-string", ["get", "point_count"]], "text-size": 12 },
    paint: { "text-color": "#ffffff" },
  });

  // Individual towers
  map.addLayer({
    id: "cells-unclustered",
    type: "circle",
    source: "cells",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 4,
      "circle-color": [
        "match",
        ["get", "radio"],
        "GSM",
        "#888888",
        "UMTS",
        "#a855f7",
        "LTE",
        "#22c55e",
        "CDMA",
        "#f59e0b",
        "NR",
        "#ef4444",
        /* other */ "#3b82f6",
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 0.75,
    },
  });

  // Click cluster to zoom in
  map.on("click", "cells-clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ["cells-clusters"] });
    const clusterId = features[0].properties?.cluster_id;
    const src = map.getSource("cells") as any;
    if (!src?.getClusterExpansionZoom) return;
    src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
      if (err) return;
      const coords = (features[0].geometry as any).coordinates as [number, number];
      map.easeTo({ center: coords, zoom });
    });
  });

  // Popups for single towers
  map.on("click", "cells-unclustered", (e) => {
    const f = e.features?.[0];
    if (!f) return;
    const [lng, lat] = (f.geometry as any).coordinates as [number, number];
    const p = f.properties as any;
    const epochToISO = (x?: number) => (x ? new Date(Number(x) * 1000).toISOString() : "—");
    const html = `
      <div style="font: 12px/1.4 system-ui, sans-serif">
        <div><b>Radio</b>: ${p.radio ?? "—"}</div>
        <div><b>MCC-MNC</b>: ${p.mcc ?? "—"}-${p.mnc ?? "—"}</div>
        <div><b>Area</b>: ${p.area ?? "—"} | <b>Cell</b>: ${p.cell ?? "—"} | <b>Unit</b>: ${p.unit ?? "—"}</div>
        <div><b>Range</b>: ${p.range ?? "—"} m | <b>Samples</b>: ${p.samples ?? "—"}</div>
        <div><b>Avg Signal</b>: ${p.averageSignal ?? "—"}</div>
        <div><b>First seen</b>: ${epochToISO(p.created)}<br/>
             <b>Last update</b>: ${epochToISO(p.updated)}</div>
      </div>
    `;
    new mapboxgl.Popup({ closeButton: true, closeOnClick: true }).setLngLat([lng, lat]).setHTML(html).addTo(map);
  });

  // Cursor feedback
  ["cells-clusters", "cells-unclustered"].forEach((layer) => {
    map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
  });
}

export default function MapCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isLoadedRef = useRef(false);

  const viewport = useInfraStore((s) => s.viewport);
  const styleId = useInfraStore((s) => s.styleId);
  const setViewport = useInfraStore((s) => s.setViewport);

  const token = useMemo(() => import.meta.env.VITE_MAPBOX_TOKEN as string, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleId,
      center: [viewport.lng, viewport.lat],
      zoom: viewport.zoom,
      pitch: viewport.pitch,
      bearing: viewport.bearing,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "imperial" }), "bottom-left");

    map.on("load", () => {
      isLoadedRef.current = true;
      map.resize();
      // Attach OpenCelliD overlay once the style is ready
      addCellsOverlay(map, OVERLAY_URL);
    });

    map.on("styledata", () => {
      // Re-attach after style switches (if you swap basemaps)
      if (isLoadedRef.current) addCellsOverlay(map, OVERLAY_URL);
    });

    map.on("moveend", () => {
      const c = map.getCenter();
      setViewport({
        lng: c.lng,
        lat: c.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, styleId, viewport.lng, viewport.lat, viewport.zoom, viewport.pitch, viewport.bearing, setViewport]);

  // Keep map in sync when viewport changes elsewhere
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;
    const c = map.getCenter();
    const needsCenter = Math.abs(c.lng - viewport.lng) > 1e-6 || Math.abs(c.lat - viewport.lat) > 1e-6;
    if (needsCenter || map.getZoom() !== viewport.zoom || map.getPitch() !== viewport.pitch || map.getBearing() !== viewport.bearing) {
      map.easeTo({
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom,
        pitch: viewport.pitch,
        bearing: viewport.bearing,
        duration: 300,
      });
    }
  }, [viewport.lng, viewport.lat, viewport.zoom, viewport.pitch, viewport.bearing]);

  return <div ref={containerRef} className="h-full w-full" />;
}