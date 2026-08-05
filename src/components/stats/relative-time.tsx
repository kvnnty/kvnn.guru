"use client";

import { relativeTime } from "@/lib/stats/utils";

/** Client-safe relative time — avoids SSR/client Date.now() hydration mismatches */
export function RelativeTime({
  date,
  className,
}: {
  date: string | number | Date;
  className?: string;
}) {
  return (
    <span className={className} suppressHydrationWarning>
      {relativeTime(date)}
    </span>
  );
}
