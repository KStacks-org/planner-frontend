import { useState, FormEvent, useEffect } from "react";
import {
  Search,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DayMultiSelect } from "./DayMultiSelect";
import { cn } from "@/lib/utils";
import { SearchParams } from "@/types";

interface SearchFormProps {
  initialValues?: Partial<SearchParams>;
  isLoading?: boolean;
  layout?: "hero" | "sidebar";
  onSearch?: (filters: any) => void;
  overlayFilters: boolean;
  dropDown?: boolean;
}

export function SearchForm({
  initialValues,
  isLoading,
  layout = "hero",
  overlayFilters,
  dropDown = false,
  onSearch,
}: SearchFormProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (layout === "sidebar" && overlayFilters && filtersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [filtersOpen, layout, overlayFilters]);

  // --- STATE ---
  const [termCode, setTermCode] = useState(initialValues?.termCode || "202701");
  const [query, setQuery] = useState(initialValues?.q || "");
  const [dayFilter, setDayFilter] = useState(initialValues?.days || "");
  const [levelFilter, setLevelFilter] = useState(initialValues?.level || "");
  const [instructorFilter, setInstructorFilter] = useState(
    initialValues?.instructor || "",
  );
  const [startTimeFilter, setStartTimeFilter] = useState(
    initialValues?.startTime || "",
  );
  const [endTimeFilter, setEndTimeFilter] = useState(
    initialValues?.endTime || "",
  );
  const [sectionFilter, setSectionFilter] = useState(
    initialValues?.section || "",
  );
  const [genderFilter, setGenderFilter] = useState(initialValues?.gender || "");
  const [branchFilter, setBranchFilter] = useState(initialValues?.branch || "");

  const availableBranches = [
    "المركز الرئيسي",
    "فرع المرجان (ابحر)",
    "فرع رابغ",
  ];

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();

    const searchParams: Record<string, any> = {
      termCode: termCode,
      q: query || undefined,
      days: dayFilter === "all" ? undefined : dayFilter || undefined,
      level: levelFilter === "all" ? undefined : levelFilter || undefined,
      instructor: instructorFilter || undefined,
      startTime: startTimeFilter || undefined,
      endTime: endTimeFilter || undefined,
      section: sectionFilter || undefined,
      gender: genderFilter === "all" ? undefined : genderFilter || undefined,
      branch: branchFilter === "all" ? undefined : branchFilter || undefined,
      page: 1,
    };

    if (layout === "sidebar" && overlayFilters) {
      setFiltersOpen(false);
    }

    onSearch?.(searchParams);
  };

  const handleReset = () => {
    // setTermCode("202602"); // Keep term
    setDayFilter("");
    setLevelFilter("");
    setInstructorFilter("");
    setStartTimeFilter("");
    setEndTimeFilter("");
    setSectionFilter("");
    setGenderFilter("");
    setBranchFilter("");
  };

  useEffect(() => {
    if (layout === "sidebar") {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 1000);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [query]);

  // --- FILTER FIELDS JSX (Reusable) ---
  const filterFieldsContent = (
    <>
      {/* Term Code */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Term
        </Label>
        <Select value={termCode} onValueChange={setTermCode}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="202602">2026 Term 2</SelectItem>
            <SelectItem value="202701">2027 Term 1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Branch */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Branch
        </Label>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {availableBranches.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Gender
        </Label>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Level
        </Label>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any level</SelectItem>
            <SelectItem value="دبلوم">Diploma</SelectItem>
            <SelectItem value="بكالوريوس">Bachelor's</SelectItem>
            <SelectItem value="ماجستير">Master's</SelectItem>
            <SelectItem value="دكتوراه">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Day Select */}
      <DayMultiSelect value={dayFilter} onChange={setDayFilter} />

      {/* Time Range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Start
          </Label>
          <Input
            type="time"
            className="h-9 bg-background"
            value={startTimeFilter}
            onChange={(e) => setStartTimeFilter(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            End
          </Label>
          <Input
            type="time"
            className="h-9 bg-background"
            value={endTimeFilter}
            onChange={(e) => setEndTimeFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Instructor */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Instructor
        </Label>
        <Input
          className="h-9 bg-background"
          placeholder="Search name..."
          value={instructorFilter}
          onChange={(e) => setInstructorFilter(e.target.value)}
        />
      </div>

      {/* Section */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Section
        </Label>
        <Input
          className="h-9 bg-background"
          placeholder="e.g., AB"
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        />
      </div>
    </>
  );

  // --- LAYOUT: SIDEBAR MODE ---
  if (layout === "sidebar") {
    return (
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-4 w-full relative"
      >
        {/* Top Row: Reset and Search */}
        <div className="flex gap-2">
          {!dropDown && (
            <Button
              disabled={isLoading}
              onClick={handleReset}
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          <div className="relative w-full z-20">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Course, code..."
              className="pl-9 h-10 bg-background"
              value={query ?? ""}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Collapsible
          open={!dropDown ? true : filtersOpen}
          onOpenChange={setFiltersOpen}
          className={cn("space-y-2", overlayFilters && "z-30")}
        >
          {dropDown && (
            <div className="grid grid-cols-8 gap-1">
              <CollapsibleTrigger className="col-span-7 h-9 flex items-center justify-between px-3 py-2 bg-background border hover:bg-accent transition-colors">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-3 w-3" /> Filters
                </span>
                {filtersOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </CollapsibleTrigger>
              <Button
                disabled={isLoading}
                onClick={handleReset}
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-full"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <CollapsibleContent
            className={cn(
              "border bg-muted/50 transition-all duration-200",
              overlayFilters && [
                "absolute top-full left-0 right-0 mt-2 z-50",
                "bg-popover shadow-xl border-border",
                "max-h-[calc(100vh-300px)] overflow-y-auto overscroll-contain scrollbar-thin",
                "animate-in fade-in zoom-in-95",
              ],
            )}
          >
            {/* FIX 3: Added pb-10 to create a buffer at the bottom so the button is fully visible */}
            <div className="p-3 space-y-4 pb-10">
              {filterFieldsContent}

              <Button type="submit" className="w-full font-medium">
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Apply Filters"
                )}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Backdrop */}
        {overlayFilters && filtersOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/5"
            onClick={() => setFiltersOpen(false)}
          />
        )}
      </form>
    );
  }

  // --- LAYOUT: HERO MODE ---
  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search courses..."
            className="pl-10 h-12 text-lg bg-background shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-8 font-semibold cursor-pointer shadow-sm"
        >
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Search"}
        </Button>
      </form>
      <div className="bg-card border border-border p-1 shadow-sm">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
              >
                <Filter className="h-4 w-4" /> Advanced Filters
              </Button>
              {filtersOpen ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-4 pt-1 border-t border-border mt-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {filterFieldsContent}
            </div>

            {/* Added Reset Button for Hero Layout as well */}
            <div className="flex justify-end mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                type="button"
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCw className="h-3.5 w-3.5 mr-2" /> Reset Filters
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
