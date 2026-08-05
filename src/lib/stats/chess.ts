import { statsConfig } from "@/data/stats";
import type { ChessGame, ChessStatsData } from "./types";
import { safeJson } from "./utils";

const CHESS_API = "https://api.chess.com/pub";
const CHESS_CALLBACK = "https://www.chess.com/callback";

const FETCH_HEADERS = {
  "User-Agent": "kvnn-portfolio",
  Accept: "application/json",
};

function emptyChess(username: string): ChessStatsData {
  return {
    source: "unavailable",
    username,
    profileUrl: `https://www.chess.com/member/${username}`,
    currentRating: null,
    peakRating: null,
    ratingHistory: [],
    record: { wins: 0, losses: 0, draws: 0 },
    streak: { type: null, count: 0 },
    recentGames: [],
  };
}

interface ChessStats {
  chess_rapid?: {
    last?: { rating: number };
    best?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
  chess_blitz?: {
    last?: { rating: number };
    best?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
  chess_bullet?: {
    last?: { rating: number };
    best?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
}

interface ChessArchives {
  archives: string[];
}

interface ChessArchiveGame {
  url: string;
  time_class: string;
  end_time: number;
  white: { username: string; result: string; rating: number };
  black: { username: string; result: string; rating: number };
}

interface ChessGamesResponse {
  games: ChessArchiveGame[];
}

/** Unofficial site callback — used when api.chess.com PubAPI is unreachable. */
interface CallbackMemberStats {
  stats?: Array<{
    key: string;
    stats?: {
      rating?: number;
      highest_rating?: number;
      total_win_count?: number;
      total_loss_count?: number;
      total_draw_count?: number;
    };
    lastPlayed?: boolean;
  }>;
}

function normalizeResult(
  result: string,
): "win" | "loss" | "draw" {
  if (result === "win") return "win";
  if (
    result === "agreed" ||
    result === "stalemate" ||
    result === "repetition" ||
    result === "insufficient" ||
    result === "50move" ||
    result === "timevsinsufficient"
  ) {
    return "draw";
  }
  return "loss";
}

function computeStreak(
  games: ChessGame[],
): ChessStatsData["streak"] {
  if (!games.length) return { type: null, count: 0 };
  const type = games[0].result;
  let count = 0;
  for (const g of games) {
    if (g.result !== type) break;
    count += 1;
  }
  return { type, count };
}

function fromPubPools(
  pools: NonNullable<ChessStats[keyof ChessStats]>[],
): Pick<
  ChessStatsData,
  "currentRating" | "peakRating" | "record"
> {
  const primary = pools[0];
  const currentRating = primary?.last?.rating ?? null;
  const peakRating =
    Math.max(...pools.map((p) => p?.best?.rating ?? 0), 0) || null;

  const record = pools.reduce(
    (acc, p) => ({
      wins: acc.wins + (p?.record?.win ?? 0),
      losses: acc.losses + (p?.record?.loss ?? 0),
      draws: acc.draws + (p?.record?.draw ?? 0),
    }),
    { wins: 0, losses: 0, draws: 0 },
  );

  return { currentRating, peakRating, record };
}

async function fetchRecentFromPub(
  username: string,
): Promise<{ recentGames: ChessGame[]; ratingHistory: number[] }> {
  const archivesRes = await fetch(
    `${CHESS_API}/player/${username}/games/archives`,
    {
      headers: FETCH_HEADERS,
      next: { revalidate: statsConfig.cache.chess },
    },
  );
  const archives = await safeJson<ChessArchives>(archivesRes);
  const latest = archives?.archives?.at(-1);

  if (!latest) return { recentGames: [], ratingHistory: [] };

  const gamesRes = await fetch(latest, {
    headers: FETCH_HEADERS,
    next: { revalidate: statsConfig.cache.chess },
  });
  const gamesData = await safeJson<ChessGamesResponse>(gamesRes);
  const games = [...(gamesData?.games ?? [])].reverse();

  const recentGames = games.slice(0, 5).map((g) => {
    const isWhite =
      g.white.username.toLowerCase() === username.toLowerCase();
    const me = isWhite ? g.white : g.black;
    const opp = isWhite ? g.black : g.white;
    return {
      opponent: opp.username,
      result: normalizeResult(me.result),
      timeClass: g.time_class,
      playedAt: new Date(g.end_time * 1000).toISOString(),
      url: g.url,
    };
  });

  const ratingHistory = games.slice(-12).map((g) => {
    const isWhite =
      g.white.username.toLowerCase() === username.toLowerCase();
    return isWhite ? g.white.rating : g.black.rating;
  });

  return { recentGames, ratingHistory };
}

async function getChessStatsFromPub(
  username: string,
): Promise<ChessStatsData | null> {
  const statsRes = await fetch(
    `${CHESS_API}/player/${username}/stats`,
    {
      headers: FETCH_HEADERS,
      next: { revalidate: statsConfig.cache.chess },
    },
  );

  const stats = await safeJson<ChessStats>(statsRes);
  if (!stats) return null;

  const pools = [
    stats.chess_rapid,
    stats.chess_blitz,
    stats.chess_bullet,
  ].filter(Boolean) as NonNullable<ChessStats[keyof ChessStats]>[];

  if (!pools.length) return null;

  const { currentRating, peakRating, record } = fromPubPools(pools);
  const { recentGames, ratingHistory } =
    await fetchRecentFromPub(username);

  return {
    source: "synced",
    username,
    profileUrl: `https://www.chess.com/member/${username}`,
    currentRating,
    peakRating,
    ratingHistory,
    record,
    streak: computeStreak(recentGames),
    recentGames,
  };
}

async function getChessStatsFromCallback(
  username: string,
): Promise<ChessStatsData | null> {
  const res = await fetch(
    `${CHESS_CALLBACK}/member/stats/${encodeURIComponent(username)}`,
    {
      headers: FETCH_HEADERS,
      next: { revalidate: statsConfig.cache.chess },
    },
  );

  const data = await safeJson<CallbackMemberStats>(res);
  if (!data?.stats?.length) return null;

  // Site keys: rapid, lightning (blitz), bullet — prefer in that order
  const byKey = Object.fromEntries(
    data.stats.map((s) => [s.key, s]),
  );

  const ordered = ["rapid", "lightning", "bullet"]
    .map((k) => byKey[k])
    .filter(Boolean);

  const withRating = ordered.filter((s) => s.stats?.rating != null);
  if (!withRating.length) return null;

  // Prefer the pool marked lastPlayed, else first available in priority order
  const primary =
    withRating.find((s) => s.lastPlayed) ?? withRating[0];

  const currentRating = primary.stats?.rating ?? null;
  const peakRating =
    Math.max(
      ...withRating.map((s) => s.stats?.highest_rating ?? 0),
      0,
    ) || null;

  const record = withRating.reduce(
    (acc, s) => ({
      wins: acc.wins + (s.stats?.total_win_count ?? 0),
      losses: acc.losses + (s.stats?.total_loss_count ?? 0),
      draws: acc.draws + (s.stats?.total_draw_count ?? 0),
    }),
    { wins: 0, losses: 0, draws: 0 },
  );

  return {
    source: "synced",
    username,
    profileUrl: `https://www.chess.com/member/${username}`,
    currentRating,
    peakRating,
    ratingHistory: [],
    record,
    streak: { type: null, count: 0 },
    recentGames: [],
  };
}

export async function getChessStats(): Promise<ChessStatsData> {
  const username = statsConfig.chess.username;

  if (!username) {
    return {
      ...emptyChess(""),
      profileUrl: "https://www.chess.com",
    };
  }

  try {
    const fromPub = await getChessStatsFromPub(username);
    if (fromPub) return fromPub;

    const fromCallback = await getChessStatsFromCallback(username);
    if (fromCallback) return fromCallback;

    return emptyChess(username);
  } catch (error) {
    console.error("Chess fetch failed:", error);
    return emptyChess(username);
  }
}
