import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		host: Resource.Postgres.host,
		port: Resource.Postgres.port,
		user: Resource.Postgres.username,
		password: Resource.Postgres.password,
		database: Resource.Postgres.database,
	},
});
