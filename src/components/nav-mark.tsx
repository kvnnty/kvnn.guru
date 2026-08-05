import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";

export function NavMark({ label = "index" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-foreground">
      <Link
        href="/"
        className="overflow-hidden rounded-full ring-1 ring-border transition-opacity hover:opacity-80"
        aria-label="Home"
      >
        <Image
          src={site.avatar}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-cover"
          priority
        />
      </Link>
      <span className="font-mono text-sm tracking-[0.12em]">{label}</span>
    </span>
  );
}
