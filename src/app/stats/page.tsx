import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GradualBlur from "@/components/GradualBlur";
import { StatsGrid } from "@/components/stats/stats-grid";
import { NavMark } from "@/components/nav-mark";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Stats & Activity",
  description: `Stats and activity for ${site.name} — GitHub, WakaTime, chess, gaming, and more.`,
  openGraph: {
    title: `Stats & Activity — ${site.name}`,
    description:
      "Personal stats and activity: code, WakaTime, chess, gaming, and latest posts.",
  },
};

export const revalidate = 300;

export default function StatsPage() {
  return (
    <section
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <div
        style={{ height: "100%", overflowY: "auto", padding: "4rem 1.5rem" }}
      >
        <div className="relative mx-auto max-w-5xl sm:px-2 lg:px-4">
          <nav className="flex items-center justify-between gap-4">
            <NavMark label="stats & activity" />
            <div className="flex items-center gap-5 text-sm text-muted">
              <Link href="/#work" className="hover:text-foreground">
                Work
              </Link>
              <Link href="/#connect" className="hover:text-foreground">
                Contact
              </Link>
              <a
                href={`mailto:${site.email}`}
                className="rounded-full bg-foreground px-3.5 py-1.5 text-surface transition-opacity hover:opacity-80"
              >
                Email
              </a>
            </div>
          </nav>

          <header className="mt-14 sm:mt-16">
            <div className="overflow-hidden rounded-2xl ring-1 ring-border">
              <Image
                src={site.statsImages.hero}
                alt=""
                width={1376}
                height={768}
                priority
                className="aspect-[16/9] max-h-[22rem] w-full object-cover"
              />
            </div>

            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Stats & Activity
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] tracking-tight text-foreground">
              What I&apos;m up to
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
              Code, coding time, games, and posts — pulled from the tools I use
              on a day-to-day basis.
            </p>
          </header>

          <div className="mt-10 sm:mt-12">
            <StatsGrid />
          </div>

          <div className="pb-16" />
        </div>
      </div>

      <GradualBlur
        target="parent"
        position="bottom"
        height="3rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential={true}
        opacity={1}
      />
    </section>
  );
}
