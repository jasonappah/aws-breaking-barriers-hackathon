import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export type Viewport = {
    lng: number;
    lat: number;
    zoom: number;
    pitch: number;
    bearing: number;
};

export type Selection =
    | { type: "none" }
    | { type: "site"; id: string }
    | { type: "tower"; id: string };

type TowersConfig = { visible: boolean; opacity: number; radius: number };
type PopulationConfig = { visible: boolean; scheme: "quantile" | "quantize"; opacity: number };
type Band14Config = { visible: boolean; intensity: number; radius: number; opacity: number };

export interface InfraState {
    viewport: Viewport;
    styleId: string;
    layers: {
        towers: TowersConfig;
        population: PopulationConfig;
        band14: Band14Config;
    };
    selection: Selection;
    // actions
    setViewport: (next: Partial<Viewport>) => void;
    setStyleId: (styleId: string) => void;
    toggleLayer: (key: keyof InfraState["layers"]) => void;
    setTowersConfig: (next: Partial<TowersConfig>) => void;
    setPopulationConfig: (next: Partial<PopulationConfig>) => void;
    setBand14Config: (next: Partial<Band14Config>) => void;
    select: (sel: Selection) => void;
}

export const useInfraStore = create<InfraState>()(
    subscribeWithSelector(
        persist(
            (set) => ({
                viewport: { lng: -96.797, lat: 32.7767, zoom: 10, pitch: 0, bearing: 0 },
                styleId: "mapbox://styles/mapbox/dark-v11",
                layers: {
                    towers: { visible: true, opacity: 0.9, radius: 4 },
                    population: { visible: false, scheme: "quantile", opacity: 0.6 },
                    band14: { visible: false, intensity: 0.8, radius: 20, opacity: 0.5 },
                },
                selection: { type: "none" },
                setViewport: (next) => set((s) => ({ viewport: { ...s.viewport, ...next } })),
                setStyleId: (styleId) => set({ styleId }),
                toggleLayer: (key) =>
                    set((s) => ({
                        layers: {
                            ...s.layers,
                            [key]: { ...s.layers[key], visible: !s.layers[key].visible },
                        },
                    })),
                setTowersConfig: (next) =>
                    set((s) => ({ layers: { ...s.layers, towers: { ...s.layers.towers, ...next } } })),
                setPopulationConfig: (next) =>
                    set((s) => ({ layers: { ...s.layers, population: { ...s.layers.population, ...next } } })),
                setBand14Config: (next) =>
                    set((s) => ({ layers: { ...s.layers, band14: { ...s.layers.band14, ...next } } })),
                select: (sel) => set({ selection: sel }),
            }),
            { name: "infra-store" }
        )
    )
);


