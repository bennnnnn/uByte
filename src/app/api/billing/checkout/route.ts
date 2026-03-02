import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";

export const POST = withErrorHandling("POST /api/billing/checkout", async (request: NextRequest) => {
  const { user, response } = await requireAuth();
  if (!user) return response;

  const { plan } = await request.json() as { plan: "monthly" | "yearly" };
  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = plan === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Pricing not configured" }, { status: 503 });
  }

  return NextResponse.json({ priceId, clientToken: CLIENT_TOKEN });
});
