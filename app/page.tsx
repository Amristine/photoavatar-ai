import Dashboard from "@/components/dashboard";
import { getCreditConfig, getModelPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Dashboard models={getModelPricing()} creditConfig={getCreditConfig()} />;
}
