export const DAY_MAP: Record<string, number> = {
	U: 0, // Sunday
	M: 1, // Monday
	T: 2, // Tuesday
	W: 3, // Wednesday
	R: 4, // Thursday
	F: 5, // Friday
	S: 6, // Saturday
};

// Updated to show the full 7-day week
export const DAYS_HEADER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseTimeRange(timeStr: string) {
	if (!timeStr || timeStr === "TBA") return null;

	const [startRaw, endRaw] = timeStr.split("-").map((s) => s.trim());

	const parseToMinutes = (t: string) => {
		if (!t) return 0;
		const cleanStr = t.toUpperCase();
		const isPM = cleanStr.includes("PM");
		const isAM = cleanStr.includes("AM");

		let hours = 0;
		let minutes = 0;

		if (cleanStr.includes(":")) {
			const parts = cleanStr.replace(/[^\d:]/g, "").split(":");
			hours = parseInt(parts[0] || "0", 10);
			minutes = parseInt(parts[1] || "0", 10);
		} else {
			const nums = cleanStr.replace(/\D/g, "");
			if (nums.length >= 3) {
				hours = parseInt(nums.slice(0, nums.length - 2), 10);
				minutes = parseInt(nums.slice(nums.length - 2), 10);
			}
		}

		if (isPM && hours < 12) hours += 12;
		if (isAM && hours === 12) hours = 0;

		return hours * 60 + minutes;
	};

	return {
		start: parseToMinutes(startRaw),
		end: parseToMinutes(endRaw),
	};
}
