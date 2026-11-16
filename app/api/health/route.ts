import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "photoavatar-ai",
    integrations: {
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      heygen: Boolean(process.env.HEYGEN_API_KEY),
      avatar6PricingConfigured: Boolean(process.env.HEYGEN_AVATAR_6_USD_PER_MIN)
    }
  });
}