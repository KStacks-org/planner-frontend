import { useGeneratorStore } from "@/lib/generator-store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Plus, Hash } from "lucide-react";

interface Props {
  onAddSchedule: () => void;
  canAdd: boolean;
}

export function GenNavigation({ onAddSchedule, canAdd }: Props) {
  const { generatedData, currentScheduleIndex, nextSchedule, prevSchedule, hasMore, loadingGenerate } =
    useGeneratorStore();

  if (!generatedData || generatedData.data.length === 0) return null;

  const isAtEnd = currentScheduleIndex === generatedData.data.length - 1;
  const total = generatedData.meta.totalFound || generatedData.data.length;

  return (
    <div className="flex items-center justify-between gap-3 p-2 md:p-3 border-t border-border bg-background">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Hash className="h-3.5 w-3.5" />
        <span className="tabular-nums">
          <span className="font-semibold text-foreground">{currentScheduleIndex + 1}</span>
          <span className="mx-1 opacity-50">/</span>
          <span>{total}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={prevSchedule}
          disabled={currentScheduleIndex === 0}
          className="h-8 gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        <Button
          size="sm"
          onClick={onAddSchedule}
          disabled={!canAdd}
          variant="secondary"
          className="h-8 gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Schedule</span>
          <span className="sm:hidden">Add</span>
        </Button>

        <Button
          size="sm"
          onClick={nextSchedule}
          disabled={isAtEnd && (!hasMore || loadingGenerate)}
          className="h-8 gap-1"
        >
          {loadingGenerate && isAtEnd ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">
                {isAtEnd && hasMore ? "Load more" : "Next"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
