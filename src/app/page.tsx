import Image from "next/image";
import Link from "next/link";
import GradualBlur from "@/components/GradualBlur";
import { LocalTime } from "@/components/local-time";
import { NavMark } from "@/components/nav-mark";
import { SocialIcons } from "@/components/social-icons";
import NowPlaying from "@/components/spotify-integration";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

function ProjectRow({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const content = (
    <>
      <div className="relative h-11 w-11 shrink-0 sm:h-12 sm:w-12">
        <div className="absolute inset-0 overflow-hidden rounded-md ring-1 ring-border">
          {project.image ? (
            <Image
              src={project.image}
              alt=""
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface" />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-mono text-xs text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-lg text-foreground transition-colors group-hover:text-accent sm:text-xl">
            {project.name}
          </span>
        </div>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
          {project.blurb}
        </p>
      </div>
      <span className="hidden shrink-0 font-mono text-xs text-muted transition-transform group-hover:translate-x-1 sm:inline">
        {project.year} →
      </span>
    </>
  );

  const className =
    "group flex items-start gap-4 border-b border-border py-5 sm:items-center sm:gap-5 sm:py-6";

  if (project.href) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={`/work/${project.slug}`} className={className}>
      {content}
    </Link>
  );
}

export default function Home() {
  return (
    <section
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <div
        style={{ height: "100%", overflowY: "auto", padding: "6rem 2rem" }}
      >
        <div className="relative mx-auto max-w-3xl sm:px-2 lg:px-4">
          <nav className="flex items-center justify-between gap-4">
            <NavMark />
            <div className="flex items-center gap-5 text-sm text-muted">
              <a href="#work" className="hover:text-foreground">
                Work
              </a>
              <Link href="/stats" className="hover:text-foreground">
                Stats & Activity
              </Link>
              <a href="#connect" className="hover:text-foreground">
                Contact
              </a>
              <a
                href={`mailto:${site.email}`}
                className="rounded-full bg-foreground px-3.5 py-1.5 text-surface transition-opacity hover:opacity-80"
              >
                Email
              </a>
            </div>
          </nav>

          <header className="mt-16 sm:mt-20">
            <div className="overflow-hidden rounded-2xl ring-1 ring-border">
              <Image
                src={site.heroImage}
                alt=""
                width={1376}
                height={768}
                priority
                className="aspect-[16/9] w-full object-cover"
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <span>{site.location}</span>
              {site.available && (
                <>
                  <span className="text-border" aria-hidden>
                    /
                  </span>
                  <span className="inline-flex items-center gap-2 text-accent">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-accent"
                      aria-hidden
                    />
                    Available for work
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.5rem,8vw,4.25rem)] leading-[1.05] tracking-tight text-foreground">
              {site.name}
            </h1>

            <p className="mt-4 max-w-lg text-xl leading-snug text-muted sm:text-2xl text-balance">
              {site.tagline}
            </p>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              {site.bio}
            </p>

            <p className="mt-7 text-sm text-muted">
              Currently {site.currently.role} at{" "}
              <a
                href={site.currently.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-accent"
              >
                {site.currently.company}
              </a>
            </p>
          </header>

          <figure className="mt-14 border-l-2 border-accent pl-5 sm:mt-16 sm:pl-7">
            <blockquote className="text-xl leading-relaxed text-foreground sm:text-2xl text-balance">
              “{site.quotes[0].text}”
            </blockquote>
            <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              — {site.quotes[0].author}
            </figcaption>
          </figure>

          <section id="work" className="mt-20 scroll-mt-10 sm:mt-24">
            <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
              <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                Selected work
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {String(projects.length).padStart(2, "0")}
              </span>
            </div>

            <ul className="mt-1">
              {projects.map((project, index) => (
                <li key={project.slug}>
                  <ProjectRow project={project} index={index} />
                </li>
              ))}
            </ul>

            <p className="mt-8">
              <a
                href={site.cvMailto.href}
                className="text-sm text-foreground underline decoration-border underline-offset-4 hover:decoration-accent"
              >
                {site.cvMailto.label} →
              </a>
            </p>
          </section>

          <section className="mt-20 grid gap-10 sm:mt-24 sm:grid-cols-2 sm:gap-12">
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                How I work
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                I care about architecture that lasts, product taste, and shipping
                before the idea goes cold. Most of my time lives at the edge of
                AI, systems, and interfaces—building things people open twice.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="text-sm text-muted-foreground font-mono">ELSEWHERE</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "GitHub", handle: "@kvnnty", url: "https://github.com/kvnnty" },
                  { name: "LinkedIn", handle: "@tkevin", url: "https://www.linkedin.com/in/tkevin" },
                  { name: "X", handle: "@kvnnty", url: "https://x.com/kvnnty" },
                  { name: "Buy me a beer", handle: "@kvnnty", url: "https://buymeacoffee.com/kvnnty" },
                ].map((social) => (
                  <Link
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    className={clsx("group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm")}>
                    <div className="space-y-2">
                      <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">{social.name}</div>
                      <div className="text-sm text-muted-foreground">{social.handle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <h2 className="mt-10 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Let&apos;s talk
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Open to collaborations, product challenges, and sharp conversations
              about building software that holds up.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-block text-xl text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent sm:text-2xl"
            >
              {site.email}
            </a>
            <SocialIcons className="mt-10" />
          </section>

          <footer className="mt-24 space-y-6 border-t border-border pt-8 pb-8">
            <NowPlaying />
            <div className="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} {site.name}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em]">
                Kigali <span className="text-border">/</span> <LocalTime />{" "}
                <span className="text-border">/</span> CAT
              </p>
            </div>
          </footer>
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
