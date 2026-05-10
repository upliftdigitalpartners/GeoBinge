import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// Designed with maskable safe-zone padding (~10%) so launchers can crop
// to circles/squircles without losing the glyph. Solid background = full bleed.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 30%, #f6121d 0%, #b00710 60%, #5a0508 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "78%",
            height: "78%",
            color: "white",
            fontSize: 280,
            fontWeight: 800,
            letterSpacing: -10,
            fontFamily: "system-ui, -apple-system, sans-serif",
            textShadow: "0 6px 24px rgba(0,0,0,0.35)",
          }}
        >
          G
        </div>
      </div>
    ),
    { ...size },
  );
}
