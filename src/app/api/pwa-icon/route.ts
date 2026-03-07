import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";

export const runtime = "edge";

export const GET = withErrorHandling("GET /api/pwa-icon", async (request: NextRequest) => {
  const raw = parseInt(request.nextUrl.searchParams.get("size") ?? "192");
  const size = [192, 512].includes(raw) ? raw : 192;

  return new ImageResponse(
    {
      type: "div",
      key: null,
      props: {
        style: {
          background: "linear-gradient(135deg, #4338ca, #1d4ed8)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: Math.round(size * 0.18),
          color: "#ffffff",
          fontSize: Math.round(size * 0.44),
          fontWeight: 800,
          letterSpacing: "-0.08em",
        },
        children: "U",
      },
    },
    { width: size, height: size }
  ) as unknown as NextResponse;
});
