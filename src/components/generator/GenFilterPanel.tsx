import { useGeneratorStore } from "@/lib/generator-store";
import type { GenFilters, GenForcedBreak } from "@/lib/generator-types";
import { GenTimeInput } from "./GenTimeInput";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter, Clock, Calendar, Users, MapPin, Plus, Trash2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "U", label: "Sun" },
  { key: "M", label: "Mon" },
  { key: "T", label: "Tue" },
  { key: "W", label: "Wed" },
  { key: "R", label: "Thu" },
];

const BRANCHES = ["المركز الرئيسي", "فرع رابغ", "فرع المرجان (ابحر)"];
const BRANCH_LABELS: Record<string, string> = {
  "المركز الرئيسي": "Main Campus",
  "فرع رابغ": "Rabigh",
  "فرع المرجان (ابحر)": "Al Murjan (Obhur)",
};

interface Props {
  onGenerate?: () => void;
}

export function GenFilterPanel({ onGenerate }: Props) {
  const { filters, updateFilters, generate, loadingGenerate, selectedSubjectCodes, subjects } =
    useGeneratorStore();

  const set = <K extends keyof GenFilters>(k: K, v: GenFilters[K]) =>
    updateFilters({ [k]: v } as Partial<GenFilters>);

  const toggleDay = (d: string) => {
    const list = filters.allowedDays;
    set("allowedDays", list.includes(d) ? list.filter((x) => x !== d) : [...list, d]);
  };

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border shadow-sm">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <div className="bg-primary/10 text-primary p-1.5">
            <Filter className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm">Filters</h2>
        </div>

        <div className="p-4 space-y-5">
          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Section <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "male" as const, l: "Male" },
                { v: "female" as const, l: "Female" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => set("gender", o.v)}
                  className={cn(
                    "h-9 text-sm font-medium border transition-colors",
                    filters.gender === o.v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-muted",
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Branch
            </Label>
            <div className="space-y-1">
              {BRANCHES.map((b) => {
                const on = filters.branches?.includes(b);
                return (
                  <label
                    key={b}
                    className="flex items-center gap-2 px-2 py-1.5 border border-transparent hover:border-border cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={on || false}
                      onChange={(e) => {
                        const cur = filters.branches ?? [];
                        set(
                          "branches",
                          e.target.checked ? [...cur, b] : cur.filter((x) => x !== b),
                        );
                      }}
                      className="h-4 w-4 accent-primary"
                    />
                    <span>{BRANCH_LABELS[b] ?? b}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Time Range
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">From</span>
                <GenTimeInput
                  value={filters.minStartTime ?? ""}
                  onChange={(v) => set("minStartTime", v)}
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">To</span>
                <GenTimeInput
                  value={filters.maxEndTime ?? ""}
                  onChange={(v) => set("maxEndTime", v)}
                />
              </div>
            </div>
          </div>

          {/* Off days */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Off Days
              </Label>
              <div className="flex bg-muted p-0.5 text-[11px]">
                <button
                  onClick={() => {
                    set("exactNumberOfOffDays", false);
                    set("numberOfOffDays", 0);
                    set("allowedDays", ["U", "M", "T", "W", "R"]);
                  }}
                  className={cn(
                    "px-2 py-1 font-medium transition-colors",
                    !filters.exactNumberOfOffDays
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Specific
                </button>
                <button
                  onClick={() => {
                    set("exactNumberOfOffDays", true);
                    set("allowedDays", []);
                  }}
                  className={cn(
                    "px-2 py-1 font-medium transition-colors",
                    filters.exactNumberOfOffDays
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Count
                </button>
              </div>
            </div>

            {!filters.exactNumberOfOffDays ? (
              <div className="grid grid-cols-5 gap-1.5">
                {DAYS.map((d) => {
                  const isOff = !filters.allowedDays.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      onClick={() => toggleDay(d.key)}
                      className={cn(
                        "h-9 text-xs font-bold border transition-colors",
                        isOff
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-input hover:bg-muted",
                      )}
                      title={isOff ? "Remove day-off" : "Set as day-off"}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-muted/30 p-3 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Required day-offs</span>
                  <span className="font-bold text-primary text-sm">
                    {filters.numberOfOffDays === 0 ? "None" : filters.numberOfOffDays}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={4}
                  step={1}
                  value={[filters.numberOfOffDays]}
                  onValueChange={([v]) => set("numberOfOffDays", v)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              Choose either specific days OR a count — not both.
            </p>
          </div>

          {/* Online day = off */}
          <label className="flex items-start gap-3 py-1 cursor-pointer">
            <Switch
              checked={filters.onlineDayIsOff}
              onCheckedChange={(v) => set("onlineDayIsOff", v)}
            />
            <div className="min-w-0">
              <span className="block text-sm font-medium">Online-only day counts as off</span>
              <span className="block text-[11px] text-muted-foreground">
                A day with only remote/Blackboard classes is treated as a day-off.
              </span>
            </div>
          </label>

          {/* Breaks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Forced Breaks
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const brk: GenForcedBreak = { start: "", end: "", days: "" };
                  set("forcedBreaks", [...filters.forcedBreaks, brk]);
                }}
                className="h-6 text-[11px] px-2 text-primary hover:text-primary"
              >
                <Plus className="h-3 w-3" /> Add break
              </Button>
            </div>
            <div className="space-y-2">
              {filters.forcedBreaks.map((b, i) => (
                <div key={i} className="relative bg-muted/30 border border-border p-3 space-y-2">
                  <button
                    onClick={() => {
                      set("forcedBreaks", filters.forcedBreaks.filter((_, j) => j !== i));
                    }}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove break"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1">From</span>
                      <GenTimeInput
                        value={b.start}
                        onChange={(val) => {
                          const arr = [...filters.forcedBreaks];
                          arr[i] = { ...b, start: val };
                          set("forcedBreaks", arr);
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1">To</span>
                      <GenTimeInput
                        value={b.end}
                        onChange={(val) => {
                          const arr = [...filters.forcedBreaks];
                          arr[i] = { ...b, end: val };
                          set("forcedBreaks", arr);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">Days</span>
                    <div className="grid grid-cols-5 gap-1">
                      {DAYS.map((d) => {
                        const on = b.days.includes(d.key);
                        return (
                          <button
                            key={d.key}
                            onClick={() => {
                              const nd = on
                                ? b.days.replace(d.key, "")
                                : b.days + d.key;
                              const arr = [...filters.forcedBreaks];
                              arr[i] = { ...b, days: nd };
                              set("forcedBreaks", arr);
                            }}
                            className={cn(
                              "h-7 text-[10px] font-bold border transition-colors",
                              on
                                ? "bg-primary/15 text-primary border-primary/30"
                                : "bg-background text-muted-foreground border-input hover:bg-muted",
                            )}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {filters.forcedBreaks.length === 0 && (
                <div className="border border-dashed border-border text-center py-4 text-[11px] text-muted-foreground">
                  No forced breaks
                </div>
              )}
            </div>
          </div>

          {/* No breaks */}
          <label className="flex items-start gap-3 py-1 border-t border-border pt-4 cursor-pointer">
            <Switch
              checked={filters.noBreaks}
              onCheckedChange={(v) => set("noBreaks", v)}
            />
            <div className="min-w-0">
              <span className="block text-sm font-medium">No breaks</span>
              <span className="block text-[11px] text-muted-foreground">
                Prefer back-to-back lectures (forced breaks still honored).
              </span>
            </div>
          </label>

          {/* Allowed sections */}
          {selectedSubjectCodes.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Restrict Sections (optional)
              </Label>
              <div className="space-y-2">
                {selectedSubjectCodes.map((code) => {
                  const subject = subjects?.[code];
                  const current = filters.allowedSections?.[code] || [];
                  const add = (raw: string) => {
                    const clean = raw.trim().toUpperCase();
                    if (!clean || current.includes(clean)) return;
                    set("allowedSections", {
                      ...filters.allowedSections,
                      [code]: [...current, clean],
                    });
                  };
                  const remove = (s: string) => {
                    set("allowedSections", {
                      ...filters.allowedSections,
                      [code]: current.filter((x) => x !== s),
                    });
                  };
                  return (
                    <div key={code} className="bg-muted/30 border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold">
                          {subject?.code} {subject?.number}
                        </span>
                        <span className="text-muted-foreground truncate ml-2">{subject?.name}</span>
                      </div>
                      {current.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {current.map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="gap-1 px-1.5 h-5 text-[10px]"
                            >
                              {s}
                              <button
                                onClick={() => remove(s)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Input
                          id={`${code}-section`}
                          placeholder="e.g. CS1"
                          className="h-8 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              add(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            const el = document.getElementById(
                              `${code}-section`,
                            ) as HTMLInputElement | null;
                            if (el) {
                              add(el.value);
                              el.value = "";
                            }
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() => {
          void generate();
          onGenerate?.();
        }}
        disabled={loadingGenerate || selectedSubjectCodes.length === 0}
        className="w-full h-11 gap-2 text-sm font-semibold"
        size="lg"
      >
        {loadingGenerate ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Schedules
          </>
        )}
      </Button>
    </div>
  );
}
