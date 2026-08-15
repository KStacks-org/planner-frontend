import type { Course } from "@/types";
import type {
  GenGeneratedSchedule,
  GenSubjectsResponse,
} from "./generator-types";

let generatedIdSeed = -1_000_000;

function nextTempId() {
  return generatedIdSeed--;
}

export function generatedScheduleToCourses(
  schedule: GenGeneratedSchedule,
  subjects: GenSubjectsResponse | null,
): Course[] {
  return schedule.courses.map((c) => {
    const key = `${c.subject} ${c.code}`;
    const meta = subjects?.[key];
    const section = c.availableSectionOptions[0];

    return {
      id: nextTempId(),
      crn: section?.crn ?? 0,
      section: section?.section ?? "",
      courseCode: c.subject,
      courseNumber: c.code,
      title: meta?.name ?? `${c.subject} ${c.code}`,
      primaryInstructor: section?.instructor ?? "TBA",
      credits: meta?.credits ?? 0,
      branch: section?.location ?? "",
      schedules: c.schedules.map((s) => ({
        type: s.type,
        days: s.days,
        time: s.time,
        room: s.room,
        instructor: s.instructor,
      })),
    };
  });
}
