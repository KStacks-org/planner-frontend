import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { RamadanToggle } from "./RamadanToggle";

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function KauHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* --- LEFT SIDE: Logo --- */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none group"
        onClick={() => navigate({ to: "/" })}
      >
        <div className="font-bold text-2xl tracking-tight text-foreground">
          K<span className="text-green-600 dark:text-green-400">Planner</span>
        </div>
      </div>

      {/* --- RIGHT SIDE: Actions --- */}
      <nav className="flex items-center gap-3">
        <ModeToggle />
        <RamadanToggle />
      </nav>
    </header>
  );
}
