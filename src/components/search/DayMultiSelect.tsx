import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const daysList = [
	{ value: "U", label: "Sunday (U)" },
	{ value: "M", label: "Monday (M)" },
	{ value: "T", label: "Tuesday (T)" },
	{ value: "W", label: "Wednesday (W)" },
	{ value: "R", label: "Thursday (R)" },
	{ value: "F", label: "Friday (F)" },
	{ value: "S", label: "Saturday (S)" },
];

const dayOrder = "MTWRFSU";

export function DayMultiSelect({
	value = "",
	onChange,
}: {
	value: string;
	onChange: (val: string) => void;
}) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = (dayValue: string) => {
		// Check if the letter is already in the string
		if (value.includes(dayValue)) {
			// Remove it
			onChange(value.replace(dayValue, ""));
		} else {
			// Add it (Backend will handle the sorting)
			onChange(value + dayValue);
		}
	};

	let daysDisplay = value
		.split("")
		.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
		.join("");

	return (
		<div className="space-y-1.5">
			<Label className="text-xs font-medium text-muted-foreground">Day</Label>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="h-9 w-full justify-between px-3 font-normal"
					>
						<span className="truncate">
							{value.length > 0 ? daysDisplay : "Any day"}
						</span>
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandList>
							<CommandGroup>
								{daysList.map((day) => {
									const isSelected = value.includes(day.value);
									return (
										<CommandItem
											key={day.value}
											onSelect={() => handleSelect(day.value)}
										>
											<div
												className={cn(
													"mr-2 flex h-4 w-4 items-center justify-center border border-primary",
													isSelected
														? "bg-primary text-primary-foreground"
														: "opacity-50 [&_svg]:invisible",
												)}
											>
												<Check className="h-4 w-4" />
											</div>
											<span>{day.label}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
