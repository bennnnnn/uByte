import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0891b2 0%, #164e63 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        gap: "24px",
      }}
    >
      <div style={{ fontSize: 100 }}>🐹</div>
      <div style={{ fontSize: 72, fontWeight: "bold", color: "white", letterSpacing: "-2px" }}>
        uByte
      </div>
      <div
        style={{
          fontSize: 30,
          color: "rgba(255,255,255,0.75)",
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        Interactive coding tutorials, interview prep, and certifications
      </div>
    </div>,
    size
  );
}
