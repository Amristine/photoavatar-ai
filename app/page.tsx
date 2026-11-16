import Dashboard from "@/components/dashboard";
import { getModelPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function Home() {
  const models = getModelPricing();
  const usdToInr = Number(process.env.USD_TO_INR || 85);
  const creditsPerInr = Number(process.env.CREDITS_PER_INR || 1);
  return <Dashboard models={models} usdToInr={Number.isFinite(usdToInr) ? usdToInr : 85} creditsPerInr={Number.isFinite(creditsPerInr) ? creditsPerInr : 1} />;
}