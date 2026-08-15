import { useEffect, useState } from "react";
import { useScheduleStore } from "@/lib/schedule-store";

function BootLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black text-foreground"
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <span className="text-white/80" aria-hidden="true">
          Loading…
        </span>
      </div>
    </div>
  );
}

export function BootGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;

    // Fire-and-forget: refresh course data for the active planner tab.
    useScheduleStore.getState().syncActiveTabCourses?.();

    (async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {}

      if (document.readyState !== "complete") {
        await new Promise<void>((res) => {
          window.addEventListener("load", () => res(), { once: true });
        });
      }

      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      if (!disposed) setReady(true);
    })();

    // Safety net: never leave the user stuck on the loader.
    const safety = window.setTimeout(() => {
      if (!disposed) setReady(true);
    }, 2000);

    return () => {
      disposed = true;
      window.clearTimeout(safety);
    };
  }, []);

  if (!ready) return <BootLoader />;
  return <>{children}</>;
}
