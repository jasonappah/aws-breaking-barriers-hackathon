// web/apps/server/src/routes/impact.ts
import { computeImpact } from "../lib/impact";
import { publicProcedure } from "@/lib/orpc";
import z from "zod"



export const impactRouter = {
  // publicProcedure.input()
}

// impactRouter.post("/impact", async (req, res) => {
//   try {
//     const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
//     const events = body?.eventReports ?? body?.events ?? [];
//     if (!Array.isArray(events) || events.length === 0) {
//       return res.status(400).json({ error: "Provide { eventReports: [...] }" });
//     }
//     const out = await computeImpact(events);
//     // Return both: polygons (repo style) + heat points + brief
//     return res.json(out);
//   } catch (err: any) {
//     console.error(err);
//     return res.status(500).json({ error: String(err?.message || err) });
//   }
// });
