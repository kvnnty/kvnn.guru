import { unstable_cache } from "next/cache";
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
  getBasicPresence,
  getRecentlyPlayedGames,
  getUserTrophyProfileSummary,
} from "psn-api";
import { playstationFallback, statsConfig } from "@/data/stats";
import type { PlaystationStatsData } from "./types";
import { relativeTime } from "./utils";

/**
 * PlayStation / Gaming stats via unofficial psn-api.
 * @see https://psn-api.achievements.app
 *
 * Auth (server-only):
 * - PSN_NPSSO — from https://ca.account.sony.com/api/v1/ssocookie
 * - or PSN_REFRESH_TOKEN — longer-lived; preferred once you have one
 */
async function authorize() {
  const refreshToken = process.env.PSN_REFRESH_TOKEN;
  if (refreshToken) {
    return exchangeRefreshTokenForAuthTokens(refreshToken);
  }

  const npsso = process.env.PSN_NPSSO;
  if (!npsso) return null;

  const accessCode = await exchangeNpssoForAccessCode(npsso);
  return exchangeAccessCodeForAuthTokens(accessCode);
}

function normalizePlatform(platform: string | undefined | null): string {
  if (!platform || platform === "UNKNOWN") return "PS4";
  if (platform.toLowerCase() === "ps4") return "PS4";
  if (platform.toLowerCase() === "ps5") return "PS5";
  return platform;
}

async function fetchPlaystationStats(): Promise<PlaystationStatsData> {
  const onlineId =
    process.env.PSN_ONLINE_ID || statsConfig.playstation.onlineId;

  try {
    const auth = await authorize();
    if (!auth?.accessToken) {
      return { ...playstationFallback, onlineId, source: "fallback", available: false };
    }

    const authorization = { accessToken: auth.accessToken };

    const [recent, trophies, presence] = await Promise.all([
      getRecentlyPlayedGames(authorization, {
        limit: 3,
        categories: ["ps4_game", "ps5_native_game"],
      }).catch(() => null),
      getUserTrophyProfileSummary(authorization, "me").catch(() => null),
      getBasicPresence(authorization, "me").catch(() => null),
    ]);

    const games =
      recent?.data?.gameLibraryTitlesRetrieve?.games ?? [];

    const recentlyPlayed = games.slice(0, 3).map((game) => ({
      title: game.name,
      imageUrl: game.image?.url ?? null,
      lastPlayed: relativeTime(game.lastPlayedDateTime) || game.lastPlayedDateTime,
      platform: normalizePlatform(game.platform),
    }));

    const playing = presence?.basicPresence?.gameTitleInfoList?.[0];
    const currentlyPlaying = playing
      ? {
          title: playing.titleName,
          imageUrl: playing.conceptIconUrl || playing.npTitleIconUrl || null,
          platform: normalizePlatform(playing.launchPlatform || playing.format),
        }
      : null;

    const earned = trophies?.earnedTrophies;
    const trophyTotals = {
      platinum: Number(earned?.platinum ?? 0),
      gold: Number(earned?.gold ?? 0),
      silver: Number(earned?.silver ?? 0),
      bronze: Number(earned?.bronze ?? 0),
      total: 0,
    };
    trophyTotals.total =
      trophyTotals.platinum +
      trophyTotals.gold +
      trophyTotals.silver +
      trophyTotals.bronze;

    const lastOnlineRaw =
      presence?.basicPresence?.primaryPlatformInfo?.lastOnlineDate ||
      presence?.basicPresence?.lastOnlineDate ||
      games[0]?.lastPlayedDateTime ||
      null;

    return {
      source: "synced",
      onlineId,
      currentlyPlaying,
      recentlyPlayed: recentlyPlayed.length
        ? recentlyPlayed
        : playstationFallback.recentlyPlayed,
      trophies: trophyTotals,
      recentAchievements: [],
      lastOnline: lastOnlineRaw ? relativeTime(lastOnlineRaw) : null,
      available: true,
    };
  } catch (error) {
    console.error("PlayStation fetch failed:", error);
    return {
      ...playstationFallback,
      onlineId,
      source: "fallback",
      available: false,
    };
  }
}

export async function getPlaystationStats(): Promise<PlaystationStatsData> {
  const onlineId =
    process.env.PSN_ONLINE_ID || statsConfig.playstation.onlineId;
  const hasAuth = Boolean(
    process.env.PSN_NPSSO || process.env.PSN_REFRESH_TOKEN,
  );

  if (!hasAuth) {
    return {
      ...playstationFallback,
      onlineId,
      source: "fallback",
      available: false,
    };
  }

  return unstable_cache(
    fetchPlaystationStats,
    [
      "playstation-stats",
      process.env.PSN_ONLINE_ID || "",
      (process.env.PSN_REFRESH_TOKEN || process.env.PSN_NPSSO || "").slice(0, 12),
    ],
    { revalidate: statsConfig.cache.playstation },
  )();
}
