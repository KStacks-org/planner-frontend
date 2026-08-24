import { MoonStar, Sun } from "lucide-react";
import { useRamadanStore } from "@/hooks/use-ramadan-time";
import { Button } from "../ui/button";

export function RamadanToggle() {
	const { isRamadanMode, setRamadanMode } = useRamadanStore();

	return (
		<Button
			variant="outline"
			size="lg"
			aria-pressed={isRamadanMode}
			onClick={() => setRamadanMode(!isRamadanMode)}
		>
			{isRamadanMode ? (
				<>
					<MoonStar className="text-green-600 dark:text-green-400" />
					Ramadan Timing On
				</>
			) : (
				<>
					<Sun className="text-muted-foreground" />
					Standard Timing
				</>
			)}
		</Button>
	);
}
