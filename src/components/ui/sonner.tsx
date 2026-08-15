"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Boxy — no rounded corners, KPlanner-style
          "--border-radius": "0px",

          // Base
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",

          // Success = primary green
          "--success-bg": "var(--popover)",
          "--success-text": "var(--primary)",
          "--success-border": "var(--primary)",

          // Info = subtle
          "--info-bg": "var(--popover)",
          "--info-text": "var(--foreground)",
          "--info-border": "var(--border)",

          // Warning = amber
          "--warning-bg": "var(--popover)",
          "--warning-text": "oklch(0.65 0.15 70)",
          "--warning-border": "oklch(0.65 0.15 70)",

          // Error = destructive
          "--error-bg": "var(--popover)",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--destructive)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "!rounded-none !border-l-4 !shadow-sm !font-sans",
          title: "!font-semibold !text-sm",
          description: "!text-xs !opacity-80",
          actionButton:
            "!rounded-none !bg-primary !text-primary-foreground !font-semibold",
          cancelButton:
            "!rounded-none !bg-muted !text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
