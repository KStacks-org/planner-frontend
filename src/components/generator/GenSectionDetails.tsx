import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Hash, User, MapPin, BookOpen } from "lucide-react";
import type { GenScheduledCourse, GenSectionOption } from "@/lib/generator-types";

interface Props {
  course: GenScheduledCourse | null;
  onClose: () => void;
}

export function GenSectionDetails({ course, onClose }: Props) {
  if (!course) return null;

  const uniq = course.availableSectionOptions.reduce<GenSectionOption[]>((acc, cur) => {
    if (!acc.find((x) => x.crn === cur.crn)) acc.push(cur);
    return acc;
  }, []);

  const first = course.schedules[0];

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-mono">
                {course.subject} {course.code}
              </DialogTitle>
              <DialogDescription>
                {first && (
                  <span className="tabular-nums">
                    {first.startTime} – {first.endTime}
                  </span>
                )}
                {first && <span className="mx-2 text-muted-foreground/60">·</span>}
                <span>{uniq.length} available section{uniq.length === 1 ? "" : "s"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
          <div className="grid gap-2">
            {uniq.map((s) => (
              <div
                key={s.crn}
                className="border border-border bg-muted/20 p-3 grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <Field icon={<Hash className="h-4 w-4" />} label="Section" value={s.section} mono />
                <Field icon={<Hash className="h-4 w-4" />} label="CRN" value={String(s.crn)} mono />
                <Field
                  icon={<User className="h-4 w-4" />}
                  label="Instructor"
                  value={s.instructor || "TBA"}
                  className="col-span-2"
                />
                {s.location && (
                  <div className="col-span-full flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {s.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {uniq.length > 1 && (
          <div className="pt-3 border-t border-border">
            <Badge variant="secondary" className="text-[10px] font-normal">
              All sections above share the same time slot shown in this schedule
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  icon,
  label,
  value,
  mono,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-2 min-w-0 ${className ?? ""}`}>
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-semibold truncate ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}
