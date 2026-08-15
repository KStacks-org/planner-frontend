import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUiStore } from "@/lib/ui-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Moon, Sun, Calendar, Sparkles } from "lucide-react";
import { RamadanToggle } from "./RamadanToggle";
import { cn } from "@/lib/utils";

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ViewSwitch() {
  const view = useUiStore((s) => s.view);
  const setView = useUiStore((s) => s.setView);

  return (
    <div className="hidden sm:flex items-center bg-muted p-0.5">
      <button
        onClick={() => setView("planner")}
        className={cn(
          "h-8 px-3 text-xs font-medium flex items-center gap-1.5 transition-colors",
          view === "planner"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Calendar className="h-3.5 w-3.5" />
        Planner
      </button>
      <button
        onClick={() => setView("generate")}
        className={cn(
          "h-8 px-3 text-xs font-medium flex items-center gap-1.5 transition-colors",
          view === "generate"
            ? "bg-background shadow-sm text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate
      </button>
    </div>
  );
}

function MobileViewSwitch() {
  const view = useUiStore((s) => s.view);
  const setView = useUiStore((s) => s.setView);

  return (
    <div className="sm:hidden flex items-center bg-muted p-0.5">
      <button
        onClick={() => setView("planner")}
        className={cn(
          "h-8 w-8 flex items-center justify-center transition-colors",
          view === "planner"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground",
        )}
        title="Planner"
      >
        <Calendar className="h-4 w-4" />
      </button>
      <button
        onClick={() => setView("generate")}
        className={cn(
          "h-8 w-8 flex items-center justify-center transition-colors",
          view === "generate"
            ? "bg-background shadow-sm text-primary"
            : "text-muted-foreground",
        )}
        title="Generate"
      >
        <Sparkles className="h-4 w-4" />
      </button>
    </div>
  );
}

export function KauHeader() {
  const navigate = useNavigate();
  const setView = useUiStore((s) => s.setView);

  return (
    <header className="bg-background border-b border-border h-14 px-3 md:px-6 flex justify-between items-center sticky top-0 z-50 shrink-0">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none group"
        onClick={() => {
          setView("planner");
          navigate({ to: "/" });
        }}
      >
        <div className="font-bold text-xl md:text-2xl tracking-tight text-foreground">
          K<span className="text-green-600 dark:text-green-400">Planner</span>
        </div>
      </div>

      <ViewSwitch />

      <nav className="flex items-center gap-2">
        <MobileViewSwitch />
        <ModeToggle />
        <div className="hidden md:block">
          <RamadanToggle />
        </div>
      </nav>
    </header>
  );
}
