import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { verifyCsrf } from "@/lib/csrf";

const CheckoutBody = z.object({ plan: z.enum(["monthly", "yearly"]) });

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID ?? "";
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? "";

export const POST = withErrorHandling("POST /api/billing/checkout", async (request: NextRequest) => {
  const csrfError = verifyCsrf(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }
  const { user, response } = await requireAuth();
  if (!user) return response;

  const parsed = CheckoutBody.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const { plan } = parsed.data;

  const priceId = plan === "yearly" ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Pricing not configured" }, { status: 503 });
  }

  return NextResponse.json({ priceId, clientToken: CLIENT_TOKEN });
});
