import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Moon } from "lucide-react";
import { toast } from "sonner";
import { useScheduleStore } from "@/lib/schedule-store";
import { useRamadanTime } from "@/hooks/use-ramadan-time";
import { cn } from "@/lib/utils";
import { getCourseHue } from "@/lib/get-course-hue";
import { Course } from "@/types";

interface PlannerCourseCardProps {
  course: Course;
  conflict?: boolean;
  conflictCourse?: Course[];
  noOutline?: boolean;
}

export function PlannerCourseCard({
  course,
  conflict = false,
  conflictCourse: conflictCourses,
  noOutline = false,
}: PlannerCourseCardProps) {
  const { addCourse, removeCourse, isCourseSelected } = useScheduleStore();
  const { isRamadanMode, formatRamadanTime } = useRamadanTime();

  const selected = isCourseSelected(course.id);

  const label = `${course.courseCode} ${course.courseNumber}`;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      removeCourse(course.id);
      toast.success(`Removed ${label}`);
    } else if (!conflict) {
      addCourse(course);
      toast.success(`Added ${label}`, {
        description: course.title,
      });
    }
  };

  const handleReplace = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (conflict && conflictCourses != null) {
      const replaced = conflictCourses
        .map((c) => `${c.courseCode}${c.courseNumber}`)
        .join(", ");
      conflictCourses.forEach((c) => removeCourse(c.id));
      addCourse(course);
      toast.success(`Replaced ${replaced} with ${label}`);
    }
  };

  const hue = getCourseHue(course.courseCode, course.courseNumber);

  return (
    <div
      className={cn(
        "relative bg-card text-card-foreground transition-all duration-200 overflow-hidden",
        "border border-border",

        !noOutline &&
          selected &&
          "border-primary/50 ring-1 ring-primary/20 bg-primary/5",

        !noOutline && !selected && "hover:border-primary/50",

        !noOutline &&
          conflict &&
          !selected &&
          "opacity-80 bg-muted/30 border-dashed border-destructive/50",
      )}
    >
      <div className="p-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div
              className="w-4 h-4 shadow-sm"
              style={{
                backgroundColor: `hsl(${hue}, 85%, 60%)`,
              }}
            />
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 h-5 font-mono bg-muted text-foreground border border-border/50"
            >
              {course.courseCode}
              {course.courseNumber}
            </Badge>

            {course.credits && (
              <Badge className="text-[10px] px-1.5 h-5 font-mono bg-muted text-foreground border border-border/50">
                {course.credits} Cr
              </Badge>
            )}

            {course.section && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5">
                {course.section}
              </span>
            )}

            <span className="text-[10px] text-muted-foreground font-mono ml-auto">
              {course.crn}
            </span>

            <Button
              size="icon"
              variant={selected ? "destructive" : "secondary"}
              className={cn(
                "h-6 w-6 shrink-0 mt-0.5 cursor-pointer",
                conflict && !selected && "cursor-not-allowed opacity-50",
              )}
              onClick={handleToggle}
              disabled={conflict && !selected}
            >
              {selected ? (
                <X className="h-3 w-3" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </div>

          <h4
            className={cn(
              "font-bold text-sm leading-tight mb-2 line-clamp-2",
              conflict && !selected && "text-muted-foreground",
            )}
          >
            {course.title}
          </h4>

          <div className="space-y-2">
            {course.schedules.map((s, i) => (
              <div
                key={i}
                className="text-[11px] text-muted-foreground flex flex-col gap-0.5 border-l-2 border-muted pl-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground w-5">
                    {s.days}
                  </span>
                  <span
                    className={cn(
                      "opacity-80 flex items-center gap-1",
                      isRamadanMode &&
                        "text-amber-600 dark:text-amber-400 font-medium",
                    )}
                  >
                    {isRamadanMode && <Moon className="h-2.5 w-2.5" />}
                    {formatRamadanTime(s.time)}
                  </span>
                </div>
                <div
                  className="truncate opacity-80 max-w-45"
                  title={s.instructor}
                >
                  {s.instructor || "Instructor TBA"}
                </div>
              </div>
            ))}
          </div>

          {conflictCourses && conflictCourses.length > 0 && !selected && (
            <div className="mt-2 w-full text-[10px] text-destructive flex items-center gap-1 font-medium bg-destructive/5 p-1">
              <span>
                Conflict:{" "}
                {conflictCourses
                  .map((c) => c.courseCode + c.courseNumber)
                  .join(", ")}
              </span>
              <button
                onClick={handleReplace}
                className="ml-auto mr-1 underline cursor-pointer hover:text-destructive/80"
              >
                Replace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}