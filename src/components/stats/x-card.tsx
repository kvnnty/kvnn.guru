import {
  StatsCard,
  StatsCardHeader,
  StatsEmpty,
} from "@/components/stats/stats-card";
import { RelativeTime } from "@/components/stats/relative-time";
import { getXStats } from "@/lib/stats/x";
import { formatNumber } from "@/lib/stats/utils";

export async function XCard() {
  const data = await getXStats();

  if (!data.posts.length) {
    return (
      <StatsCard className="sm:col-span-2 lg:col-span-3" href={data.profileUrl}>
        <StatsCardHeader label="Latest on X" href={data.profileUrl} />
        <StatsEmpty message="No recent posts to show." />
      </StatsCard>
    );
  }

  return (
    <StatsCard className="sm:col-span-2 lg:col-span-3">
      <StatsCardHeader label="Latest on X" href={data.profileUrl} />

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.posts.map((post) => (
          <li key={post.id}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              {post.imageUrl ? (
                <div className="mb-2.5 overflow-hidden rounded-md ring-1 ring-border">
                  {/* biome-ignore lint/performance/noImgElement: remote X media hosts vary */}
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="aspect-[2/1] w-full object-cover"
                  />
                </div>
              ) : null}

              <p className="text-sm leading-relaxed text-foreground line-clamp-3 group-hover:text-accent">
                {post.text}
              </p>

              <p className="mt-1.5 font-mono text-[10px] text-muted">
                {post.isRepost && post.author ? (
                  <>
                    @{post.author}
                    <span className="text-border"> · </span>
                  </>
                ) : null}
                <RelativeTime date={post.createdAt} />
                {post.likes != null && post.likes > 0 ? (
                  <>
                    <span className="text-border"> · </span>
                    {formatNumber(post.likes)}
                  </>
                ) : null}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </StatsCard>
  );
}
