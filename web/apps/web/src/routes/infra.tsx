import { createFileRoute, Link } from "@tanstack/react-router";
import DeckGlMapCanvas from "@/components/infra/DeckGlMapCanvas";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/infra")({
    component: RouteComponent,
});

function RouteComponent() {
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
                    <Link to="/research-site">
                        <Button variant="outline" size="icon" >
                            <PlusIcon />
                        </Button>
                    </Link>
                </div>
                <div className="h-40 rounded border flex items-center justify-center text-sm text-muted-foreground">
                    SitesPanel
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
        </div>
    );
}


