import { pgTable, text, integer, doublePrecision } from "drizzle-orm/pg-core";

// Sites table
export const site = pgTable("site", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name"),
    address: text("address"),

    // Location
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
});

export type Site = typeof site.$inferSelect;
export type NewSite = typeof site.$inferInsert;



