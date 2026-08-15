import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
		}),
		viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		viteReact(),
	],
	server: {
		port: 3000,
		host: true,
		allowedHosts: true,
	},
	build: {
		outDir: "dist",
		sourcemap: false,
	},
});
