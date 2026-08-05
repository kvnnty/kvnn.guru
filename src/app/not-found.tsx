"use client";

import Link from "next/link";
import FuzzyText from "@/components/fuzzy-text";

const hoverIntensity = 0.5;
const enableHover = true;

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <FuzzyText
        fontSize="clamp(10rem, 40vw, 22rem)"
        fontFamily="var(--font-instrument), ui-serif, Georgia, serif"
        fontWeight={400}
        color="#1a1916"
        baseIntensity={0.2}
        hoverIntensity={hoverIntensity}
        enableHover={enableHover}
      >
        404
      </FuzzyText>

      <h1 className="mt-6 font-display text-3xl text-foreground sm:text-4xl">
        Lost the thread
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
        This page doesn’t exist — or it wandered off somewhere quieter.
      </p>

      <Link
        href="/"
        className="mt-10 text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
      >
        Back home
      </Link>
    </div>
  );
}
