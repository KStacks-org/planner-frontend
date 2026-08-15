import { DesktopSchedule } from "./DesktopSchedule";
import { MobileSchedule } from "./MobileSchedule";

export function ScheduleCalendar() {
	return (
		<div className="w-full h-full">
			{/* Desktop View (Grid) - Visible on md and up */}
			<div className="hidden md:block h-full">
				<DesktopSchedule />
			</div>

			{/* Mobile View (Agenda/List) - Visible on sm and down */}
			<div className="block md:hidden h-full overflow-y-auto">
				<MobileSchedule />
			</div>
		</div>
	);
}
