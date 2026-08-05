import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3f1ec",
          padding: "72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#6f6b63",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {site.shortName}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, lineHeight: 1.05, color: "#1a1916", fontWeight: 500 }}>
            {site.name}
          </div>
          <div style={{ fontSize: 28, color: "#6f6b63", maxWidth: 780 }}>
            {site.tagline}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#0f6e5c" }}>
          kvnn.guru
        </div>
      </div>
    ),
    { ...size },
  );
}
