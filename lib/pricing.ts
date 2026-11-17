export type ModelId = "avatar-iii" | "avatar-iv" | "avatar-6" | "avatar-6-turbo";
export type OutputResolution = "720p" | "1080p" | "2K";

export type ModelPricing = {
  id: ModelId;
  name: string;
  description: string;
  rates: Partial<Record<OutputResolution, number>>;
  status: "configured" | "rate-required";
  tag: string;
  tier: "Budget" | "Standard" | "Premium";
};

function readRate(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function rate(value: string | undefined, fallback: number): number {
  return readRate(value) ?? fallback;
}

export function getModelPricing(): ModelPricing[] {
  const avatar6 = rate(process.env.HEYGEN_AVATAR_6_1080P_USD_PER_MIN, 6.00);
  const avatar6_2k = rate(process.env.HEYGEN_AVATAR_6_2K_USD_PER_MIN, 8.70);
  const turbo1080 = rate(process.env.HEYGEN_AVATAR_6_TURBO_1080P_USD_PER_MIN, 3.00);
  const turbo2k = rate(process.env.HEYGEN_AVATAR_6_TURBO_2K_USD_PER_MIN, 5.25);

  return [
    {
      id: "avatar-iii",
      name: "Avatar 3 Photo",
      description: "Affordable talking videos from a single photo and your recorded voice. No custom motion prompt.",
      rates: { "720p": rate(process.env.HEYGEN_AVATAR_III_USD_PER_MIN, 0.99), "1080p": rate(process.env.HEYGEN_AVATAR_III_USD_PER_MIN, 0.99) },
      status: "configured",
      tag: "Best value",
      tier: "Budget"
    },
    {
      id: "avatar-iv",
      name: "Avatar 4 Photo",
      description: "More expressive photo animation with support for motion direction.",
      rates: { "720p": rate(process.env.HEYGEN_AVATAR_IV_USD_PER_MIN, 2.31), "1080p": rate(process.env.HEYGEN_AVATAR_IV_USD_PER_MIN, 2.31) },
      status: "configured",
      tag: "Balanced",
      tier: "Standard"
    },
    {
      id: "avatar-6",
      name: "Avatar 6",
      description: "Premium photo-to-video generation with motion prompts and 1080p or 2K output.",
      rates: { ...(avatar6 !== null ? { "1080p": avatar6 } : {}), ...(avatar6_2k !== null ? { "2K": avatar6_2k } : {}) },
      status: "configured",
      tag: "Premium quality",
      tier: "Premium"
    },
    {
      id: "avatar-6-turbo",
      name: "Avatar 6 Turbo",
      description: "Faster premium generation at a lower provider rate.",
      rates: { ...(turbo1080 !== null ? { "1080p": turbo1080 } : {}), ...(turbo2k !== null ? { "2K": turbo2k } : {}) },
      status: "configured",
      tag: "Premium · Faster",
      tier: "Premium"
    }
  ];
}

export function estimateGeneration(model: ModelId, durationSeconds: number, resolution: OutputResolution = "1080p") {
  const pricing = getModelPricing().find((item) => item.id === model);
  const usdPerMinute = pricing?.rates[resolution];
  const fx = readRate(process.env.USD_TO_INR) ?? 85;
  const creditsPerInr = readRate(process.env.CREDITS_PER_INR) ?? 1;
  const margin = readRate(process.env.CUSTOMER_MARGIN_MULTIPLIER) ?? 1;
  if (!pricing || usdPerMinute === undefined) return null;
  const providerCostInr = (Math.max(0, durationSeconds) / 60) * usdPerMinute * fx;
  const customerCredits = Math.ceil(providerCostInr * creditsPerInr * margin);
  return { providerCostInr, customerCredits, currencyRate: fx, usdPerMinute };
}
export function getCreditConfig() {
  return {
    usdToInr: readRate(process.env.USD_TO_INR) ?? 85,
    creditsPerInr: readRate(process.env.CREDITS_PER_INR) ?? 1,
    marginMultiplier: readRate(process.env.CUSTOMER_MARGIN_MULTIPLIER) ?? 1
  };
}
