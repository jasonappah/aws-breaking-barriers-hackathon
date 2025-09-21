import { publicProcedure } from "@/lib/orpc";
import z from "zod";
import { db } from "../db";
import { site } from "../db/schema/sites";
import { eq } from "drizzle-orm";

const SiteIdentifier = z.object({
    id: z.number(),
});

const NewSiteInput = z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    latitude: z.number(),
    longitude: z.number(),
});

export const sitesRouter = {
    create: publicProcedure.input(NewSiteInput).handler(async ({ input }) => {
        const [created] = await db.insert(site).values({
            name: input.name,
            address: input.address,
            latitude: input.latitude,
            longitude: input.longitude,
        }).returning();
        return created;
    }),
    getById: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {
        const rows = await db.select().from(site).where(eq(site.id, input.id)).limit(1);
        return rows[0] ?? null;
    }),
    getAll: publicProcedure.handler(async () => {
        return await db.select().from(site);
    }),
    research: {
        zoning: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {
            // TODO: Implement

            // return links to permit documentation, maps, zoning laws
        }),
        power: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {
            // is 3 phase power available? where can someone look to verify this
        }),
        towerTypes: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {}),
        consumerSentiments: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {
            
        }),
        networkBackhaulOptions: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {
            // TODO: see whether microwave is an option based on proximity to existing sites

            const distanceToNearestTower = 0

            return distanceToNearestTower < 1000 ? "microwave" : "fiber";
        }),
    }
};