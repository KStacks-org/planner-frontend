import { Separator } from "@/components/ui/separator";

export function KauFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-background mt-auto w-full">
			<Separator />

			<div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
				{/* Brand & Copyright */}
				<div className="flex flex-col items-center md:items-start gap-1">
					<div className="font-bold text-foreground tracking-tight">
						K<span className="text-green-600 dark:text-green-400">Planner</span>
					</div>
					<span>&copy; {currentYear} All rights reserved.</span>
				</div>

				{/* The Quote */}
				<div className="hidden md:block">
					<p className="italic opacity-80">"Made by students, for students"</p>
				</div>

				{/* Mobile Quote */}
				<div className="md:hidden mt-2">
					<p className="italic opacity-80">"Made by students, for students"</p>
				</div>
			</div>
		</footer>
	);
}
