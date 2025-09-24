import type { Site } from "../../../server/src/db/schema/sites";

export const dummySites: Site[] = [
    {
        id: 1,
        name: "NTC Switch",
        address: "123 Main St",
        latitude: 37.7749,
        longitude: -122.4194,
    },
    {
        id: 2,
        name: "Northwind Data Center",
        address: "456 Oak Ave",
        latitude: 34.0522,
        longitude: -118.2437,
    },
    {
        id: 3,
        name: "Riverside Pumping Station",
        address: "789 Pine Rd",
        latitude: 40.7128,
        longitude: -74.0060,
    },
    {
        id: 4,
        name: "Central Grid Substation",
        address: "321 Maple St",
        latitude: 41.8781,
        longitude: -87.6298,
    },
    {
        id: 5,
        name: "Lakeside Water Treatment Plant",
        address: "654 Cedar Blvd",
        latitude: 29.7604,
        longitude: -95.3698,
    },
    {
        id: 6,
        name: "Summit Communications Tower",
        address: "987 Birch Ln",
        latitude: 47.6062,
        longitude: -122.3321,
    },
    {
        id: 7,
        name: "Greenfield Solar Farm",
        address: "246 Spruce Dr",
        latitude: 39.7392,
        longitude: -104.9903,
    },
    {
        id: 8,
        name: "Harbor Logistics Hub",
        address: "135 Elm Ct",
        latitude: 32.7767,
        longitude: -96.7970,
    },
    {
        id: 9,
        name: "Metro Transit Depot",
        address: "864 Willow Way",
        latitude: 33.4484,
        longitude: -112.0740,
    },
];

export default dummySites;


