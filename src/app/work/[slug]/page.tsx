import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NavMark } from "@/components/nav-mark";
import { getAdjacentProjects, getProject, projects } from "@/data/projects";
import { site } from "@/data/site";

const details: Record<string, { summary: string; points: string[] }> = {
  arcon: {
    summary:
      "Arcon is my flagship SaaS—an AI motion platform that turns a product URL, screenshots, or a brief into polished launch videos with voice, music, animation, and storytelling.",
    points: [
      "Ingest from URL, screenshots, or a structured brief",
      "Compose scenes with voice and music as one narrative",
      "Export formats tuned for product launches",
    ],
  },
  sploy: {
    summary:
      "Sploy is AI decision intelligence for businesses. Natural-language analytics over live databases—insights, root-cause analysis, recommendations, and collaboration.",
    points: [
      "Ask questions the way you'd ask a teammate",
      "Surface root causes and concrete next steps",
      "Share decisions without drowning in dashboards",
    ],
  },
  droidstack: {
    summary:
      "DroidStack orchestrates physical Android devices in the cloud—automation, testing, deployments, and remote access on real hardware.",
    points: [
      "Fleet orchestration and device health",
      "Automation hooks for test and deploy pipelines",
      "Remote sessions when you need the real thing",
    ],
  },
  "nimbus-drive": {
    summary:
      "Nimbus Drive is a secure cloud storage and collaboration platform—built for files, permissions, and real-time sync without the usual clutter.",
    points: [
      "Secure file storage with clear permission models",
      "Collaboration that stays fast under real usage",
      "Cloud infrastructure on GCP with event-driven pieces",
    ],
  },
  growstack: {
    summary:
      "GrowStack AI is an AI-powered marketing platform for automated workflows across channels—led end to end as lead developer.",
    points: [
      "Automated marketing workflows across channels",
      "Infrastructure with AWS, MCP, and Terraform",
      "Web and mobile surfaces with Next.js and React Native",
    ],
  },
  webbuddy: {
    summary:
      "At WebBuddy I ship AI-driven web and mobile products for clients—speed without sacrificing quality.",
    points: [
      "Full-stack delivery with React, Next.js, and NestJS",
      "GraphQL APIs and product-facing interfaces",
      "Client work that has to hold up in production",
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.blurb,
    openGraph: {
      title: `${project.name} — ${site.name}`,
      description: project.blurb,
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const detail = details[slug];
  const { prev, next } = getAdjacentProjects(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-10">
      <nav className="flex items-center justify-between gap-4">
        <NavMark />
        <Link
          href="/#work"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← All work
        </Link>
      </nav>

      <article className="mt-12 sm:mt-16">
        {project.image && (
          <div className="overflow-hidden rounded-2xl ring-1 ring-border">
            <Image
              src={project.image}
              alt=""
              width={1376}
              height={768}
              priority
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {project.year}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,7vw,3.75rem)] leading-[1.05] tracking-tight text-foreground">
          {project.name}
        </h1>
        <p className="mt-5 max-w-2xl text-xl leading-snug text-muted sm:text-2xl text-balance">
          {project.blurb}
        </p>
        <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
          {detail?.summary}
        </p>

        {detail && (
          <ul className="mt-10 space-y-3 border-t border-border pt-8">
            {detail.points.map((point) => (
              <li
                key={point}
                className="flex gap-3 text-[15px] leading-relaxed text-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        )}

        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block text-sm text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          >
            Visit site →
          </a>
        )}
      </article>

      <nav
        className="mt-20 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:justify-between"
        aria-label="Adjacent projects"
      >
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="group max-w-xs">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Previous
            </p>
            <p className="mt-2 text-xl text-foreground group-hover:text-accent">
              {prev.name}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}`} className="group max-w-xs sm:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Next
            </p>
            <p className="mt-2 text-xl text-foreground group-hover:text-accent">
              {next.name}
            </p>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
