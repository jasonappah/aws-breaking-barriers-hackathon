import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/event-report")({
	component: EventReportRoute,
});

function EventReportRoute() {
	const [formData, setFormData] = useState({
		event: "",
		date: "",
		time: "",
		severity: "",
		sourceOfReport: "",
		structureType: "",
		surroundingLand: "",
		nearbyCriticalFacilities: "",
		weather: "",
		trafficDensity: "",
		roadClosures: "",
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", formData);
		// TODO: Implement form submission logic
	};

	return (
		<div className="mx-auto w-full max-w-2xl py-10">
			<Card>
				<CardHeader>
					<CardTitle>Event Report</CardTitle>
					<CardDescription>
						Report infrastructure events and incidents for monitoring and response
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Event Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Event Information</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="event">Event Description *</Label>
									<Input
										id="event"
										value={formData.event}
										onChange={(e) => handleInputChange("event", e.target.value)}
										placeholder="Describe the event or incident"
										required
									/>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="severity">Severity Level *</Label>
									<Input
										id="severity"
										value={formData.severity}
										onChange={(e) => handleInputChange("severity", e.target.value)}
										placeholder="Low, Medium, High, Critical"
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="date">Date *</Label>
									<Input
										id="date"
										type="date"
										value={formData.date}
										onChange={(e) => handleInputChange("date", e.target.value)}
										required
									/>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="time">Time *</Label>
									<Input
										id="time"
										type="time"
										value={formData.time}
										onChange={(e) => handleInputChange("time", e.target.value)}
										required
									/>
								</div>
							</div>
						</div>

						{/* Source and Location Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Source and Location</h3>
							
							<div className="space-y-2">
								<Label htmlFor="sourceOfReport">Source of Report *</Label>
								<Input
									id="sourceOfReport"
									value={formData.sourceOfReport}
									onChange={(e) => handleInputChange("sourceOfReport", e.target.value)}
									placeholder="Who reported this event (e.g., citizen, emergency services, sensor)"
									required
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="structureType">Structure Type</Label>
									<Input
										id="structureType"
										value={formData.structureType}
										onChange={(e) => handleInputChange("structureType", e.target.value)}
										placeholder="Bridge, road, building, etc."
									/>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="surroundingLand">Surrounding Land</Label>
									<Input
										id="surroundingLand"
										value={formData.surroundingLand}
										onChange={(e) => handleInputChange("surroundingLand", e.target.value)}
										placeholder="Urban, rural, industrial, residential"
									/>
								</div>
							</div>
						</div>

						{/* Critical Facilities and Environment */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Critical Facilities and Environment</h3>
							
							<div className="space-y-2">
								<Label htmlFor="nearbyCriticalFacilities">Nearby Critical Facilities</Label>
								<Input
									id="nearbyCriticalFacilities"
									value={formData.nearbyCriticalFacilities}
									onChange={(e) => handleInputChange("nearbyCriticalFacilities", e.target.value)}
									placeholder="Hospitals, schools, fire stations, etc."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="weather">Weather Conditions</Label>
								<Input
									id="weather"
									value={formData.weather}
									onChange={(e) => handleInputChange("weather", e.target.value)}
									placeholder="Clear, rain, snow, fog, etc."
								/>
							</div>
						</div>

						{/* Traffic and Road Conditions */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Traffic and Road Conditions</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="trafficDensity">Traffic Density</Label>
									<Input
										id="trafficDensity"
										value={formData.trafficDensity}
										onChange={(e) => handleInputChange("trafficDensity", e.target.value)}
										placeholder="Light, moderate, heavy, gridlock"
									/>
								</div>
								
								<div className="space-y-2">
									<Label htmlFor="roadClosures">Road Closures</Label>
									<Input
										id="roadClosures"
										value={formData.roadClosures}
										onChange={(e) => handleInputChange("roadClosures", e.target.value)}
										placeholder="None, partial, full closure"
									/>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end space-x-4 pt-6">
							<Button type="button" variant="outline">
								Clear Form
							</Button>
							<Button type="submit">
								Submit Report
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
