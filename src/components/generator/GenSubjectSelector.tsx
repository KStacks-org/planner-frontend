import { useEffect, useMemo, useState } from "react";
import { Search, Check, X, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGeneratorStore } from "@/lib/generator-store";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GenSubjectSelector() {
  const {
    subjects,
    selectedSubjectCodes,
    toggleSubject,
    clearSubjects,
    loadingSubjects,
    loadSubjects,
    subjectsLoaded,
  } = useGeneratorStore();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!subjectsLoaded) void loadSubjects();
  }, [subjectsLoaded, loadSubjects]);

  const list = useMemo(
    () => (subjects ? Object.values(subjects) : []),
    [subjects],
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    return list
      .filter(
        (s) =>
          s.code.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term) ||
          `${s.code}${s.number}`.toLowerCase().includes(term) ||
          `${s.code} ${s.number}`.toLowerCase().includes(term),
      )
      .slice(0, 25);
  }, [list, q]);

  return (
    <div className="bg-card border border-border shadow-sm">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary p-1.5">
            <BookOpen className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm">Select Courses</h2>
          {selectedSubjectCodes.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {selectedSubjectCodes.length}
            </Badge>
          )}
        </div>
        {selectedSubjectCodes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const n = selectedSubjectCodes.length;
              clearSubjects();
              toast.success(`Cleared ${n} subject${n === 1 ? "" : "s"}`);
            }}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {selectedSubjectCodes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedSubjectCodes.map((code) => {
              const s = subjects?.[code];
              return (
                <button
                  key={code}
                  onClick={() => toggleSubject(code)}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors group"
                  title={s?.name}
                >
                  <span className="font-mono font-bold">
                    {s?.code} {s?.number}
                  </span>
                  <span className="opacity-60 hidden sm:inline max-w-32 truncate">
                    {s?.name}
                  </span>
                  <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </button>
              );
            })}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search e.g. CPCS 203, Programming..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="h-52 overflow-y-auto border border-border bg-muted/10">
          {loadingSubjects ? (
            <div className="flex items-center justify-center gap-2 h-full text-muted-foreground text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading subjects…
            </div>
          ) : filtered.length > 0 ? (
            <ul>
              {filtered.map((s) => {
                const code = `${s.code} ${s.number}`;
                const selected = selectedSubjectCodes.includes(code);
                return (
                  <li key={code}>
                    <button
                      onClick={() => toggleSubject(code)}
                      className={cn(
                        "w-full text-left flex items-center justify-between gap-3 px-3 py-2 border-b border-border/60 last:border-b-0 transition-colors",
                        selected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "font-mono font-bold text-xs",
                            selected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {s.code} {s.number}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {s.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {s.credits} cr
                        </span>
                        {selected && (
                          <div className="bg-primary text-primary-foreground p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs italic">
              {q ? "No results" : "Type to search subjects"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
