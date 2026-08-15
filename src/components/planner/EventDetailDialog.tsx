import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, BookOpen, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course, Schedule } from "@/types";
import { useRamadanTime } from "@/hooks/use-ramadan-time";

interface EventDetailDialogProps {
  event: { course: Course; schedule: Schedule } | null;
  onClose: () => void;
}

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const { isRamadanMode, formatRamadanTime } = useRamadanTime();

  if (!event) return null;

  const displayTime = formatRamadanTime(event.schedule.time);

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.course.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="font-mono text-xs">
              {event.course.courseCode} {event.course.courseNumber}
            </Badge>
            {event.course.section && (
              <Badge variant="secondary" className="text-xs">
                Section {event.course.section}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {event.course.credits} Credits
            </Badge>
            {isRamadanMode && (
              <Badge className="bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 gap-1 text-xs">
                <Moon className="h-3 w-3" /> Ramadan Timing
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="grid gap-0.5">
              <span className="font-medium text-sm">Instructor</span>
              <span className="text-sm text-muted-foreground">
                {event.schedule.instructor || "Staff"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {isRamadanMode ? (
              <Moon className="h-5 w-5 text-amber-500 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="grid gap-0.5">
              <span className="font-medium text-sm">Time & Days</span>
              <span
                className={cn(
                  "text-sm",
                  isRamadanMode
                    ? "text-amber-600 dark:text-amber-400 font-medium"
                    : "text-muted-foreground",
                )}
              >
                {displayTime} ({event.schedule.days})
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="grid gap-0.5">
              <span className="font-medium text-sm">Location</span>
              <span className="text-sm text-muted-foreground">
                {event.schedule.room || "TBA"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="grid gap-0.5">
              <span className="font-medium text-sm">CRN</span>
              <span className="text-sm text-muted-foreground font-mono">
                {event.course.crn}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
