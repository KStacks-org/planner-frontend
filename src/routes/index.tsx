import { useState, useRef, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { searchCourses } from "../lib/api";
import { KauHeader } from "@/components/layout/KauHeader";
import { ScheduleCalendar } from "@/components/planner/ScheduleCalendar";
import { DesktopSchedule } from "@/components/planner/DesktopSchedule";
import { PlannerCourseCard } from "@/components/planner/PlannerCourseCard";
import { SearchForm } from "@/components/search/SearchForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Search as SearchIcon,
  Download,
  X,
  Edit,
  GraduationCap,
  Clock,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useScheduleStore } from "@/lib/schedule-store";
import { parseTimeRange } from "@/lib/schedule-utils";
import { KauFooter } from "@/components/layout/KauFooter";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Course, SearchParams } from "@/types";

export const Route = createFileRoute("/")({
  component: SchedulePage,
});

function SchedulePage() {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    removeTab,
    renameTab,
    getActiveCourses,
  } = useScheduleStore();

  const selectedCourses = getActiveCourses();
  const calendarRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const syncRan = useRef(false);

  const [sidebarMode, setSidebarMode] = useState<"view" | "search">("view");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToEdit, setTabToEdit] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newName, setNewName] = useState("");

  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [localFilters, setLocalFilters] = useState<Partial<SearchParams>>({
    termCode: "202701",
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["mini-search", localFilters],
    queryFn: () => searchCourses(localFilters as SearchParams),
    enabled: sidebarMode === "search" && isSheetOpen,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (!syncRan.current) {
      syncRan.current = true;
      useScheduleStore.getState().syncActiveTabCourses();
    }
  }, []);

  useEffect(() => {
    if (syncRan.current) {
      useScheduleStore.getState().syncActiveTabCourses();
    }
  }, [activeTabId]);

  const stats = useMemo(() => {
    const totalCredits = selectedCourses.reduce(
      (sum, c) => sum + (c.credits || 0),
      0,
    );
    const scheduledHours = selectedCourses.reduce((sum, c) => {
      return sum + c.schedules.length;
    }, 0);
    return { totalCredits, scheduledHours, courseCount: selectedCourses.length };
  }, [selectedCourses]);

  const handleLocalSearch = (newFilters: any) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setLocalFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openRenameDialog = (id: string, currentName: string) => {
    setTabToEdit({ id, name: currentName });
    setNewName(currentName);
    setRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (tabToEdit && newName.trim()) {
      renameTab(tabToEdit.id, newName.trim());
      setRenameDialogOpen(false);
      setTabToEdit(null);
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setTabToEdit({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tabToEdit) {
      removeTab(tabToEdit.id);
      setDeleteDialogOpen(false);
      setTabToEdit(null);
    }
  };

  const checkConflict = (courseToCheck: Course): Course[] => {
    if (selectedCourses.some((c) => c.id === courseToCheck.id)) return [];

    const conflicts = selectedCourses.filter((selected) => {
      if (
        selected.courseCode + selected.courseNumber ===
        courseToCheck.courseCode + courseToCheck.courseNumber
      )
        return true;

      return selected.schedules.some((selSched) => {
        return courseToCheck.schedules.some((checkSched) => {
          const selDays = selSched.days.split("");
          const checkDays = checkSched.days.split("");
          if (!selDays.some((d) => checkDays.includes(d))) return false;

          const selTime = parseTimeRange(selSched.time);
          const checkTime = parseTimeRange(checkSched.time);

          if (!selTime || !checkTime) return false;
          return selTime.start < checkTime.end && selTime.end > checkTime.start;
        });
      });
    });

    return conflicts;
  };

  const openSidebar = (mode: "view" | "search") => {
    setSidebarMode(mode);
    setIsSheetOpen(true);
  };

  const handleDownload = async () => {
    if (!downloadRef.current) return;
    try {
      setIsDownloading(true);
      const element = downloadRef.current;
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
        pixelRatio: 2,
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download =
        (tabs.find((t) => t.id === activeTabId)?.name || "schedule") + ".png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download schedule:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-screen flex flex-col bg-background font-sans overflow-hidden">
      <KauHeader />

      <div className="flex flex-1 md:flex overflow-hidden relative z-10 bg-background">
        <main className="flex-1 p-2 md:p-4 overflow-hidden w-full flex flex-col">
          <div className="max-w-7xl w-full mx-auto h-full flex flex-col">
            {/* --- TOP BAR --- */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                    Planner
                  </h1>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleDownload}
                        disabled={
                          isDownloading || selectedCourses.length === 0
                        }
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectedCourses.length === 0
                        ? "Add courses first"
                        : "Download as PNG"}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 md:h-9"
                    onClick={() => openSidebar("view")}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">My Courses</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 px-1.5 min-w-5 justify-center"
                    >
                      {stats.courseCount}
                    </Badge>
                  </Button>

                  <Button
                    size="sm"
                    className="gap-2 shadow-sm h-8 md:h-9"
                    onClick={() => openSidebar("search")}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Course</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>

              {/* Stats bar */}
              {stats.courseCount > 0 && (
                <div className="flex items-center gap-3 md:gap-4 px-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>
                      <span className="font-semibold text-foreground">
                        {stats.totalCredits}
                      </span>{" "}
                      credits
                    </span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      <span className="font-semibold text-foreground">
                        {stats.courseCount}
                      </span>{" "}
                      courses
                    </span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      <span className="font-semibold text-foreground">
                        {stats.scheduledHours}
                      </span>{" "}
                      sessions
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-1 px-1 overflow-x-auto no-scrollbar relative">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "group flex items-center gap-2 px-3 md:px-4 py-2 border-t border-x cursor-pointer text-xs md:text-sm font-medium transition-colors select-none relative top-px whitespace-nowrap",
                      activeTabId === tab.id
                        ? "bg-background border-border text-foreground z-10"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="max-w-20 md:max-w-none truncate">
                      {tab.name}
                    </span>
                    <span
                      className={cn(
                        "flex items-center justify-center text-[9px] h-4 min-w-4 px-1 rounded-full",
                        activeTabId === tab.id
                          ? "bg-primary/10 text-primary"
                          : "bg-black/5 dark:bg-white/10",
                      )}
                    >
                      {tab.courses.length}
                    </span>
                    {activeTabId === tab.id && (
                      <div className="flex items-center gap-0.5 ml-1 border-l pl-1 border-border/40">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameDialog(tab.id, tab.name);
                          }}
                          className="hover:text-primary transition-colors p-1 hover:bg-muted rounded"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteDialog(tab.id, tab.name);
                              }}
                              disabled={tabs.length <= 1}
                              className="hover:text-destructive transition-colors disabled:opacity-30 p-1 hover:bg-destructive/10 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          {tabs.length <= 1 && (
                            <TooltipContent>Cannot delete last tab</TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ))}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        addTab(`Schedule ${tabs.length + 1}`)
                      }
                      disabled={tabs.length >= 5}
                      className="ml-1 p-1.5 hover:bg-muted text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  {tabs.length >= 5 && (
                    <TooltipContent>Maximum 5 schedules</TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>

            {/* --- CALENDAR AREA --- */}
            <div className="flex-1 bg-background border shadow-sm overflow-hidden flex flex-col min-h-0 mt-1">
              <div className="flex-1 overflow-auto bg-muted/5">
                <div className="min-w-fit h-full p-1 md:p-0" ref={calendarRef}>
                  <ScheduleCalendar />
                </div>
              </div>
            </div>
          </div>
        </main>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent
            side="right"
            className="w-screen sm:w-135 p-0 flex flex-col h-full bg-card"
          >
            <SheetHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
              <SheetTitle className="flex items-center gap-2 text-lg">
                {sidebarMode === "search" ? (
                  <>
                    <SearchIcon className="h-5 w-5 text-muted-foreground" />{" "}
                    Find Courses
                  </>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5 text-muted-foreground" /> My
                    Courses
                    {stats.courseCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {stats.courseCount}
                      </Badge>
                    )}
                  </>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto bg-muted/5 relative">
              {sidebarMode === "search" && (
                <div className="flex flex-col min-h-full">
                  <div className="p-4 border-b bg-background sticky top-0 z-20 shadow-sm">
                    <SearchForm
                      initialValues={localFilters}
                      isLoading={isLoading}
                      layout="sidebar"
                      overlayFilters={true}
                      dropDown={true}
                      onSearch={handleLocalSearch}
                    />
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    {isLoading && (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                      </div>
                    )}
                    {!isLoading && data?.data?.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground text-sm">
                        No courses found matching your filters.
                      </div>
                    )}
                    {data?.data?.map((course) => (
                      <PlannerCourseCard
                        key={course.id}
                        course={course}
                        conflict={checkConflict(course).length > 0}
                        conflictCourse={checkConflict(course)}
                      />
                    ))}
                  </div>
                  {data && data.meta.totalPages > 1 && (
                    <div className="p-3 border-t bg-background flex items-center justify-between text-xs sticky bottom-0 z-20">
                      <span className="text-muted-foreground">
                        Page {data.meta.page} of {data.meta.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={data.meta.page <= 1}
                          onClick={() => handlePageChange(data.meta.page - 1)}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={data.meta.page >= data.meta.totalPages}
                          onClick={() => handlePageChange(data.meta.page + 1)}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {sidebarMode === "view" && (
                <div className="p-4 space-y-3">
                  {selectedCourses.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center text-muted-foreground">
                      <div className="bg-muted p-4 mb-3 opacity-50">
                        <Plus className="h-6 w-6" />
                      </div>
                      <p className="font-medium">Your schedule is empty</p>
                      <Button
                        variant="link"
                        onClick={() => setSidebarMode("search")}
                        className="text-primary mt-1"
                      >
                        Click to find courses
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {stats.totalCredits} credits
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {stats.scheduledHours} sessions
                        </span>
                      </div>
                      {selectedCourses.map((course) => (
                        <PlannerCourseCard
                          noOutline
                          key={course.id}
                          course={course}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* --- HIDDEN DESKTOP CALENDAR FOR DOWNLOAD --- */}
      <div
        ref={downloadRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "1500px",
          height: "1200px",
          zIndex: -50,
          visibility: "visible",
        }}
        className="bg-background p-8 flex flex-col pointer-events-none"
      >
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-bold">
            {activeTab?.name || "Schedule"}
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {stats.courseCount} Courses &middot; {stats.totalCredits} Credits
          </p>
        </div>
        <div className="flex-1 border overflow-hidden shadow-sm">
          <DesktopSchedule />
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Schedule</DialogTitle>
            <DialogDescription>
              Give your schedule a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full gap-1.5 py-2">
            <Label htmlFor="sched-name">Name</Label>
            <Input
              id="sched-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRename}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &ldquo;{tabToEdit?.name}&rdquo;
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="hidden md:block">
        <KauFooter />
      </div>
    </div>
  );
}
