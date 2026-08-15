import { useRef, ChangeEvent, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface GenTimeInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

function parseValue(val: string) {
  if (!val) return { hh: "", mm: "", aa: "AM" };
  const parts = val.split(" ");
  if (parts.length < 2) return { hh: "", mm: "", aa: "AM" };
  const [time, period] = parts;
  const [h, m] = time.split(":");
  return { hh: h || "", mm: m || "", aa: period || "AM" };
}

export function GenTimeInput({ value, onChange, className }: GenTimeInputProps) {
  const { hh, mm, aa } = parseValue(value);
  const hourRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLSelectElement>(null);

  const update = (h: string, m: string, p: string) => {
    if (!h && !m) return onChange("");
    onChange(`${h}:${m} ${p}`);
  };

  const handleHour = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    const n = parseInt(v);
    if (!isNaN(n) && n > 12) v = "12";
    if (v === "00") v = "12";
    update(v, mm, aa);
    if (v.length === 2) minRef.current?.focus();
  };

  const handleMin = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    const n = parseInt(v);
    if (!isNaN(n) && n > 59) v = "59";
    update(hh, v, aa);
    if (v.length === 2) periodRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>, field: "hh" | "mm") => {
    if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "") {
      if (field === "mm") hourRef.current?.focus();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-background border border-input h-9 px-2 focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-ring transition-all",
        className,
      )}
      dir="ltr"
    >
      <input
        ref={hourRef}
        type="text"
        value={hh}
        onChange={handleHour}
        onKeyDown={(e) => handleKey(e, "hh")}
        placeholder="HH"
        maxLength={2}
        className="w-7 text-center bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/40"
      />
      <span className="text-muted-foreground font-bold">:</span>
      <input
        ref={minRef}
        type="text"
        value={mm}
        onChange={handleMin}
        onKeyDown={(e) => handleKey(e, "mm")}
        placeholder="MM"
        maxLength={2}
        className="w-7 text-center bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/40"
      />
      <select
        ref={periodRef}
        value={aa}
        onChange={(e) => update(hh, mm, e.target.value)}
        className="bg-muted/50 px-1 py-1 text-[10px] font-bold text-muted-foreground outline-none border-none cursor-pointer hover:bg-muted ml-1"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
