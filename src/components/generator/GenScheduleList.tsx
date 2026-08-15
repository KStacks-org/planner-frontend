import { useMemo, useState } from "react";
import { useGeneratorStore } from "@/lib/generator-store";
import { getCourseHue } from "@/lib/get-course-hue";
import { cn } from "@/lib/utils";
import { GenSectionDetails } from "./GenSectionDetails";
import { Clock, ChevronRight, SearchX, Sparkles, Loader2 } from "lucide-react";
import type { GenScheduledCourse } from "@/lib/generator-types";

const DAYS = [
  { key: "U", label: "Sunday" },
  { key: "M", label: "Monday" },
  { key: "T", label: "Tuesday" },
  { key: "W", label: "Wednesday" },
  { key: "R", label: "Thursday" },
];

export function GenScheduleList() {
  const { generatedData, currentScheduleIndex, loadingGenerate } = useGeneratorStore();
  const [selected, setSelected] = useState<GenScheduledCourse | null>(null);

  const schedule = useMemo(() => {
    if (!generatedData || !generatedData.data[currentScheduleIndex]) return null;
    return generatedData.data[currentScheduleIndex];
  }, [generatedData, currentScheduleIndex]);

  if (loadingGenerate && !schedule) {
    return (
      <Empty>
        <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-3" />
        <p className="font-medium">Looking for the best schedules…</p>
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
      </Empty>
    );
  }

  if (!schedule) {
    return (
      <Empty>
        <div className="bg-primary/10 text-primary p-3 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="font-semibold text-base">Generate to see options</p>
      </Empty>
    );
  }

  const allEvents = schedule.courses.flatMap((course) =>
    course.schedules.flatMap((session) =>
      session.days.split("").map((day) => ({ course, session, day })),
    ),
  );

  const grouped = DAYS.map((d) => ({
    ...d,
    events: allEvents
      .filter((e) => e.day === d.key)
      .sort((a, b) => a.session.startMinutes - b.session.startMinutes),
  }));

  return (
    <>
      <div className="flex-1 min-h-0 bg-background border border-border shadow-sm overflow-auto">
        <div className="p-4 space-y-5">
          {grouped.map(({ key, label, events }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-2 sticky top-0 -mx-4 px-4 bg-background/95 backdrop-blur py-1 z-10">
                <h3
                  className={cn(
                    "font-bold text-sm uppercase tracking-wider",
                    events.length === 0 ? "text-muted-foreground/50" : "text-foreground",
                  )}
                >
                  {label}
                </h3>
                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5">
                  {events.length}
                </span>
              </div>
              {events.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-muted-foreground border border-dashed border-border">
                  No classes
                </div>
              ) : (
                <div className="grid gap-1.5">
                  {events.map((e, idx) => {
                    const hue = getCourseHue(e.course.subject, e.course.code);
                    return (
                      <button
                        key={`${e.course.subject}-${e.course.code}-${idx}`}
                        onClick={() => setSelected(e.course)}
                        style={{ "--course-hue": hue } as React.CSSProperties}
                        className={cn(
                          "text-left border p-3 group transition-colors flex items-center justify-between gap-3",
                          "bg-[hsla(var(--course-hue),85%,60%,0.08)] hover:bg-[hsla(var(--course-hue),85%,60%,0.15)]",
                          "border-[hsla(var(--course-hue),70%,45%,0.25)]",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-mono font-bold text-sm">
                            {e.course.subject} {e.course.code}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span className="tabular-nums">
                              {e.session.startTime} – {e.session.endTime}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <GenSectionDetails course={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-8 border border-dashed border-border bg-muted/10">
      {children}
    </div>
  );
}
