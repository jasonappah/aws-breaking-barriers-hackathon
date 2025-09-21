/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
	app(input) {
		return {
			name: "aws-breaking-barriers-hackathon",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: { cloudflare: "6.9.1" },
		};
	},
	async run() {
		const router = new sst.aws.Router("MyRouter", {
			domain: {
				name: "swarm.jasonaa.me",
				aliases: ["*.swarm.jasonaa.me"],
				dns: sst.cloudflare.dns(),
                cert: "arn:aws:acm:us-east-1:748325219098:certificate/e8761621-1692-4b35-ba37-8dc66c0dfe46"
			},
		});
		const vpc = new sst.aws.Vpc("Vpc", { bastion: true, nat: "ec2" });
		const rds = new sst.aws.Postgres("Postgres", {
			vpc,
			proxy: true,
			dev: {
				username: "postgres",
				password: "password",
				database: "postgres",
				port: 5432,
			},
		});
		const server = new sst.aws.Function("server", {
			url: {
				router: {
					instance: router,
					domain: "api.swarm.jasonaa.me",
				},
			},
			handler: "apps/server/src/lambda.handler",
			link: [rds],
			vpc,
		});
		// const mapboxToken = new sst.Secret("MapBoxToken");
		const web = new sst.aws.StaticSite("web", {
			path: "apps/web",
			dev: {
				command: "npm run dev",
			},
			build: {
				command: "npm run build",
				output: "dist",
			},
			router: {
				instance: router,
				domain: "swarm.jasonaa.me",
			},
			environment: {
				VITE_SERVER_URL: server.url,
				// VITE_MAPBOX_TOKEN: new sst.Secret("MapBoxToken").value,
			},
		});
		new sst.x.DevCommand("Studio", {
			link: [rds],
			dev: {
				command: "npx drizzle-kit studio",
			},
		});
	},
});
