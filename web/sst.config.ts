/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "aws-breaking-barriers-hackathon",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
		};
	},
	async run() {
		const vpc = new sst.aws.Vpc("Vpc", { bastion: true, nat: "ec2" });
		const rds = new sst.aws.Postgres("Postgres", { vpc, proxy: true,
            dev: {
                username: "postgres",
                password: "password",
                database: "postgres",
                port: 5432,
              }
         });

		const server = new sst.aws.Function("server", {
			url: true,
			handler: "apps/server/src/lambda.handler",
			link: [rds],
			vpc,
		});

		const web = new sst.aws.StaticSite("web", {
			path: "apps/web",
			dev: {
				command: "npm run dev"
			},
			build: {
				command: "npm run build",
				output: "dist",
			},
			environment: {
				VITE_SERVER_URL: server.url,
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
