import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          borderRadius: 10,
          overflow: "hidden",
          background: "#1a1916",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.avatar}
          alt=""
          width={32}
          height={32}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>
    ),
    { ...size },
  );
}
