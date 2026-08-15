import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BootGate } from "@/components/providers/BootGate";
import { Toaster } from "@/components/ui/sonner";
import { router } from "./router";
import "./styles.css";

const queryClient = new QueryClient();

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

createRoot(rootEl).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system" storageKey="kplanner-ui-theme">
				<BootGate>
					<RouterProvider router={router} />
				</BootGate>
				<Toaster position="bottom-right" richColors />
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>,
);
