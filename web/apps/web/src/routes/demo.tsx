import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import DemoMapCanvas from "../components/infra/DemoMapCanvas";
import SitesList from "@/components/infra/SitesList";
import dummySites from "@/data/dummySites";

export const Route = createFileRoute("/demo")({
    component: RouteComponent,
});

function RouteComponent() {
    const [crisisMode, setCrisisMode] = useState(false);

    return (
        <div className="h-full grid grid-cols-[320px_1fr_360px]">
            <aside className="border-r p-2 overflow-y-auto">
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <h2 className="text-base font-semibold">Demo Controls</h2>
                </div>
                <div className="h-40 rounded border flex items-center justify-center text-sm text-muted-foreground">
                    <div className="text-center">
                        <p>Risk Heatmap Demo</p>
                        <p className="text-xs mt-2">Cell tower signal strength varies based on proximity to risk areas</p>
                    </div>
                </div>
                <div className="mt-4">
                    <Button 
                        onClick={() => setCrisisMode(!crisisMode)}
                        className={`w-full ${crisisMode ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {crisisMode ? 'Crisis Active' : 'Trigger Crisis'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        {crisisMode ? 'Crisis mode: Enhanced signal strength in risk areas' : 'Click to simulate crisis scenario'}
                    </p>
                </div>
                <div className="sticky top-0 bg-background z-10 pb-2 mt-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold">Legend</h2>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-600" />
                        <span className="text-sm">Critical Risk Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-sm">High Risk Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500" />
                        <span className="text-sm">Medium Risk Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <span className="text-sm">Low Risk Area</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-sm">Cell Tower</span>
                    </div>
                </div>
                <div className="sticky top-0 bg-background z-10 pb-2 mt-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold">Sites</h2>
                </div>
                <SitesList sites={dummySites} />
            </aside>
            <main className="relative">
                <div className="absolute inset-0 border-x">
                    <DemoMapCanvas crisisMode={crisisMode} />
                </div>
            </main>
            <aside className="border-l p-2 overflow-y-auto">
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <h2 className="text-base font-semibold">Signal Strength</h2>
                </div>
                <div className="h-40 rounded border flex items-center justify-center text-sm text-muted-foreground">
                    <div className="text-center">
                        <p>Signal strength circles show coverage area</p>
                        <p className="text-xs mt-2">Larger circles = stronger signal</p>
                        <p className="text-xs">Signal strength increases near risk areas</p>
                        {crisisMode && (
                            <p className="text-xs text-red-500 font-semibold mt-2">
                                CRISIS MODE: Enhanced signal strength active
                            </p>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
}
