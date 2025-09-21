import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, BookOpen, Gavel, MapPin, Search, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/research-site/$siteId")({
	component: ResearcherRouteComponent,
});

type EnvironmentType = "urban" | "suburban" | "rural";
type GridAccess = "yes" | "no" | "unknown";
type PowerService = "single" | "three" | "unknown";

export function ResearcherRouteComponent() {
	// Site is created from Infra modal; focus on research inputs here
	const [environment, setEnvironment] = useState<EnvironmentType>("urban");
	const [targetHeight, setTargetHeight] = useState<string>("45");
	const [issueQuery, setIssueQuery] = useState("cellular outages, dropped calls, coverage complaints");
    const [gridAccess, setGridAccess] = useState<GridAccess>("unknown");
	const [powerDistanceMeters, setPowerDistanceMeters] = useState<string>("");
    const [serviceType, setServiceType] = useState<PowerService>("unknown");
	const [generatorKw, setGeneratorKw] = useState<string>("");
	const [batteryHours, setBatteryHours] = useState<string>("");

	const suggestions = useMemo(() => {
		const heightNum = Number.parseFloat(targetHeight || "0");
		const common = [
			{
				type: "Monopole",
				rationale:
					"Fast to deploy, small footprint. Works for most sites at moderate heights.",
				score: environment === "suburban" ? 0.9 : environment === "urban" ? 0.8 : 0.85,
				heightFit: heightNum <= 50,
			},
			{
				type: "Rooftop Small Cell / 5G",
				rationale:
					"Great for dense areas and traffic corridors. Minimal zoning friction.",
				score: environment === "urban" ? 0.95 : environment === "suburban" ? 0.75 : 0.4,
				heightFit: heightNum <= 25,
			},
		]

		const rural = [
			{
				type: "Lattice Tower",
				rationale: "High elevation, multi-tenant capacity and excellent structural loading.",
				score: 0.9,
				heightFit: heightNum >= 60,
			},
			{
				type: "Guyed Tower",
				rationale: "Lowest cost per height for very tall rural deployments.",
				score: 0.8,
				heightFit: heightNum >= 90,
			},
		]

		const suburban = [
			{
				type: "Monopine / Concealed Monopole",
				rationale: "Blends with environment; easier community acceptance in residential areas.",
				score: 0.88,
				heightFit: heightNum <= 55,
			},
			{
				type: "Light Pole Small Cell",
				rationale: "Targeted capacity for corridors and campuses with power nearby.",
				score: 0.8,
				heightFit: heightNum <= 20,
			},
		]

		const urban = [
			{
				type: "Distributed Antenna System (DAS)",
				rationale: "Indoor venues and dense districts; excellent for emergency reliability.",
				score: 0.92,
				heightFit: true,
			},
			{
				type: "Rooftop Macro (Slimline)",
				rationale: "Use existing buildings to reach above clutter without ground lease.",
				score: 0.87,
				heightFit: heightNum <= 60,
			},
		]

		const envPick = environment === "rural" ? rural : environment === "suburban" ? suburban : urban;
		return [...envPick, ...common]
			.filter((s) => s.heightFit)
			.sort((a, b) => b.score - a.score)
			.slice(0, 4);
	}, [environment, targetHeight]);

	return (
		<div className="h-full grid grid-cols-[320px_1fr_360px]">
			<aside className="border-r p-3 overflow-y-auto">
				<div className="sticky top-0 bg-background z-10 pb-3">
					<h2 className="text-base font-semibold flex items-center gap-2"><Search className="h-4 w-4" />Research inputs</h2>
				</div>

				<div className="grid gap-3 text-sm text-muted-foreground">
					<p>To create a new site, open Infra and use the plus button. This page is for researching an existing site.</p>
				</div>
			</aside>

			<main className="p-3 overflow-y-auto">
				<div className="grid gap-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Proposed tower type suggestions</CardTitle>
							<CardDescription>Based on environment and target height</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2">
								{suggestions.map((s) => (
									<div key={s.type} className="rounded border p-3">
										<div className="flex items-center justify-between">
											<div className="font-medium">{s.type}</div>
											<div className="text-xs text-muted-foreground">score {(Math.round(s.score * 100))}/100</div>
										</div>
										<p className="text-sm text-muted-foreground mt-1">{s.rationale}</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4" />Power on site</CardTitle>
							<CardDescription>Availability, service type, and backup readiness</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								<div className="grid grid-cols-3 gap-2 items-end">
									<div>
										<div className="text-sm font-medium">Grid access</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" className="w-full justify-between">
													<span className="capitalize">{gridAccess === "yes" ? "available" : gridAccess === "no" ? "not available" : "unknown"}</span>
													<span aria-hidden>▾</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-[220px]">
												<DropdownMenuRadioGroup value={gridAccess} onValueChange={(v) => setGridAccess(v as GridAccess)}>
													<DropdownMenuRadioItem value="yes">Available</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="no">Not available</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="unknown">Unknown</DropdownMenuRadioItem>
												</DropdownMenuRadioGroup>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<div>
										<Label htmlFor="power-distance">Distance to nearest power (m)</Label>
										<Input id="power-distance" type="number" min="0" value={powerDistanceMeters} onChange={(e) => setPowerDistanceMeters(e.target.value)} />
									</div>
									<div>
										<div className="text-sm font-medium">Service type</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" className="w-full justify-between">
													<span className="capitalize">{serviceType === "single" ? "single-phase" : serviceType === "three" ? "three-phase" : "unknown"}</span>
													<span aria-hidden>▾</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-[220px]">
												<DropdownMenuRadioGroup value={serviceType} onValueChange={(v) => setServiceType(v as PowerService)}>
													<DropdownMenuRadioItem value="single">Single-phase</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="three">Three-phase</DropdownMenuRadioItem>
													<DropdownMenuRadioItem value="unknown">Unknown</DropdownMenuRadioItem>
												</DropdownMenuRadioGroup>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<div>
										<Label htmlFor="gen-kw">Backup generator size (kW)</Label>
										<Input id="gen-kw" type="number" min="0" value={generatorKw} onChange={(e) => setGeneratorKw(e.target.value)} />
									</div>
									<div>
										<Label htmlFor="battery-hours">Battery backup target (hours)</Label>
										<Input id="battery-hours" type="number" min="0" value={batteryHours} onChange={(e) => setBatteryHours(e.target.value)} />
									</div>
								</div>

								<div className="text-xs text-muted-foreground">Use this to coordinate with utilities on service drops and plan resilience.</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><Gavel className="h-4 w-4" />Zoning and permitting checklist</CardTitle>
							<CardDescription>Quick links and items to validate</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="list-disc pl-5 text-sm space-y-1">
								<li>Confirm land use and height limits in local zoning code</li>
								<li>FAA 7460-1 filing if structure exceeds obstruction thresholds</li>
								<li>FCC Antenna Structure Registration (ASR) applicability</li>
								<li>NEPA/SHPO review for environmental and historic impact</li>
								<li>Lease, access, power and fiber backhaul feasibility</li>
							</ul>
							<div className="mt-2 text-xs text-muted-foreground">Links are placeholders; integrate data sources later.</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Regional cellular issues</CardTitle>
							<CardDescription>Scan forums, crowdsourced maps, and outage reports</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-2">
								<Label htmlFor="issues">Query</Label>
								<div className="flex gap-2">
									<Input id="issues" value={issueQuery} onChange={(e) => setIssueQuery(e.target.value)} />
									<Button variant="outline"><Search className="h-4 w-4 mr-1" />Run check</Button>
								</div>
								<div className="rounded border p-3 text-sm text-muted-foreground">Results will appear here. Hook to APIs like Ookla, CellMapper, OpenCellID, social media, and local news.</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>

			<aside className="border-l p-3 overflow-y-auto">
				<div className="sticky top-0 bg-background z-10 pb-3">
					<h2 className="text-base font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Community considerations</h2>
				</div>
				<div className="grid gap-2 text-sm">
					<div className="flex items-center gap-2">
						<Checkbox id="c-proximity" />
						<Label htmlFor="c-proximity">Proximity to schools and hospitals</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id="c-historic" />
						<Label htmlFor="c-historic">Historic or scenic districts nearby</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id="c-visual" />
						<Label htmlFor="c-visual">Visual impact mitigation (concealment)</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id="c-noise" />
						<Label htmlFor="c-noise">Noise and construction windows</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id="c-backhaul" />
						<Label htmlFor="c-backhaul">Alternate uplinks (fiber, microwave LOS)</Label>
					</div>
					<hr />
					<div className="text-xs text-muted-foreground">Use this checklist during acquisition calls and public meetings.</div>
				</div>
			</aside>
		</div>
	)
}


