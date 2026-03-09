/**
 * Open Graph image generator — /api/og
 *
 * Produces a 1200×630 PNG used by all og:image and twitter:image meta tags.
 * Optional query params:
 *   ?title=Custom+Title           — override the main headline (max ~55 chars)
 *   ?description=Some+description — override the sub-text
 *
 * Built with next/og (Vercel Edge runtime / @vercel/og) — no sharp required.
 */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Interactive Coding Tutorials & Certifications";
  const description =
    searchParams.get("description") ??
    "Go · Python · JavaScript · C++ · Java · Rust";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 60%, #1e1b4b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)",
          }}
        />

        {/* logo wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 900,
              color: "white",
            }}
          >
            u
          </div>
          <span style={{ fontSize: 32, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
            uByte
          </span>
        </div>

        {/* main headline */}
        <div
          style={{
            fontSize: title.length > 45 ? 44 : 52,
            fontWeight: 900,
            color: "white",
            lineHeight: 1.15,
            maxWidth: 900,
            letterSpacing: "-1px",
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* description / language pills */}
        <div
          style={{
            fontSize: 26,
            color: "#a5b4fc",
            fontWeight: 500,
            letterSpacing: "0.4px",
          }}
        >
          {description}
        </div>

        {/* bottom CTA */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            right: 80,
            fontSize: 20,
            color: "#6366f1",
            fontWeight: 700,
            letterSpacing: "0.2px",
          }}
        >
          ubyte.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
