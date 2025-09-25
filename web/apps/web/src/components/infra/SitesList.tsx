import { Fragment } from "react";
import type { Site } from "../../../../server/src/db/schema/sites";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";

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
                    <Link key={site.id} to={'/research-site/$siteId'} params={{
                        siteId: site.id.toString()
                    }}>
                        <div className="text-sm px-2">
                            {site.name}
                        </div>
                        <Separator className="my-2" />
                    </Link>
                ))}
            </div>
        </div>
    );
}


