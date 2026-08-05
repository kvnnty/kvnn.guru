export const statsConfig = {
  github: {
    username: "kvnnty",
  },
  chess: {
    username: "",
  },
  playstation: {
    onlineId: "kvnnty",
  },
  x: {
    username: "kvnnty",
    maxPosts: 4,
    hideReposts: false,
    hideReplies: true,
  },
  wakatime: {
    username: "kvnnty",
    range: "last_7_days" as const,
  },
  cache: {
    github: 300,
    chess: 600,
    playstation: 900,
    x: 1800,
    spotify: 15,
    wakatime: 600,
  },
} as const;

export const wakatimeFallback = {
  source: "fallback" as const,
  username: statsConfig.wakatime.username,
  profileUrl: `https://wakatime.com/@${statsConfig.wakatime.username}`,
  range: statsConfig.wakatime.range,
  totalSeconds: 0,
  humanReadableTotal: "0 hrs",
  dailyAverageSeconds: 0,
  humanReadableDailyAverage: "0 hrs",
  aiDrivenPercent: 0,
  aiLineChanges: 0,
  humanLineChanges: 0,
  inputTokens: 0,
  outputTokens: 0,
  prompts: 0,
  topModel: null as {
    name: string;
    lines: number;
    cost: number;
  } | null,
  languages: [] as { name: string; percent: number; text: string }[],
  editors: [] as { name: string; percent: number; text: string }[],
  activity: [
    { day: "Mon", seconds: 0 },
    { day: "Tue", seconds: 0 },
    { day: "Wed", seconds: 0 },
    { day: "Thu", seconds: 0 },
    { day: "Fri", seconds: 0 },
    { day: "Sat", seconds: 0 },
    { day: "Sun", seconds: 0 },
  ],
};

export const playstationFallback = {
  source: "fallback" as const,
  onlineId: statsConfig.playstation.onlineId,
  currentlyPlaying: null as {
    title: string;
    imageUrl: string | null;
    platform: string;
  } | null,
  recentlyPlayed: [
    {
      title: "Fortnite",
      imageUrl: "/fortnite.jpg",
      lastPlayed: "20 May",
      platform: "PS4",
    },
  ],
  trophies: {
    total: 0,
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  },
  recentAchievements: [] as {
    name: string;
    game: string;
    rarity: string;
    earnedAt: string;
  }[],
  lastOnline: "20 May" as string | null,
  available: false,
};
