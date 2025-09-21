import { protectedProcedure, publicProcedure } from "../lib/orpc";
import type { RouterClient } from "@orpc/server";
import { todoRouter } from "./todo";
import { sitesRouter } from "./sites";
import { impactTriggerRouter } from "./impact-trigger";
import { join } from "node:path";
import { readFile } from "node:fs/promises";


export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	risk: {
		getDummyData: publicProcedure.handler(async () => {
			return JSON.parse(await readFile(join(process.cwd(), "src/db/data/risk.geojson"), "utf8"));
		}),
	},
	todo: todoRouter,
	sites: sitesRouter,
	impactTrigger: impactTriggerRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
