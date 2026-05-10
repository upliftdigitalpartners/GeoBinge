import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            "radial-gradient(circle at 30% 30%, #f6121d 0%, #b00710 60%, #0a0a0b 100%)",
          color: "white",
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: -4,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        G
      </div>
    ),
    { ...size },
  );
}
