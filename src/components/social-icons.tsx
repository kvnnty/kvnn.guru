import { Coffee, Github, Linkedin, type LucideIcon } from "lucide-react";
import { site } from "@/data/site";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.451L1.5 2.25h7.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const icons: Record<(typeof site.socials)[number]["id"], LucideIcon | typeof XIcon> = {
  github: Github,
  linkedin: Linkedin,
  x: XIcon,
  coffee: Coffee,
};

export function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`}>
      {site.socials.map((social) => {
        const Icon = icons[social.id];
        return (
          <li key={social.href}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Icon className="size-4 shrink-0" />
              {social.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
