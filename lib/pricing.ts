export type ModelId = "avatar-iii" | "avatar-iv" | "avatar-6" | "avatar-6-turbo";

export type ModelPricing = {
  id: ModelId;
  name: string;
  description: string;
  usdPerMinute: number | null;
  status: "configured" | "rate-required";
  tag: string;
};

function readRate(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function getModelPricing(): ModelPricing[] {
  const iii = readRate(process.env.HEYGEN_AVATAR_III_USD_PER_MIN) ?? 0.99;
  const iv = readRate(process.env.HEYGEN_AVATAR_IV_USD_PER_MIN) ?? 2.31;
  const six = readRate(process.env.HEYGEN_AVATAR_6_USD_PER_MIN);
  const turbo = readRate(process.env.HEYGEN_AVATAR_6_TURBO_USD_PER_MIN);
  return [
    { id: "avatar-iii", name: "Avatar III", description: "Economical photo avatar generation", usdPerMinute: iii, status: "configured", tag: "Economy" },
    { id: "avatar-iv", name: "Avatar IV", description: "Expressive photo avatar generation", usdPerMinute: iv, status: "configured", tag: "Advanced" },
    { id: "avatar-6", name: "Avatar 6", description: "Motion-prompt driven avatar model", usdPerMinute: six, status: six === null ? "rate-required" : "configured", tag: "Latest" },
    { id: "avatar-6-turbo", name: "Avatar 6 Turbo", description: "Turbo generation mode", usdPerMinute: turbo, status: turbo === null ? "rate-required" : "configured", tag: "Turbo" }
  ];
}

export function estimateGeneration(model: ModelId, durationSeconds: number) {
  const pricing = getModelPricing().find((item) => item.id === model);
  const fx = readRate(process.env.USD_TO_INR) ?? 85;
  const creditsPerInr = readRate(process.env.CREDITS_PER_INR) ?? 1;
  const margin = readRate(process.env.CUSTOMER_MARGIN_MULTIPLIER) ?? 1;
  if (!pricing || pricing.usdPerMinute === null) return null;
  const providerCostInr = (Math.max(0, durationSeconds) / 60) * pricing.usdPerMinute * fx;
  const customerCredits = Math.ceil(providerCostInr * creditsPerInr * margin);
  return { providerCostInr, customerCredits, currencyRate: fx };
}