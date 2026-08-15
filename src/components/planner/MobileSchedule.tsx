import { useState, Fragment } from "react";
import { DAYS_HEADER } from "@/lib/schedule-utils";
import {
  Calendar as CalendarIcon,
  Moon,
  Clock,
  MapPin,
  User,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseHue } from "@/lib/get-course-hue";
import { useRamadanTime } from "@/hooks/use-ramadan-time";
import { EventDetailDialog } from "./EventDetailDialog";
import {
  useScheduleData,
  formatBreakTime,
  getDayTimeRange,
} from "@/lib/use-schedule-data";
import type { Course, Schedule } from "@/types";

export function MobileSchedule() {
  const { isRamadanMode } = useRamadanTime();
  const { scheduleByDay, selectedCourses } = useScheduleData();

  const [selectedEvent, setSelectedEvent] = useState<{
    course: Course;
    schedule: Schedule;
  } | null>(null);

  const todayIndex = new Date().getDay();

  if (selectedCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 min-h-60 border border-dashed border-border bg-muted/10">
        <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="font-semibold text-lg text-foreground">
          Your schedule is empty
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Add courses to see your daily agenda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {DAYS_HEADER.map((day, dayIndex) => {
        const dayEvents = scheduleByDay[dayIndex];
        if (!dayEvents || dayEvents.length === 0) return null;

        const timeRangeStr = getDayTimeRange(dayEvents);
        const isToday = dayIndex === todayIndex;

        return (
          <div
            key={day}
            className={cn(
              "flex flex-col bg-card border shadow-sm overflow-hidden",
              isToday && "ring-2 ring-primary/30",
            )}
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur z-10 px-4 py-3 border-b flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-bold text-lg uppercase tracking-wider",
                      isToday ? "text-primary" : "text-foreground",
                    )}
                  >
                    {day}
                  </h3>
                  {isToday && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5">
                      TODAY
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
                  {timeRangeStr}
                </span>
              </div>
              {isRamadanMode && (
                <Moon className="h-5 w-5 text-amber-500 fill-amber-500/20" />
              )}
            </div>

            <div className="flex flex-col p-3 gap-2.5 bg-muted/5">
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
                      <div className="flex items-center justify-center gap-2 py-2 my-0.5 border-2 border-dashed border-muted bg-muted/20 text-muted-foreground/60">
                        <Coffee className="h-3 w-3" />
                        <span className="font-bold text-[10px] uppercase tracking-wider">
                          Break
                        </span>
                        <span className="text-[10px] font-medium bg-background/50 px-1.5 py-0.5">
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
                        "relative w-full p-3.5 border shadow-sm cursor-pointer transition-colors active:scale-[0.98]",
                        "bg-[hsla(var(--course-hue),85%,60%,0.10)]",
                        "border-[hsla(var(--course-hue),70%,45%,0.3)] dark:border-[hsla(var(--course-hue),70%,60%,0.3)]",
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground leading-tight text-sm">
                            {event.course.courseCode}{" "}
                            {event.course.courseNumber}
                          </h4>
                          <p className="text-[11px] font-medium text-foreground/60 mt-0.5 line-clamp-1">
                            {event.course.title}
                          </p>
                        </div>
                        <span className="font-bold text-[10px] bg-background/50 px-1.5 py-0.5 border shrink-0 ml-2">
                          {event.course.section}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {isRamadanMode ? (
                            <Moon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="font-medium text-xs">
                            {event.schedule.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[11px] truncate">
                              {event.schedule.room || "TBA"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="text-[10px] truncate max-w-24">
                              {event.schedule.instructor || "Staff"}
                            </span>
                          </div>
                        </div>
                      </div>
                      </div>
                    {breakElement}
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      })}

      <EventDetailDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}