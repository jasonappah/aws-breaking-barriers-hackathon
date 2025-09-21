// web/apps/server/src/lib/impact.ts
import { LocationClient, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const REGION = process.env.AWS_REGION ?? "us-west-2";
const PLACE_INDEX_NAME = process.env.PLACE_INDEX_NAME ?? "CrisisPlaceIndex";
const CLAUDE_MODEL = "anthropic.claude-3-5-sonnet-20240620";

const location = new LocationClient({ region: REGION });
const bedrock = new BedrockRuntimeClient({ region: REGION });

// Reuse the same circle logic and units as web/scripts/convert.ts (km).  :contentReference[oaicite:4]{index=4}
export function circlePolygon(centerLonLat: [number, number], radiusKm: number, points = 64) {
  const [lon, lat] = centerLonLat;
  const distanceX = radiusKm / (111.320 * Math.cos(lat * Math.PI / 180));
  const distanceY = radiusKm / 110.574;
  const ring: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ring.push([lon + x, lat + y]);
  }
  ring.push(ring[0]);
  return { type: "Polygon" as const, coordinates: [ring] };
}

// defaults chosen to match your example risk.geojson radii style (km).  :contentReference[oaicite:5]{index=5}

function radiusKmFor(ev: any) {
  const severities: any = { Critical: 1.2, High: 1.5, Medium: 0.8, Low: 0.5 };
  const base = severities[ev.severity] ?? 0.8;
  return /utility/i.test(ev.structureType ?? "") ? base + 0.5 : base;
}


function weightFor(severity: string) {
  const severities: any = { Critical: 1.0, High: 0.8, Medium: 0.5, Low: 0.3 };
  return severities[severity] ?? 0.5;
}


export async function geocode(address: string) {
  const res = await location.send(new SearchPlaceIndexForTextCommand({
    IndexName: PLACE_INDEX_NAME,
    Text: address,
    MaxResults: 1
  }));
  const pt = res.Results?.[0]?.Place?.Geometry?.Point; // [lon, lat]
  if (!pt) throw new Error(`Could not geocode: ${address}`);
  return { lon: pt[0], lat: pt[1] };
}

export async function makeBrief(events: any[], meta: any, countPoints: number) {
  const prompt = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 350,
    temperature: 0.2,
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text: `You are an emergency operations analyst. Be concise and operational.
Given these event reports and computed points, write a 6–8 sentence situation brief:
- hazards, closures, threatened facilities
- immediate safety actions
- newest changes
Plain English.

<eventReports>
${JSON.stringify(events, null, 2)}
</eventReports>

<riskSummary>
${JSON.stringify(meta, null, 2)}, "points": ${countPoints}
</riskSummary>`
      }]
    }]
  };

  const out = await bedrock.send(new InvokeModelCommand({
    modelId: CLAUDE_MODEL, contentType: "application/json", accept: "application/json",
    body: JSON.stringify(prompt)
  }));

  const body = JSON.parse(new TextDecoder().decode(out.body));
  return body?.content?.[0]?.text ?? "";
}

export async function computeImpact(eventReports: any[]) {
  // Build heat points + risk polygons in the repo's "risk.geojson" format.  :contentReference[oaicite:7]{index=7}
  const heatFeatures: any[] = [];
  const riskFeatures: any[] = [];

  for (let i = 0; i < eventReports.length; i++) {
    const ev = eventReports[i];
    // If your feed already includes coordinates, skip geocoding and use them; else geocode.
    const { lon, lat } = await geocode(ev.address);

    // heat point
    heatFeatures.push({
      type: "Feature",
      properties: { severity: ev.severity, weight: weightFor(ev.severity), id: i },
      geometry: { type: "Point", coordinates: [lon, lat] }
    });

    // risk polygon (same style as web/apps/server/src/db/data/risk.geojson)  :contentReference[oaicite:8]{index=8}
    const radius = radiusKmFor(ev);
    riskFeatures.push({
      type: "Feature",
      properties: {
        id: `event-${String(i + 1).padStart(3, "0")}`,
        event: ev.event,
        severity: ev.severity,
        radius
      },
      geometry: circlePolygon([lon, lat], radius)
    });
  }

  const last = eventReports.at(-1);
  const generated_at = `${last?.date ?? ""}T${(last?.time ?? "00:00")}:00Z`;
  const summary = {
    events: eventReports.length,
    max_severity: eventReports.map(e => e.severity).sort((a,b) =>
      ["Low","Medium","High","Critical"].indexOf(a) - ["Low","Medium","High","Critical"].indexOf(b)
    ).at(-1) ?? "Low"
  };

  const brief = await makeBrief(eventReports, summary, heatFeatures.length);

  return {
    generated_at,
    summary,
    risk: { type: "FeatureCollection" as const, features: riskFeatures },
    heat: { type: "FeatureCollection" as const, features: heatFeatures },
    brief
  };
}
