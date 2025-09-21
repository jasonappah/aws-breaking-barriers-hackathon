import { publicProcedure } from "@/lib/orpc";
import z from "zod";

const SiteIdentifier = z.object({
    id: z.string()
});

const TowerTypes = {
    "monopole": "Monopole",

}

const BackhaulOptions = {
    "microwave": "Microwave",
    "fiber": "Fiber",
    "radio": "Radio",
    "satellite": "Satellite",
}

export const sitesRouter = {
    create: publicProcedure.input().handler(async ({ input }) => {
        // TODO: Implement
    }),
    getById: publicProcedure.input(SiteIdentifier).handler(async ({ input }) => {
        // TODO: Implement
    }),
    getAll: publicProcedure.handler(async () => {
        // TODO: Implement
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
        }),
    }
};