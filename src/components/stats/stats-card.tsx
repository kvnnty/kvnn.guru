import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatsCard({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = cn(
    "flex flex-col rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6",
    "transition-[box-shadow,ring-color] duration-300 hover:ring-foreground/15",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return <div className={classes}>{children}</div>;
}

export function StatsCardHeader({
  label,
  meta,
  href,
}: {
  label: string;
  meta?: string;
  href?: string;
}) {
  const title = (
    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
      {label}
    </span>
  );

  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          {title}
        </a>
      ) : (
        title
      )}
      {meta ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted/70">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export function StatsStat({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}) {
  return (
    <div>
      <div className="text-xl tracking-tight text-foreground sm:text-2xl">
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
    </div>
  );
}

export function StatsCardSkeleton({
  className,
  lines = 4,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl bg-surface p-5 ring-1 ring-border sm:p-6",
        className,
      )}
      aria-hidden
    >
      <div className="mb-5 h-3 w-16 animate-pulse rounded bg-border/60" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-border/50"
            style={{ width: `${70 - i * 12}%` }}
          />
        ))}
      </div>
      <div className="mt-6 flex gap-6">
        <div className="h-8 w-12 animate-pulse rounded bg-border/50" />
        <div className="h-8 w-12 animate-pulse rounded bg-border/50" />
        <div className="h-8 w-12 animate-pulse rounded bg-border/50" />
      </div>
    </div>
  );
}

export function StatsEmpty({ message }: { message: string }) {
  return (
    <p className="text-sm leading-relaxed text-muted">{message}</p>
  );
}
