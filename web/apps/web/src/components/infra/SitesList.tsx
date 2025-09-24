import { Fragment } from "react";
import type { Site } from "../../../../server/src/db/schema/sites";
import { Separator } from "@/components/ui/separator";

interface SitesListProps {
    sites: Site[];
    emptyText?: string;
}

export default function SitesList({ sites, emptyText = "No sites found" }: SitesListProps) {
    return (
        <div className="rounded border p-1 text-sm">
            <div className="h-32 flex flex-col justify-center text-muted-foreground overflow-y-scroll">
                {sites.length === 0 ? emptyText : undefined}

                {sites.length > 0 && sites.map((site) => (
                    <Fragment key={site.id}>
                        <div className="text-sm px-2">
                            {site.name}
                        </div>
                        <Separator className="my-2" />
                    </Fragment>
                ))}
            </div>
        </div>
    );
}


