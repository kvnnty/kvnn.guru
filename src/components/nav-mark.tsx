import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";

export function NavMark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
    >
      <span className="overflow-hidden rounded-full ring-1 ring-border">
        <Image
          src={site.avatar}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-cover"
          priority
        />
      </span>
      <span className="font-mono text-sm tracking-[0.12em]">index</span>
    </Link>
  );
}
