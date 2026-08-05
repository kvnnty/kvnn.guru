import { statsConfig } from "@/data/stats";
import type { ChessGame, ChessStatsData } from "./types";
import { safeJson } from "./utils";

const CHESS_API = "https://api.chess.com/pub";

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

export async function getChessStats(): Promise<ChessStatsData> {
  const username =
    process.env.CHESS_USERNAME || statsConfig.chess.username;

  if (!username) {
    return {
      ...emptyChess(""),
      profileUrl: "https://www.chess.com",
    };
  }

  try {
    const statsRes = await fetch(
      `${CHESS_API}/player/${username}/stats`,
      {
        headers: { "User-Agent": "kvnn-portfolio" },
        next: { revalidate: statsConfig.cache.chess },
      },
    );

    const stats = await safeJson<ChessStats>(statsRes);
    if (!stats) return emptyChess(username);

    // Prefer rapid, then blitz, then bullet
    const pools = [
      stats.chess_rapid,
      stats.chess_blitz,
      stats.chess_bullet,
    ].filter(Boolean);

    const primary = pools[0];
    const currentRating = primary?.last?.rating ?? null;
    const peakRating = Math.max(
      ...pools.map((p) => p?.best?.rating ?? 0),
      0,
    ) || null;

    const record = pools.reduce(
      (acc, p) => ({
        wins: acc.wins + (p?.record?.win ?? 0),
        losses: acc.losses + (p?.record?.loss ?? 0),
        draws: acc.draws + (p?.record?.draw ?? 0),
      }),
      { wins: 0, losses: 0, draws: 0 },
    );

    // Recent games from latest archive
    let recentGames: ChessGame[] = [];
    let ratingHistory: number[] = [];

    const archivesRes = await fetch(
      `${CHESS_API}/player/${username}/games/archives`,
      {
        headers: { "User-Agent": "kvnn-portfolio" },
        next: { revalidate: statsConfig.cache.chess },
      },
    );
    const archives = await safeJson<ChessArchives>(archivesRes);
    const latest = archives?.archives?.at(-1);

    if (latest) {
      const gamesRes = await fetch(latest, {
        headers: { "User-Agent": "kvnn-portfolio" },
        next: { revalidate: statsConfig.cache.chess },
      });
      const gamesData = await safeJson<ChessGamesResponse>(gamesRes);
      const games = [...(gamesData?.games ?? [])].reverse();

      recentGames = games.slice(0, 5).map((g) => {
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

      ratingHistory = games
        .slice(-12)
        .map((g) => {
          const isWhite =
            g.white.username.toLowerCase() === username.toLowerCase();
          return isWhite ? g.white.rating : g.black.rating;
        });
    }

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
  } catch (error) {
    console.error("Chess fetch failed:", error);
    return emptyChess(username);
  }
}
