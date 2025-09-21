import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import DeckGlMapCanvas from "@/components/infra/DeckGlMapCanvas";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/infra")({
    component: RouteComponent,
});

function RouteComponent() {
    const sitesQuery = useQuery(orpc.sites.getAll.queryOptions());
    const sites = sitesQuery.data ?? [];
    const navigate = useNavigate();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const createSite = useMutation(
        orpc.sites.create.mutationOptions({
            onSuccess: (created) => {
                sitesQuery.refetch();
                setIsCreateOpen(false);
                setName("");
                setAddress("");
                setLatitude("");
                setLongitude("");
                if (created?.id != null) {
                    navigate({ to: "/research-site/$siteId", params: { siteId: String(created.id) } });
                }
            },
        }),
    );

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!latitude || !longitude) return;
        createSite.mutate({
            name: name || undefined,
            address: address || undefined,
            latitude: Number.parseFloat(latitude),
            longitude: Number.parseFloat(longitude),
        });
    };

    return (
        <div className="h-full grid grid-cols-[320px_1fr_360px]">
            <aside className="border-r p-2 overflow-y-auto">
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <h2 className="text-base font-semibold">Layers</h2>
                </div>
                <div className="h-40 rounded border flex items-center justify-center text-sm text-muted-foreground">
                    LayersPanel
                </div>
                <div className="sticky top-0 bg-background z-10 pb-2 mt-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold">Sites</h2>
                    <Button variant="outline" size="icon" onClick={() => setIsCreateOpen(true)}>
                        <PlusIcon />
                    </Button>
                </div>
                <div className="rounded border p-1 text-sm">
                    {sitesQuery.isLoading ? (
                        <div className="h-32 flex items-center justify-center text-muted-foreground">Loading…</div>
                    ) : sites.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-muted-foreground">No sites yet</div>
                    ) : (
                        <ul className="space-y-1">
                            {sites.map((s) => (
                                <li key={s.id} className="flex items-center justify-between rounded hover:bg-accent px-2 py-1">
                                    <div>
                                        <div className="font-medium">{s.name ?? `Site ${s.id}`}</div>
                                        <div className="text-xs text-muted-foreground">{s.address ?? `${s.latitude}, ${s.longitude}`}</div>
                                    </div>
                                    <Link to="/research-site/$siteId" params={{ siteId: String(s.id) }}>
                                        <Button size="sm" variant="outline">View</Button>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
            <main className="relative">
                <div className="absolute inset-0 border-x">
                    <DeckGlMapCanvas />
                </div>
            </main>
            <aside className="border-l p-2 overflow-y-auto">
                <div className="sticky top-0 bg-background z-10 pb-2">
                    <h2 className="text-base font-semibold">Inspector</h2>
                </div>
                <div className="h-40 rounded border flex items-center justify-center text-sm text-muted-foreground">
                    Inspector
                </div>
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


