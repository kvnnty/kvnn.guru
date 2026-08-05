export type Project = {
  slug: string;
  name: string;
  blurb: string;
  year: string;
  image?: string;
  href?: string;
};

export const projects: Project[] = [
  {
    slug: "arcon",
    name: "Arcon",
    blurb:
      "Feed it a product. Get a launch video—voice, music, motion, and a story that sells.",
    year: "2025",
    image: "https://rstr.in/monogram/backdrops/nql09SK5zGy",
  },
  {
    slug: "sploy",
    name: "Sploy",
    blurb:
      "Talk to your database like a teammate. Insights, root causes, and next moves—not another dashboard.",
    year: "2025",
    image: "https://rstr.in/monogram/backdrops/FkLuyE_CZ7w",
  },
  {
    slug: "droidstack",
    name: "DroidStack",
    blurb:
      "Real Android hardware in the cloud. Automate, test, deploy, and remote in without a desk full of phones.",
    year: "2024",
    image: "https://rstr.in/monogram/backdrops/L-_juDKvdJE",
  },
  {
    slug: "nimbus-drive",
    name: "Nimbus Drive",
    blurb:
      "Secure cloud storage and collaboration—files, permissions, and sync that stay out of the way.",
    year: "2025",
    image: "https://rstr.in/monogram/backdrops/rjF_rx69Jsw",
  },
  {
    slug: "growstack",
    name: "GrowStack AI",
    blurb:
      "AI marketing workflows that run across channels without babysitting every step.",
    year: "2024",
    image: "https://rstr.in/monogram/backdrops/f4YN2FhSGeS",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? projects[i - 1] : null,
    next: i >= 0 && i < projects.length - 1 ? projects[i + 1] : null,
  };
}
