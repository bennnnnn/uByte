import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "60px 80px",
        gap: "28px",
        position: "relative",
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(129,140,248,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Logo badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 100,
          padding: "10px 24px",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 28 }}>⚡</span>
        <span style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
          uByte
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          fontSize: 60,
          fontWeight: 900,
          color: "white",
          textAlign: "center",
          lineHeight: 1.15,
          letterSpacing: "-1.5px",
          maxWidth: 900,
          gap: "0 8px",
        }}
      >
        <span>Learn to code.</span>
        <span style={{ color: "#a5b4fc" }}>Every lesson is free.</span>
        <span>Pay only for hints.</span>
      </div>

      {/* Sub-headline */}
      <div
        style={{
          fontSize: 26,
          color: "rgba(199,210,254,0.85)",
          textAlign: "center",
          maxWidth: 780,
          lineHeight: 1.4,
        }}
      >
        {"9 languages · interactive lessons · optional paid hints"}
      </div>

      {/* Pill badges */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {["Go", "Python", "TypeScript", "Java", "Rust", "C++", "C#", "JavaScript", "SQL"].map((lang) => (
          <div
            key={lang}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 18,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
            }}
          >
            {lang}
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
