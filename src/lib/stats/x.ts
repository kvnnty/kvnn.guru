import { statsConfig } from "@/data/stats";
import type { XStatsData, XPost } from "./types";
import { safeJson } from "./utils";

function emptyX(username: string): XStatsData {
  return {
    source: "unavailable",
    username,
    profileUrl: `https://x.com/${username}`,
    posts: [],
  };
}

function shouldInclude(
  text: string,
  isReply: boolean,
  isRepost: boolean,
  hasMedia: boolean,
) {
  if (statsConfig.x.hideReplies && isReply) return false;
  if (statsConfig.x.hideReposts && isRepost) return false;
  if (!text.trim() && !hasMedia) return false;
  return true;
}

type FxStatus = {
  type?: string;
  id?: string;
  text?: string;
  url?: string;
  created_at?: string;
  created_timestamp?: number;
  likes?: number;
  replies?: number;
  replying_to?: string | null;
  reposted_by?: { screen_name?: string } | null;
  author?: { screen_name?: string };
  media?: {
    photos?: { url?: string }[];
    videos?: { thumbnail_url?: string }[];
    all?: { type?: string; url?: string; thumbnail_url?: string }[];
  };
};

/**
 * FxTwitter profile statuses — no API key required.
 * Username comes from statsConfig.x.username.
 */
async function fetchFromFxTwitter(
  username: string,
): Promise<XPost[] | null> {
  try {
    const handle = username.toLowerCase();
    const posts: XPost[] = [];
    let cursor: string | undefined;
    const maxPages = 4;

    for (let page = 0; page < maxPages && posts.length < statsConfig.x.maxPosts; page++) {
      const params = new URLSearchParams({ count: "40" });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(
        `https://api.fxtwitter.com/2/profile/${username}/statuses?${params}`,
        {
          headers: { "User-Agent": "kvnn-portfolio" },
          next: { revalidate: statsConfig.cache.x },
        },
      );

      const data = await safeJson<{
        results?: FxStatus[];
        cursor?: { bottom?: string };
      }>(res);

      const results = data?.results;
      if (!results?.length) break;

      for (const t of results) {
        if (t.type && t.type !== "status") continue;

        const author = t.author?.screen_name ?? "";
        const authorLower = author.toLowerCase();
        const isRepost =
          Boolean(t.reposted_by) ||
          (authorLower !== "" && authorLower !== handle);
        const onProfile =
          authorLower === handle ||
          t.reposted_by?.screen_name?.toLowerCase() === handle;
        if (!onProfile) continue;

        const imageUrl =
          t.media?.photos?.[0]?.url ||
          t.media?.videos?.[0]?.thumbnail_url ||
          t.media?.all?.[0]?.url ||
          t.media?.all?.[0]?.thumbnail_url ||
          null;

        const text = t.text ?? "";
        const isReply = Boolean(t.replying_to);
        if (!shouldInclude(text, isReply, isRepost, Boolean(imageUrl))) continue;

        const id = t.id;
        if (!id) continue;

        const createdAt = t.created_at
          ? new Date(t.created_at).toISOString()
          : t.created_timestamp
            ? new Date(t.created_timestamp * 1000).toISOString()
            : new Date().toISOString();

        posts.push({
          id,
          text: text.trim() || (imageUrl ? "Media" : ""),
          url: t.url || `https://x.com/${username}/status/${id}`,
          createdAt,
          imageUrl,
          likes: t.likes ?? null,
          replies: t.replies ?? null,
          isRepost,
          author: author || null,
        });

        if (posts.length >= statsConfig.x.maxPosts) break;
      }

      const next = data?.cursor?.bottom;
      if (!next || next === cursor) break;
      cursor = next;
    }

    return posts.length ? posts : null;
  } catch {
    return null;
  }
}

export async function getXStats(): Promise<XStatsData> {
  const username = statsConfig.x.username;

  try {
    const posts = await fetchFromFxTwitter(username);
    if (posts?.length) {
      return {
        source: "synced",
        username,
        profileUrl: `https://x.com/${username}`,
        posts,
      };
    }

    return emptyX(username);
  } catch (error) {
    console.error("X fetch failed:", error);
    return emptyX(username);
  }
}
