import Link from "next/link";

export default function WorkNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl text-foreground">
        Project not found
      </h1>
      <Link
        href="/#work"
        className="mt-8 inline-block text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
      >
        ← All work
      </Link>
    </div>
  );
}
