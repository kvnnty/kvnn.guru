export const site = {
  name: "Kevin Tuyizere",
  shortName: "kvnn",
  title: "Software engineer & product builder",
  location: "Kigali, Rwanda",
  available: true,
  email: "contact@kvnn.guru",
  url: "https://kvnn.guru",
  tagline: "I build tools that feel inevitable once they exist.",
  bio: "Full-stack engineer focused on AI products, systems that hold up, and interfaces people trust. Based in Kigali—shipping for the world.",
  description:
    "Kevin Tuyizere is a software engineer and product builder in Kigali. Creator of Arcon, Sploy, and DroidStack.",
  // Illustrations sourced from https://raster.app/changelog
  heroImage: "https://rstr.in/monogram/backdrops/nADH-APGYGX",
  avatar: "https://rstr.in/monogram/backdrops/uyEOXOz6AqJ",
  currently: {
    role: "Full Stack Engineer",
    company: "WebBuddy",
    url: "https://www.webbuddy.agency",
  },
  quotes: [
    {
      text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
      author: "Mahatma Gandhi",
    },
    {
      text: "The details are not the details. They make the design.",
      author: "Charles Eames",
    },
  ],
  socials: [
    { id: "github", label: "GitHub", href: "https://github.com/kvnnty" },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/kvnnty" },
    { id: "x", label: "X", href: "https://x.com/kvnnty" },
    { id: "coffee", label: "Buy me a beer", href: "https://buymeacoffee.com/kvnnty" },
  ],
  cvMailto: {
    href: "mailto:contact@kvnn.guru?subject=Request%20for%20CV&body=Hi%20Kevin%2C%20I%20came%20across%20your%20portfolio%20and%20would%20love%20to%20read%20your%20CV.%20Thank%20you!",
    label: "Read CV for more",
  },
} as const;
