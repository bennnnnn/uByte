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
          background: "linear-gradient(135deg, #0891b2, #164e63)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: Math.round(size * 0.18),
          fontSize: Math.round(size * 0.52),
        },
        children: "🐹",
      },
    },
    { width: size, height: size }
  ) as unknown as NextResponse;
});
