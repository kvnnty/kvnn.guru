export type StatsSource = "synced" | "estimated" | "fallback" | "unavailable";

export interface GithubCommit {
  message: string;
  repo: string;
  url: string;
  date: string;
}

export interface GithubStatsData {
  source: StatsSource;
  username: string;
  profileUrl: string;
  streak: number;
  contributionsThisWeek: number;
  contributionsThisYear: number;
  recentCommits: GithubCommit[];
}

export interface ChessGame {
  opponent: string;
  result: "win" | "loss" | "draw";
  timeClass: string;
  playedAt: string;
  url: string;
}

export interface ChessStatsData {
  source: StatsSource;
  username: string;
  profileUrl: string;
  currentRating: number | null;
  peakRating: number | null;
  ratingHistory: number[];
  record: { wins: number; losses: number; draws: number };
  streak: { type: "win" | "loss" | "draw" | null; count: number };
  recentGames: ChessGame[];
}

export interface PlaystationGame {
  title: string;
  imageUrl: string | null;
  lastPlayed: string;
  platform: string;
}

export interface PlaystationAchievement {
  name: string;
  game: string;
  rarity: string;
  earnedAt: string;
}

export interface PlaystationStatsData {
  source: StatsSource;
  onlineId: string;
  currentlyPlaying: {
    title: string;
    imageUrl: string | null;
    platform: string;
  } | null;
  recentlyPlayed: PlaystationGame[];
  trophies: {
    total: number;
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  recentAchievements: PlaystationAchievement[];
  lastOnline: string | null;
  available: boolean;
}

export interface XPost {
  id: string;
  text: string;
  url: string;
  createdAt: string;
  imageUrl: string | null;
  likes: number | null;
  replies: number | null;
  isRepost: boolean;
  author: string | null;
}

export interface XStatsData {
  source: StatsSource;
  username: string;
  profileUrl: string;
  posts: XPost[];
}

export interface SpotifyTrack {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  isPlaying: boolean;
}

export interface SpotifyStatsData {
  source: StatsSource;
  track: SpotifyTrack | null;
}

export interface WakaTimeLanguage {
  name: string;
  percent: number;
  text: string;
}

export interface WakaTimeEditor {
  name: string;
  percent: number;
  text: string;
}

export interface WakaTimeModel {
  name: string;
  lines: number;
  cost: number;
}

export interface WakaTimeActivityPoint {
  day: string;
  seconds: number;
}

export interface WakaTimeStatsData {
  source: StatsSource;
  username: string;
  profileUrl: string;
  range: "last_7_days";
  totalSeconds: number;
  humanReadableTotal: string;
  dailyAverageSeconds: number;
  humanReadableDailyAverage: string;
  aiDrivenPercent: number;
  aiLineChanges: number;
  humanLineChanges: number;
  inputTokens: number;
  outputTokens: number;
  prompts: number;
  topModel: WakaTimeModel | null;
  languages: WakaTimeLanguage[];
  editors: WakaTimeEditor[];
  activity: WakaTimeActivityPoint[];
}
