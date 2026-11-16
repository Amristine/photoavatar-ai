import { NextResponse } from "next/server";
import { getModelPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  const usdToInr = Number(process.env.USD_TO_INR || 85);
  const creditsPerInr = Number(process.env.CREDITS_PER_INR || 1);
  return NextResponse.json({
    currency: "INR",
    usdToInr: Number.isFinite(usdToInr) ? usdToInr : 85,
    creditsPerInr: Number.isFinite(creditsPerInr) ? creditsPerInr : 1,
    models: getModelPricing().map(({ id, name, description, usdPerMinute, status, tag }) => ({
      id, name, description, usdPerMinute, status, tag
    }))
  });
}