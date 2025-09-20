import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useInfraStore } from "@/store/infraStore";

// Mapbox CSS is imported globally in main entry to avoid duplication

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

    // Note: we'll handle style/theme switching in a follow-up once overlays exist

    // Respond to viewport updates initiated elsewhere
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isLoadedRef.current) return;
        const center = map.getCenter();
        const needsCenter = Math.abs(center.lng - viewport.lng) > 1e-6 || Math.abs(center.lat - viewport.lat) > 1e-6;
        if (needsCenter || map.getZoom() !== viewport.zoom || map.getPitch() !== viewport.pitch || map.getBearing() !== viewport.bearing) {
            map.easeTo({ center: [viewport.lng, viewport.lat], zoom: viewport.zoom, pitch: viewport.pitch, bearing: viewport.bearing, duration: 300 });
        }
    }, [viewport.lng, viewport.lat, viewport.zoom, viewport.pitch, viewport.bearing]);

    return <div ref={containerRef} className="h-full w-full" />;
}


