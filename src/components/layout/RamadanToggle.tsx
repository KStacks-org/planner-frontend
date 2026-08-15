import { useRamadanStore } from "@/hooks/use-ramadan-time";
import { Button } from "../ui/button";

export function RamadanToggle() {
	const { isRamadanMode, setRamadanMode } = useRamadanStore();

	return (
		<Button variant="outline" onClick={() => setRamadanMode(!isRamadanMode)}>
			{isRamadanMode ? "🌙 Ramadan Timing On" : "☀️ Standard Timing"}
		</Button>
	);
}
