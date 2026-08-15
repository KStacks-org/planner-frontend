import { useMemo } from "react";
import { useScheduleStore } from "@/lib/schedule-store";
import { DAY_MAP, DAYS_HEADER } from "@/lib/schedule-utils";
import { useRamadanTime } from "@/hooks/use-ramadan-time";
import { Course, Schedule } from "@/types";

function getStartEndMinutes(timeString: string) {
  if (!timeString || !timeString.includes("-"))
    return { startVal: 0, endVal: 0 };

  const [startStr, endStr] = timeString.split("-");

  const parseToMins = (str: string) => {
    const cleanStr = str.trim().toUpperCase();
    const matches = cleanStr.match(/\d+/g);
    if (!matches) return 0;

    let hours = parseInt(matches[0], 10);
    const minutes = parseInt(matches[1], 10);

    if (cleanStr.includes("PM") && hours < 12) hours += 12;
    else if (cleanStr.includes("AM") && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 5) hours += 24;

    return hours * 60 + minutes;
  };

  return {
    startVal: parseToMins(startStr),
    endVal: parseToMins(endStr),
  };
}

export interface ScheduleEventData {
  course: Course;
  schedule: Schedule;
  startVal: number;
  endVal: number;
}

export function useScheduleData(dayCount?: number) {
  const selectedCourses = useScheduleStore((state) => state.getActiveCourses());
  const { isRamadanMode, formatRamadanTime } = useRamadanTime();
  const days = DAYS_HEADER.slice(0, dayCount ?? DAYS_HEADER.length);

  const scheduleByDay = useMemo(() => {
    return days.map((_day, dayIndex) => {
      const events: ScheduleEventData[] = [];

      selectedCourses.forEach((course) => {
        course.schedules?.forEach((sched) => {
          const displayTimeStr = isRamadanMode
            ? formatRamadanTime(sched.time)
            : sched.time;

          const currentDayChar = Object.keys(DAY_MAP).find(
            (key) => DAY_MAP[key] === dayIndex,
          );

          if (currentDayChar && sched.days.includes(currentDayChar)) {
            const { startVal, endVal } = getStartEndMinutes(displayTimeStr);
            events.push({
              course,
              schedule: { ...sched, time: displayTimeStr },
              startVal,
              endVal,
            });
          }
        });
      });

      return events.sort((a, b) => a.startVal - b.startVal);
    });
  }, [selectedCourses, isRamadanMode, formatRamadanTime, days]);

  return { selectedCourses, scheduleByDay, isRamadanMode };
}

export { getStartEndMinutes };

export function formatBreakTime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function formatMinutesToTime(mins: number) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;

  if (h >= 24) h -= 24;

  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, "0");

  return `${displayH}:${displayM} ${ampm}`;
}

export function getDayTimeRange(dayEvents: ScheduleEventData[]) {
  if (!dayEvents || dayEvents.length === 0) return "";
  const startMins = dayEvents[0].startVal;
  const endMins = Math.max(...dayEvents.map((e) => e.endVal));
  return `${formatMinutesToTime(startMins)} - ${formatMinutesToTime(endMins)}`;
}
