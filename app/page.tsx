import Dashboard from "@/components/dashboard";
import { getModelPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Dashboard models={getModelPricing()} />;
}