"use client";

import { useEffect, useState } from "react";

const TIME_ZONE = "Africa/Kigali";

function formatKigaliTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatKigaliTime(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      dateTime={time ?? undefined}
      className="tabular-nums"
      title="Current time in Kigali, Rwanda (CAT, UTC+2)"
      suppressHydrationWarning
    >
      {time ?? "--:--:--"}
    </time>
  );
}
