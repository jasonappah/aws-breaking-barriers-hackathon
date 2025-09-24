import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import DeckGlMapCanvas from "@/components/infra/DeckGlMapCanvas";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Fragment, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Site } from "../../../server/src/db/schema/sites";
import SitesList from "@/components/infra/SitesList";
import dummySites from "@/data/dummySites";

export const Route = createFileRoute("/infra")({
    component: RouteComponent,
});

type CrisisData = {
    brief?: string;
    summary?: {
        events?: number;
        max_severity?: string | number;
    };
    generated_at?: string | number | Date;
    risk?: { features?: unknown[] };
    heat?: { features?: unknown[] };
};

function RouteComponent() {
    // Temporarily disable sites query to avoid database errors
    // const sitesQuery = useQuery(orpc.sites.getAll.queryOptions());
    // const sites = sitesQuery.data ?? [];
    const sites: Site[] = dummySites;
    const navigate = useNavigate();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    
    // Crisis trigger state
    const [crisisMode, setCrisisMode] = useState(false);
    const [crisisData, setCrisisData] = useState<CrisisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Temporarily disable site creation to avoid database errors
    const createSite = {
        mutate: () => {
            console.log("Site creation disabled - database not available");
        },
        isPending: false
    };


    const triggerCrisisMutation = useMutation(
        orpc.impactTrigger.triggerCrisis.mutationOptions({
            onSuccess: (data) => {
                console.log("Crisis trigger result:", data);
                if (data.success && data.data) {
                    setCrisisData(data.data as CrisisData);
                    setCrisisMode(true);
                    toast.success("Crisis triggered successfully! Heatmap generated using Bedrock AI.");
                } else {
                    toast.error(data.message || "Failed to trigger crisis");
                }
            },
            onError: (error) => {
                console.error("Error triggering crisis:", error);
                toast.error("Failed to trigger crisis. Please try again.");
            },
            onSettled: () => {
                setIsLoading(false);
            }
        })
    );

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!latitude || !longitude) return;
        createSite.mutate();
    };

    const handleTriggerCrisis = () => {
        if (crisisMode) {
            setCrisisMode(false);
            setCrisisData(null);
            toast.info("Crisis mode deactivated");
        } else {
            setIsLoading(true);
            triggerCrisisMutation.mutate({
                useExistingData: true
            });
        }
    };

    return (
        <div className="h-full grid grid-cols-[320px_1fr_360px]">
            <aside className="border-r p-2 overflow-y-auto">
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <h2 className="text-base font-semibold">Layers</h2>
                </div>
                <div className="space-y-4">
                    <div className="rounded border p-3">
                        <h3 className="text-sm font-semibold mb-2">Crisis Analysis</h3>
                        <div className="space-y-2">
                            <Button 
                                onClick={handleTriggerCrisis}
                                disabled={isLoading}
                                className={`w-full ${crisisMode ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Processing...' : crisisMode ? 'Crisis Active' : 'Trigger Crisis'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            {isLoading ? 'Using Bedrock AI to analyze event data...' : 
                             crisisMode ? 'Crisis mode: Risk analysis active' : 
                             'Click to analyze crisis using existing JSON data'}
                        </p>
                    </div>
                    <div className="h-32 rounded border flex items-center justify-center text-sm text-muted-foreground">
                        Additional Layers
                    </div>
                </div>
                <div className="sticky top-0 bg-background z-10 pb-2 mt-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold">Sites</h2>
                    <Button variant="outline" size="icon" onClick={() => setIsCreateOpen(true)}>
                        <PlusIcon />
                    </Button>
                </div>
                <SitesList sites={sites} />
            </aside>
            <main className="relative">
                <div className="absolute inset-0 border-x">
                    <DeckGlMapCanvas crisisMode={crisisMode} crisisData={crisisData} />
                </div>
            </main>
            <aside className="border-l p-2 overflow-y-auto">
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <h2 className="text-base font-semibold">
                        {crisisMode && crisisData ? 'Crisis Analysis' : 'Inspector'}
                    </h2>
                </div>
                {crisisMode && crisisData ? (
                    <div className="space-y-4">
                        <div className="rounded border p-3 bg-red-50 dark:bg-red-950">
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                                AI-Generated Crisis Brief
                            </h3>
                            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                                {crisisData.brief || 'No brief available'}
                            </p>
                        </div>
                        <div className="rounded border p-3">
                            <h3 className="text-sm font-semibold mb-2">Risk Summary</h3>
                            <div className="text-xs space-y-1">
                                <p><strong>Events:</strong> {crisisData.summary?.events || 0}</p>
                                <p><strong>Max Severity:</strong> {crisisData.summary?.max_severity || 'Unknown'}</p>
                                <p><strong>Generated:</strong> {crisisData.generated_at ? new Date(crisisData.generated_at).toLocaleString() : 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="rounded border p-3">
                            <h3 className="text-sm font-semibold mb-2">Risk Areas</h3>
                            <p className="text-xs text-muted-foreground">
                                {crisisData.risk?.features?.length || 0} risk polygons identified
                            </p>
                        </div>
                        <div className="rounded border p-3">
                            <h3 className="text-sm font-semibold mb-2">Heat Points</h3>
                            <p className="text-xs text-muted-foreground">
                                {crisisData.heat?.features?.length || 0} risk points identified by AI analysis
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-40 rounded border flex items-center justify-center text-sm text-muted-foreground">
                        Inspector
                    </div>
                )}
            </aside>
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        role="button"
                        tabIndex={0}
                        aria-label="Close create site dialog"
                        onClick={() => setIsCreateOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                                setIsCreateOpen(false);
                            }
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-md border bg-background p-4 shadow-xl">
                        <div className="mb-3">
                            <h3 className="text-base font-semibold">Create site</h3>
                            <p className="text-xs text-muted-foreground">Enter basic details to add a site.</p>
                        </div>
                        <form className="grid gap-2" onSubmit={handleCreateSubmit}>
                            <div>
                                <Label htmlFor="site-name">Name (optional)</Label>
                                <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="site-address">Address or description</Label>
                                <Input id="site-address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="site-lat">Latitude</Label>
                                    <Input id="site-lat" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                                </div>
                                <div>
                                    <Label htmlFor="site-lng">Longitude</Label>
                                    <Input id="site-lng" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                                </div>
                            </div>
                            <div className="mt-2 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createSite.isPending}>Cancel</Button>
                                <Button type="submit" disabled={createSite.isPending}>{createSite.isPending ? "Creating…" : "Create"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


