export interface GenSubject {
  code: string;
  name: string;
  credits: number;
  number: string;
}

export type GenSubjectsResponse = Record<string, GenSubject>;

export interface GenForcedBreak {
  start: string;
  end: string;
  days: string; // "UMTWRFS"
}

export type GenGender = "male" | "female";

export interface GenFilters {
  gender: GenGender;
  branches: string[];
  excludedInstructors: string[];
  allowedDays: string[];
  numberOfOffDays: number;
  exactNumberOfOffDays: boolean;
  onlineDayIsOff: boolean;
  minStartTime: string | null;
  maxEndTime: string | null;
  forcedBreaks: GenForcedBreak[];
  noBreaks: boolean;
  allowedGap: number;
  allowedSections: Record<string, string[]>;
}

export interface GenPayload {
  subjects: string[];
  filters: GenFilters;
  seed: number;
  page: number;
}

export interface GenClassSession {
  days: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string; // "1:00 PM"
  endTime: string;
  time: string; // "1:00 PM - 2:20 PM"
  instructor: string;
  room: string;
  type: string;
}

export interface GenSectionOption {
  crn: number;
  instructor: string;
  location: string | null;
  section: string;
}

export interface GenScheduledCourse {
  subject: string;
  code: string;
  schedules: GenClassSession[];
  availableSectionOptions: GenSectionOption[];
  timeSignature: string;
}

export interface GenGeneratedSchedule {
  id: number;
  days: string[];
  courses: GenScheduledCourse[];
}

export interface GenMeta {
  page: number;
  seed: number;
  totalFound: number;
}

export interface GenResponse {
  data: GenGeneratedSchedule[];
  meta: GenMeta;
  status: string;
  timeTaken: number;
}
