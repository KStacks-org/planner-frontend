import { useState, Fragment } from "react";
import { useScheduleStore } from "@/lib/schedule-store";
import { DAYS_HEADER } from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Moon,
  Clock,
  MapPin,
  BookOpen,
  Coffee,
} from "lucide-react";
import { getCourseHue } from "@/lib/get-course-hue";
import { useRamadanTime } from "@/hooks/use-ramadan-time";
import { EventDetailDialog } from "./EventDetailDialog";
import {
  useScheduleData,
  formatBreakTime,
  getDayTimeRange,
} from "@/lib/use-schedule-data";
import type { Course, Schedule } from "@/types";

export function DesktopSchedule() {
  const selectedCourses = useScheduleStore((s) => s.getActiveCourses());
  const { isRamadanMode } = useRamadanTime();
  const { scheduleByDay } = useScheduleData(5);

  const [selectedEvent, setSelectedEvent] = useState<{
    course: Course;
    schedule: Schedule;
  } | null>(null);

  if (selectedCourses.length === 0) {
    return (
      <div className="h-full w-full border border-dashed border-muted-foreground/25 bg-muted/10 flex flex-col items-center justify-center text-center p-8">
        <div className="bg-background p-4 mb-4 shadow-sm border border-border">
          <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="font-semibold text-lg text-foreground">
          Your schedule is empty
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Click &quot;Add Course&quot; to start building your schedule
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-background border border-border w-full shadow-sm overflow-hidden mb-12">
        {/* HEADER ROW */}
        <div className="flex border-b border-border bg-muted/20 shrink-0 z-10 min-h-14">
          <div className="w-12 border-r border-border flex items-center justify-center">
            {isRamadanMode && (
              <Moon className="h-5 w-5 text-amber-500 fill-amber-500/20" />
            )}
          </div>
          <div className="flex-1 grid grid-cols-5 divide-x divide-border">
            {DAYS_HEADER.slice(0, 5).map((day, dayIndex) => {
              const dayEvents = scheduleByDay[dayIndex];
              const timeRangeStr = dayEvents?.length
                ? getDayTimeRange(dayEvents)
                : "";

              return (
                <div
                  key={day}
                  className="flex flex-col items-center justify-center py-2"
                >
                  <span className="font-bold text-sm text-foreground uppercase tracking-wider leading-none">
                    {day}
                  </span>
                  {timeRangeStr && (
                    <span className="text-[10px] text-muted-foreground font-medium mt-1">
                      {timeRangeStr}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNS BODY */}
        <div className="flex-1 flex bg-muted/5 overflow-auto">
          <div className="w-12 border-r border-border shrink-0 bg-background/50" />

          <div className="flex-1 grid grid-cols-5 divide-x divide-border">
            {scheduleByDay.map((dayEvents, i) => (
              <div key={i} className="flex flex-col gap-3 p-3 h-full">
                {dayEvents.map((event, idx) => {
                  const hue = getCourseHue(
                    event.course.courseCode,
                    event.course.courseNumber,
                  );

                  let breakElement = null;
                  if (idx < dayEvents.length - 1) {
                    const nextEvent = dayEvents[idx + 1];
                    const gapMins = nextEvent.startVal - event.endVal;

                    if (gapMins > 15) {
                      breakElement = (
                        <div className="flex flex-col items-center justify-center py-4 my-1 border-2 border-dashed border-muted bg-muted/30 text-muted-foreground/70">
                          <div className="flex items-center gap-2 mb-1">
                            <Coffee className="h-3 w-3" />
                            <span className="font-bold tracking-widest text-xs uppercase">
                              Break
                            </span>
                          </div>
                          <span className="text-[10px] font-medium opacity-80 bg-background/50 px-2 py-0.5">
                            {formatBreakTime(gapMins)}
                          </span>
                        </div>
                      );
                    }
                  }

                  return (
                    <Fragment key={`${event.course.crn}-${idx}`}>
                      <div
                        onClick={() => setSelectedEvent(event)}
                        style={
                          { "--course-hue": hue } as React.CSSProperties
                        }
                        className={cn(
                          "relative w-full p-3 border shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group",
                          "bg-[hsla(var(--course-hue),85%,60%,0.12)] hover:bg-[hsla(var(--course-hue),85%,60%,0.18)]",
                          "border-[hsla(var(--course-hue),70%,45%,0.3)] dark:border-[hsla(var(--course-hue),70%,60%,0.3)]",
                          "text-[hsl(var(--course-hue),80%,35%)] dark:text-[hsl(var(--course-hue),85%,80%)]",
                        )}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <span
                            title={event.course.title}
                            className="font-bold text-xs truncate"
                          >
                            {event.course.courseCode}{" "}
                            {event.course.courseNumber}
                          </span>
                          <span className="font-bold text-[10px] bg-background/50 px-1.5 py-0.5 shadow-sm">
                            {event.course.section}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] opacity-80 truncate">
                            <BookOpen className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {event.course.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
                            {isRamadanMode ? (
                              <Moon className="h-3 w-3 shrink-0" />
                            ) : (
                              <Clock className="h-3 w-3 shrink-0" />
                            )}
                            <span>{event.schedule.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] opacity-80 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {event.schedule.room || "TBA"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {breakElement}
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventDetailDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}