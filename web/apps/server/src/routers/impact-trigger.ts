import { publicProcedure } from "../lib/orpc";
import { computeImpact } from "../lib/impact";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import z from "zod";

const CrisisTriggerInput = z.object({
  useExistingData: z.boolean().optional().default(true),
  eventReports: z.array(z.object({
    event: z.string(),
    date: z.string(),
    time: z.string(),
    severity: z.string(),
    sourceOfReport: z.string(),
    structureType: z.string().optional(),
    surroundingLand: z.string().optional(),
    nearbyCriticalFacilities: z.string().optional(),
    weather: z.string().optional(),
    trafficDensity: z.string().optional(),
    roadClosures: z.string().optional(),
    address: z.string()
  })).optional()
});

export const impactTriggerRouter = {
  triggerCrisis: publicProcedure
    .input(CrisisTriggerInput)
    .handler(async ({ input }) => {
      try {
        let eventReports;
        
        if (input.useExistingData) {
          // Load existing event reports from JSON file
          const dataPath = join(process.cwd(), "src/db/data/event-reports.json");
          console.log("Attempting to read from path:", dataPath);
          try {
            const rawData = await readFile(dataPath, "utf8");
            const jsonData = JSON.parse(rawData);
            eventReports = jsonData.eventReports;
            console.log("Successfully loaded", eventReports?.length || 0, "event reports");
          } catch (fileError) {
            console.error("Error reading event reports file:", fileError);
            // Try alternative path
            const altPath = join(__dirname, "../db/data/event-reports.json");
            console.log("Trying alternative path:", altPath);
            try {
              const rawData = await readFile(altPath, "utf8");
              const jsonData = JSON.parse(rawData);
              eventReports = jsonData.eventReports;
              console.log("Successfully loaded from alternative path", eventReports?.length || 0, "event reports");
            } catch (altError) {
              console.error("Error reading from alternative path:", altError);
              throw new Error(`Failed to read event reports file from both paths: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
            }
          }
        } else if (input.eventReports) {
          // Use provided event reports
          eventReports = input.eventReports;
        } else {
          throw new Error("No event reports provided and useExistingData is false");
        }

        if (!eventReports || eventReports.length === 0) {
          throw new Error("No event reports available");
        }

        // Process the event reports through Bedrock to generate impact analysis
        console.log("Processing event reports through Bedrock...");
        const impactResult = await computeImpact(eventReports);
        console.log("Bedrock analysis completed successfully");
        
        return {
          success: true,
          message: "Crisis triggered successfully",
          data: impactResult,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error("Error triggering crisis:", error);
        return {
          success: false,
          message: `Failed to trigger crisis: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        };
      }
    }),

  getEventReports: publicProcedure.handler(async () => {
    try {
      const dataPath = join(process.cwd(), "src/db/data/event-reports.json");
      const rawData = await readFile(dataPath, "utf8");
      const jsonData = JSON.parse(rawData);
      return {
        success: true,
        data: jsonData
      };
    } catch (error) {
      console.error("Error loading event reports:", error);
      return {
        success: false,
        message: `Failed to load event reports: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }),

  getRiskData: publicProcedure.handler(async () => {
    try {
      const dataPath = join(process.cwd(), "src/db/data/risk.geojson");
      const rawData = await readFile(dataPath, "utf8");
      const jsonData = JSON.parse(rawData);
      return {
        success: true,
        data: jsonData
      };
    } catch (error) {
      console.error("Error loading risk data:", error);
      return {
        success: false,
        message: `Failed to load risk data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  })
};
