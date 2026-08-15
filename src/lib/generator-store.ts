import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchGenSubjects, generateSchedules } from "./generator-api";
import type {
  GenFilters,
  GenPayload,
  GenResponse,
  GenSubjectsResponse,
} from "./generator-types";

const defaultFilters: GenFilters = {
  gender: "male",
  branches: [],
  excludedInstructors: [],
  allowedDays: ["U", "M", "T", "W", "R", "F", "S"],
  numberOfOffDays: 0,
  exactNumberOfOffDays: false,
  onlineDayIsOff: false,
  minStartTime: null,
  maxEndTime: null,
  forcedBreaks: [],
  noBreaks: false,
  allowedGap: 15,
  allowedSections: {},
};

interface GeneratorState {
  subjects: GenSubjectsResponse | null;
  generatedData: GenResponse | null;
  loadingSubjects: boolean;
  loadingGenerate: boolean;
  error: string | null;
  selectedSubjectCodes: string[];
  filters: GenFilters;
  currentScheduleIndex: number;
  hasMore: boolean;
  subjectsLoaded: boolean;

  loadSubjects: () => Promise<void>;
  toggleSubject: (code: string) => void;
  clearSubjects: () => void;
  updateFilters: (partial: Partial<GenFilters>) => void;
  resetFilters: () => void;
  generate: () => Promise<void>;
  loadMore: () => Promise<void>;
  nextSchedule: () => void;
  prevSchedule: () => void;
  goToSchedule: (index: number) => void;
  clearError: () => void;
}

const parseTime = (t: string) => {
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

export const useGeneratorStore = create<GeneratorState>()(
  persist(
    (set, get) => ({
      subjects: null,
      generatedData: null,
      loadingSubjects: false,
      loadingGenerate: false,
      error: null,
      selectedSubjectCodes: [],
      filters: defaultFilters,
      currentScheduleIndex: 0,
      hasMore: true,
      subjectsLoaded: false,

      loadSubjects: async () => {
        if (get().subjectsLoaded || get().loadingSubjects) return;
        set({ loadingSubjects: true, error: null });
        try {
          const data = await fetchGenSubjects();
          set({ subjects: data, subjectsLoaded: true });
        } catch (e) {
          console.error(e);
          set({ error: "Failed to load subjects" });
        } finally {
          set({ loadingSubjects: false });
        }
      },

      toggleSubject: (code) =>
        set((s) => ({
          selectedSubjectCodes: s.selectedSubjectCodes.includes(code)
            ? s.selectedSubjectCodes.filter((c) => c !== code)
            : [...s.selectedSubjectCodes, code],
        })),

      clearSubjects: () => set({ selectedSubjectCodes: [] }),

      updateFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } })),

      resetFilters: () => set({ filters: defaultFilters }),

      clearError: () => set({ error: null }),

      generate: async () => {
        const { selectedSubjectCodes, filters } = get();
        if (selectedSubjectCodes.length === 0) {
          set({ error: "Please select at least one subject." });
          return;
        }

        if (filters.minStartTime && filters.maxEndTime) {
          if (parseTime(filters.minStartTime) >= parseTime(filters.maxEndTime)) {
            set({ error: "End time must be after start time." });
            return;
          }
        }

        set({
          loadingGenerate: true,
          error: null,
          currentScheduleIndex: 0,
          hasMore: true,
        });

        const payload: GenPayload = {
          subjects: selectedSubjectCodes,
          filters: {
            ...filters,
            minStartTime:
              filters.minStartTime &&
              filters.minStartTime.includes(":") &&
              filters.minStartTime.split(":")[0] !== ""
                ? filters.minStartTime
                : null,
            maxEndTime:
              filters.maxEndTime &&
              filters.maxEndTime.includes(":") &&
              filters.maxEndTime.split(":")[0] !== ""
                ? filters.maxEndTime
                : null,
          },
          seed: 0,
          page: 0,
        };

        try {
          const data = await generateSchedules(payload);
          set({
            generatedData: data,
            hasMore: data.data.length > 0,
          });
        } catch (e) {
          console.error(e);
          set({ error: "Failed to generate schedules." });
        } finally {
          set({ loadingGenerate: false });
        }
      },

      loadMore: async () => {
        const { generatedData, selectedSubjectCodes, filters, loadingGenerate, hasMore } = get();
        if (!generatedData || !generatedData.data.length) return;
        if (loadingGenerate || !hasMore) return;

        const { meta } = generatedData;
        const payload: GenPayload = {
          subjects: selectedSubjectCodes,
          filters,
          seed: meta.seed,
          page: meta.page + 1,
        };

        set({ loadingGenerate: true });
        try {
          const newData = await generateSchedules(payload);
          if (newData.data.length === 0) {
            set({ hasMore: false });
          } else {
            set((s) => {
              if (!s.generatedData) return { generatedData: newData };
              const merged = [...s.generatedData.data, ...newData.data];
              return {
                generatedData: {
                  ...newData,
                  data: merged,
                  meta: { ...newData.meta, page: meta.page + 1, totalFound: merged.length },
                },
              };
            });
          }
        } catch (e) {
          console.error(e);
          set({ error: "Failed to load more schedules." });
        } finally {
          set({ loadingGenerate: false });
        }
      },

      nextSchedule: () => {
        const { generatedData, currentScheduleIndex, hasMore, loadMore } = get();
        if (!generatedData) return;
        if (currentScheduleIndex < generatedData.data.length - 1) {
          set({ currentScheduleIndex: currentScheduleIndex + 1 });
        } else if (hasMore) {
          void loadMore();
        }
      },

      prevSchedule: () => {
        const { currentScheduleIndex } = get();
        if (currentScheduleIndex > 0)
          set({ currentScheduleIndex: currentScheduleIndex - 1 });
      },

      goToSchedule: (index) => {
        const { generatedData } = get();
        if (!generatedData) return;
        const clamped = Math.max(0, Math.min(generatedData.data.length - 1, index));
        set({ currentScheduleIndex: clamped });
      },
    }),
    {
      name: "kplanner-generator-storage",
      partialize: (state) => ({
        selectedSubjectCodes: state.selectedSubjectCodes,
        filters: state.filters,
      }),
    },
  ),
);
