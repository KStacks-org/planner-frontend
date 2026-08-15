import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RamadanStore {
	isRamadanMode: boolean;
	setRamadanMode: (val: boolean) => void;
}

export const useRamadanStore = create<RamadanStore>()(
	persist(
		(set) => ({
			isRamadanMode: false,
			setRamadanMode: (val) => set({ isRamadanMode: val }),
		}),
		{ name: "ramadan-storage" },
	),
);

const RAMADAN_MAPPING: Record<string, string> = {
	"08:00": "10:00",
	"08:30": "10:20",
	"09:00": "10:40",
	"09:30": "11:00",
	"10:00": "11:20",
	"10:30": "11:40",
	"11:00": "12:00",
	"11:30": "12:50",
	"12:00": "13:10",
	"12:30": "13:30",
	"13:00": "13:50",
	"13:30": "14:10",
	"14:00": "14:30",
	"14:30": "14:50",
	"15:00": "15:10",
	"15:30": "16:10",
	"16:00": "16:30",
	"16:30": "21:40",
	"17:00": "22:00",
	"17:30": "22:20",
	"18:00": "22:40",
	"18:30": "23:00",
	"19:00": "23:20",
	"19:30": "23:40",
	"20:00": "00:00",
	"20:30": "00:20",
	"21:00": "00:40",
	"21:30": "01:00",
	"22:00": "01:20",
	"22:30": "01:40",
	"23:00": "02:00",
	"23:30": "02:20",
};

export function useRamadanTime() {
	const isRamadanMode = useRamadanStore((state) => state.isRamadanMode);

	// Helper to handle both "13:00" and "1:00 PM"
	const parseTimeToMins = (timeStr: string) => {
		const cleanStr = timeStr.trim().toUpperCase();
		const isPM = cleanStr.includes("PM");
		const isAM = cleanStr.includes("AM");

		let [hours, minutes] = cleanStr
			.replace(/(AM|PM)/, "")
			.split(":")
			.map(Number);

		if (isNaN(hours) || isNaN(minutes)) return 0;

		if (isPM && hours < 12) hours += 12;
		if (isAM && hours === 12) hours = 0;

		return hours * 60 + minutes;
	};

	const minsToTime = (m: number) => {
		const h = Math.floor((m % 1440) / 60);
		const mins = m % 60;
		const ampm = h >= 12 ? "PM" : "AM";
		const displayH = h % 12 || 12;
		return `${displayH}:${mins.toString().padStart(2, "0")} ${ampm}`;
	};

	const formatRamadanTime = (timeRange: string) => {
		if (!isRamadanMode || !timeRange.includes("-")) return timeRange;

		const [startRaw, endRaw] = timeRange.split("-").map((s) => s.trim());

		// Normalize start time to 24h for lookup (e.g., "8:00 PM" -> "20:00")
		const startMins = parseTimeToMins(startRaw);
		const startKey = `${Math.floor(startMins / 60)
			.toString()
			.padStart(2, "0")}:${(startMins % 60).toString().padStart(2, "0")}`;

		const ramadanStartKey = RAMADAN_MAPPING[startKey] || startKey;
		const ramadanStartMins = parseTimeToMins(ramadanStartKey);

		// Duration calculation
		const endMins = parseTimeToMins(endRaw);
		let duration = endMins - startMins;
		if (duration < 0) duration += 1440; // Handle midnight wraps

		let ramadanDuration: number;
		if (duration === 50) ramadanDuration = 35;
		else if (duration === 100) ramadanDuration = 70;
		else ramadanDuration = Math.round(duration * 0.7);

		return `${minsToTime(ramadanStartMins)} - ${minsToTime(ramadanStartMins + ramadanDuration)}`;
	};

	return { isRamadanMode, formatRamadanTime };
}
