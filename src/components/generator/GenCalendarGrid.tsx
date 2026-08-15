import { useMemo, useState } from "react";
import { useGeneratorStore } from "@/lib/generator-store";
import { getCourseHue } from "@/lib/get-course-hue";
import { cn } from "@/lib/utils";
import { GenSectionDetails } from "./GenSectionDetails";
import { SearchX, Loader2, Sparkles } from "lucide-react";
import type { GenScheduledCourse } from "@/lib/generator-types";

const DAYS = [
  { key: "U", label: "Sun" },
  { key: "M", label: "Mon" },
  { key: "T", label: "Tue" },
  { key: "W", label: "Wed" },
  { key: "R", label: "Thu" },
];

function isOnline(room: string) {
  return !!room && (room.includes("Blackboard") || room.toLowerCase().includes("online"));
}

export function GenCalendarGrid() {
  const { generatedData, currentScheduleIndex, loadingGenerate, error } = useGeneratorStore();
  const [selected, setSelected] = useState<GenScheduledCourse | null>(null);

  const schedule = useMemo(() => {
    if (!generatedData || !generatedData.data[currentScheduleIndex]) return null;
    return generatedData.data[currentScheduleIndex];
  }, [generatedData, currentScheduleIndex]);

  const events = useMemo(() => {
    if (!schedule) return [];
    return schedule.courses.flatMap((course) =>
      course.schedules.flatMap((s) =>
        s.days.split("").map((day) => ({
          course,
          session: s,
          day,
        })),
      ),
    );
  }, [schedule]);

  const bounds = useMemo(() => {
    if (events.length === 0) return { start: 8 * 60, end: 17 * 60 };
    let min = Infinity;
    let max = -Infinity;
    for (const ev of events) {
      if (ev.session.startMinutes < min) min = ev.session.startMinutes;
      if (ev.session.endMinutes > max) max = ev.session.endMinutes;
    }
    let startHour = Math.floor(min / 60);
    let endHour = Math.ceil(max / 60);
    if (startHour > 0) startHour -= 1;
    if (endHour < 23) endHour += 1;
    while (endHour - startHour < 8) {
      if (endHour + 1 <= 23) endHour += 1;
      else if (startHour - 1 >= 0) startHour -= 1;
      else break;
    }
    return { start: startHour * 60, end: endHour * 60 };
  }, [events]);

  if (loadingGenerate && !schedule) {
    return (
      <Empty>
        <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-3" />
        <p className="font-medium">Looking for the best schedules…</p>
      </Empty>
    );
  }

  if (error) {
    return (
      <Empty destructive>
        <p className="font-semibold">Something went wrong</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Verify your selections and try again.
        </p>
      </Empty>
    );
  }

  if (generatedData && generatedData.data.length === 0) {
    return (
      <Empty>
        <div className="bg-muted p-3 mb-3">
          <SearchX className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-base">No schedules match your filters</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Try loosening constraints — fewer off-days or a wider time range.
        </p>
      </Empty>
    );
  }

  if (!schedule) {
    return (
      <Empty>
        <div className="bg-primary/10 text-primary p-3 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="font-semibold text-base">Ready to plan</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Pick your courses, set filters, then generate to see the best matches.
        </p>
      </Empty>
    );
  }

  const totalMins = bounds.end - bounds.start;
  const hourCount = Math.ceil(totalMins / 60);

  return (
    <>
      <div className="flex-1 min-h-0 bg-background border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="min-w-[720px] flex flex-col" style={{ height: `${totalMins * 1.6}px` }}>
            {/* Header row */}
            <div className="grid grid-cols-[64px_repeat(5,1fr)] border-b border-border bg-muted/30 sticky top-0 z-20">
              <div className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-r border-border">
                Time
              </div>
              {DAYS.map((d) => (
                <div
                  key={d.key}
                  className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider border-r border-border last:border-r-0"
                >
                  {d.label}
                </div>
              ))}
            </div>

            {/* Grid body */}
            <div className="relative flex-1">
              <div className="grid grid-cols-[64px_repeat(5,1fr)] h-full">
                {/* Time column */}
                <div className="relative border-r border-border bg-background/50">
                  {Array.from({ length: hourCount + 1 }).map((_, i) => {
                    const h = Math.floor(bounds.start / 60) + i;
                    const label = h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`;
                    return (
                      <div
                        key={i}
                        className="absolute w-full pr-2 text-right text-[10px] text-muted-foreground -mt-2"
                        style={{ top: `${(i / hourCount) * 100}%` }}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Day columns */}
                {DAYS.map((d) => (
                  <div key={d.key} className="relative border-r border-border last:border-r-0">
                    {Array.from({ length: hourCount }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full border-b border-border/40"
                        style={{ top: `${((i + 1) / hourCount) * 100}%` }}
                      />
                    ))}
                    {events
                      .filter((e) => e.day === d.key)
                      .map((e, idx) => {
                        const top = ((e.session.startMinutes - bounds.start) / totalMins) * 100;
                        const height =
                          ((e.session.endMinutes - e.session.startMinutes) / totalMins) * 100;
                        const hue = getCourseHue(e.course.subject, e.course.code);
                        const online = isOnline(e.session.room);
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelected(e.course)}
                            style={
                              {
                                top: `${top}%`,
                                height: `${height}%`,
                                "--course-hue": hue,
                              } as React.CSSProperties
                            }
                            className={cn(
                              "absolute left-1 right-1 p-1.5 text-left border shadow-sm overflow-hidden transition-all group cursor-pointer",
                              "bg-[hsla(var(--course-hue),85%,60%,0.15)] hover:bg-[hsla(var(--course-hue),85%,60%,0.22)]",
                              "border-[hsla(var(--course-hue),70%,45%,0.35)] dark:border-[hsla(var(--course-hue),70%,60%,0.35)]",
                              "text-[hsl(var(--course-hue),80%,30%)] dark:text-[hsl(var(--course-hue),85%,80%)]",
                              online && "border-dashed",
                            )}
                            title={`${e.course.subject} ${e.course.code} — ${e.session.time}`}
                          >
                            <div className="font-bold text-[11px] truncate leading-tight">
                              {e.course.subject} {e.course.code}
                            </div>
                            <div className="text-[10px] opacity-80 truncate leading-tight mt-0.5">
                              {e.session.time}
                            </div>
                            {online && (
                              <div className="absolute top-0.5 right-0.5 text-[8px] font-bold uppercase bg-background/70 px-1 tracking-wider">
                                Online
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <GenSectionDetails course={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Empty({
  children,
  destructive,
}: {
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 flex flex-col items-center justify-center text-center p-8 border border-dashed",
        destructive
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-muted/10",
      )}
    >
      {children}
    </div>
  );
}
