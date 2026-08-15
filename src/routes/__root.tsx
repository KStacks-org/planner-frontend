import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BootGate } from "@/components/providers/BootGate";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "KPlanner - Build Your KAU Schedule",
			},
			{
				name: "description",
				content:
					"Plan your King Abdulaziz University schedule visually. Add courses, spot conflicts, and export your timetable in one place.",
			},
			{
				name: "theme-color",
				content: "#ffffff",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "icon",
				sizes: "any",
				href: "/favicon.ico",
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="system" storageKey="kplanner-ui-theme">
					<BootGate>
						{import.meta.env.VITE_IN_DEVELOPMENT != "yes" ? (
							children
						) : (
							<div className="flex items-center justify-center h-screen w-full">
								<p className="text-black dark:text-white text-center">
									This website is under development, thank you for your
									patience.
								</p>
							</div>
						)}
					</BootGate>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
