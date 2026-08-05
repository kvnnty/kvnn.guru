import { cn } from "@/lib/utils";

/** Minimal bar chart — grayscale, with quiet hover detail */
export function ActivityBars({
  data,
  className,
}: {
  data: { label: string; value: number; detail?: string }[];
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex items-end gap-1.5 pt-6", className)}>
      {data.map((d, i) => {
        const height = Math.max(
          d.value > 0 ? 8 : 3,
          Math.round((d.value / max) * 100),
        );
        const tip = d.detail ?? `${d.label}: ${d.value}`;

        return (
          <div
            key={`${d.label}-${i}`}
            className="group relative flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              role="tooltip"
              className={cn(
                "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2",
                "whitespace-nowrap font-mono text-[10px] tracking-wide text-muted",
                "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
              )}
            >
              {tip}
            </div>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-1.5 outline-none"
              aria-label={tip}
            >
              <div className="flex h-16 w-full items-end">
                <div
                  className="w-full rounded-sm bg-foreground/80 transition-[opacity,background-color] duration-300 group-hover:bg-foreground"
                  style={{
                    height: `${height}%`,
                    opacity:
                      d.value > 0 ? 0.35 + (d.value / max) * 0.65 : 0.15,
                  }}
                />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                {d.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Compact sparkline for rating history */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const pad = 2;

  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-8 w-full text-foreground", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.7"
      />
    </svg>
  );
}

/** Horizontal language share bars */
export function LanguageBars({
  languages,
}: {
  languages: { name: string; share: number }[];
}) {
  if (!languages.length) return null;

  return (
    <div className="space-y-2.5">
      {languages.map((lang) => (
        <div key={lang.name}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-xs text-foreground">{lang.name}</span>
            <span className="font-mono text-[10px] text-muted">
              {Math.round(lang.share * 100)}%
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all duration-700"
              style={{ width: `${Math.max(4, lang.share * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Provider / share distribution as a single segmented bar */
export function SegmentedBar({
  segments,
}: {
  segments: { id: string; label: string; share: number }[];
}) {
  return (
    <div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-border/60">
        {segments.map((s, i) => (
          <div
            key={s.id}
            className="h-full bg-foreground transition-all duration-500"
            style={{
              width: `${s.share * 100}%`,
              opacity: 0.25 + (i / Math.max(segments.length - 1, 1)) * 0.75,
            }}
            title={`${s.label}: ${Math.round(s.share * 100)}%`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {segments.slice(0, 5).map((s) => (
          <span key={s.id} className="font-mono text-[10px] text-muted">
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
