import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "navy",
  ...props
}: ComponentProps<"span"> & {
  tone?: "navy" | "primary" | "ok" | "warn" | "danger" | "rest" | "muted";
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy text-navy-fg",
    primary: "bg-primary text-primary-fg",
    ok: "bg-ok-fg text-ok",
    warn: "bg-warn-fg text-warn",
    danger: "bg-danger-fg text-danger",
    rest: "bg-rest-fg text-rest",
    muted: "bg-surface-2 text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
