import { useState, useEffect, useRef } from "react";
import { useGeneratorStore } from "@/lib/generator-store";
import { useScheduleStore } from "@/lib/schedule-store";
import { generatedScheduleToCourses } from "@/lib/generator-to-planner";
import { GenSubjectSelector } from "./GenSubjectSelector";
import { GenFilterPanel } from "./GenFilterPanel";
import { GenCalendarGrid } from "./GenCalendarGrid";
import { GenScheduleList } from "./GenScheduleList";
import { GenNavigation } from "./GenNavigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List as ListIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  onScheduleAdded: () => void;
}

export function GeneratorPanel({ onScheduleAdded }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { generatedData, currentScheduleIndex, subjects, error, clearError, loadingGenerate } =
    useGeneratorStore();
  const addTabWithCourses = useScheduleStore((s) => s.addTabWithCourses);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    clearError();
  }, [error, clearError]);

  // Toast when a generation batch finishes.
  const wasLoading = useRef(false);
  const lastPage = useRef<number | null>(null);
  useEffect(() => {
    if (wasLoading.current && !loadingGenerate) {
      const data = generatedData;
      if (data) {
        // Only fire once per unique meta page — avoid duplicate toasts.
        if (lastPage.current !== data.meta.page) {
          lastPage.current = data.meta.page;
          const n = data.data.length;
          if (n === 0) {
            toast.warning("No matching schedules", {
              description: "Try loosening your filters.",
            });
          } else if (data.meta.page === 0) {
            toast.success(`Found ${n} schedule${n === 1 ? "" : "s"}`);
          } else {
            toast.info(`Loaded ${n} total schedule${n === 1 ? "" : "s"}`);
          }
        }
      }
    }
    wasLoading.current = loadingGenerate;
  }, [loadingGenerate, generatedData]);

  const currentSchedule = generatedData?.data[currentScheduleIndex] ?? null;
  const canAdd = !!currentSchedule;

  const handleAdd = () => {
    if (!currentSchedule) return;
    const courses = generatedScheduleToCourses(currentSchedule, subjects);
    const name = `Generated ${currentScheduleIndex + 1}`;
    addTabWithCourses(name, courses);
    toast.success(`Added "${name}" to your planner`, {
      description: `${courses.length} course${courses.length === 1 ? "" : "s"} · switching to Planner`,
    });
    onScheduleAdded();
  };

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "shrink-0 border-r border-border bg-background overflow-y-auto transition-all duration-200",
          sidebarOpen ? "w-full md:w-[380px]" : "w-0 hidden md:block md:w-0",
        )}
      >
        {sidebarOpen && (
          <div className="p-3 md:p-4 space-y-3">
            <GenSubjectSelector />
            <GenFilterPanel onGenerate={() => setSidebarOpen(true)} />
          </div>
        )}
      </aside>

      {/* Main */}
      <main
        className={cn(
          "flex-1 min-w-0 flex flex-col overflow-hidden",
          sidebarOpen && "hidden md:flex",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hidden md:inline-flex"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide filters" : "Show filters"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 md:hidden gap-1.5"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeftOpen className="h-4 w-4" />
            <span>Filters</span>
          </Button>

          {generatedData && generatedData.data.length > 0 && (
            <div className="bg-muted p-0.5 flex items-center">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                  view === "grid"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                  view === "list"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ListIcon className="h-3.5 w-3.5" />
                List
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-2 md:p-4">
          {view === "grid" ? <GenCalendarGrid /> : <GenScheduleList />}
        </div>

        <GenNavigation onAddSchedule={handleAdd} canAdd={canAdd} />
      </main>

      {/* Mobile back button when sidebar is open */}
      {sidebarOpen && (
        <div className="md:hidden fixed bottom-3 right-3 z-40">
          <Button
            onClick={() => setSidebarOpen(false)}
            size="sm"
            className="shadow-lg gap-1.5"
          >
            <PanelLeftClose className="h-4 w-4" />
            View Schedules
          </Button>
        </div>
      )}
    </div>
  );
}
