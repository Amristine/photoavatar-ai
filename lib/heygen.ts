import "server-only";

const HEYGEN_BASE_URL = "https://api.heygen.com";

type HeyGenEnvelope<T> = { data: T; error?: { code?: string; message?: string } };
type HeyGenAsset = { asset_id: string; url?: string; mime_type?: string; size_bytes?: number };
type HeyGenVideoJob = { video_id: string; status: string };
type HeyGenPhotoAvatar = { avatar_item?: { id?: string }; id?: string };

export type OutputRatio = "9:16" | "16:9" | "1:1";
export type Avatar6Model = "heygen-avatar-6" | "heygen-avatar-6-turbo";

function apiKey() {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error("HEYGEN_API_KEY is not configured on the server.");
  return key;
}

async function heygenFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-api-key", apiKey());
  if (!(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(`${HEYGEN_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `HeyGen request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
}

/** Uploads one image or audio file to the HeyGen asset API. */
export async function uploadHeyGenAsset(file: File): Promise<HeyGenAsset> {
  const form = new FormData();
  form.append("file", file, file.name || "upload");
  const response = await heygenFetch<HeyGenEnvelope<HeyGenAsset>>("/v3/assets", {
    method: "POST",
    body: form
  });
  if (!response.data?.asset_id) throw new Error("HeyGen did not return an asset ID.");
  return response.data;
}

/** Avatar 6 Model API: animates the supplied photo asset directly with supplied audio. */
export async function createAvatar6Job(input: {
  model: Avatar6Model;
  imageAssetId: string;
  audioAssetId: string;
  resolution?: "1080p" | "2k";
  motionPrompt?: string;
  motionExpressiveness?: "default" | "less";
  callbackUrl?: string;
}): Promise<HeyGenVideoJob> {
  const response = await heygenFetch<HeyGenEnvelope<HeyGenVideoJob>>("/v3/models/avatars", {
    method: "POST",
    body: JSON.stringify({
      model: input.model,
      reference_images: [{ type: "asset_id", asset_id: input.imageAssetId }],
      audio: { type: "asset_id", asset_id: input.audioAssetId },
      resolution: input.resolution ?? "1080p",
      ...(input.motionPrompt ? { motion_prompt: input.motionPrompt } : {}),
      ...(input.motionExpressiveness ? { motion_expressiveness: input.motionExpressiveness } : {}),
      ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {})
    })
  });
  if (!response.data?.video_id) throw new Error("HeyGen did not return a video ID.");
  return response.data;
}

/** Avatar IV accepts an arbitrary single-person image and recorded audio without avatar registration. */
export async function createAvatarIVImageJob(input: {
  imageAssetId: string;
  audioAssetId: string;
  aspectRatio?: OutputRatio;
  resolution?: "720p" | "1080p";
  motionPrompt?: string;
  expressiveness?: "low" | "medium" | "high";
  callbackUrl?: string;
  title?: string;
}): Promise<HeyGenVideoJob> {
  const response = await heygenFetch<HeyGenEnvelope<HeyGenVideoJob>>("/v3/videos", {
    method: "POST",
    body: JSON.stringify({
      type: "image",
      image: { type: "asset_id", asset_id: input.imageAssetId },
      audio_asset_id: input.audioAssetId,
      engine: { type: "avatar_iv" },
      resolution: input.resolution ?? "1080p",
      aspect_ratio: input.aspectRatio ?? "9:16",
      ...(input.motionPrompt ? { motion_prompt: input.motionPrompt } : {}),
      ...(input.expressiveness ? { expressiveness: input.expressiveness } : {}),
      ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
      ...(input.title ? { title: input.title } : {})
    })
  });
  if (!response.data?.video_id) throw new Error("HeyGen did not return a video ID.");
  return response.data;
}

/** Creates a reusable Photo Avatar look. This is a separately billable provider operation. */
export async function createPhotoAvatar(input: {
  imageAssetId: string;
  name: string;
}): Promise<{ avatarId: string }> {
  const response = await heygenFetch<HeyGenEnvelope<HeyGenPhotoAvatar>>("/v3/avatars", {
    method: "POST",
    body: JSON.stringify({
      type: "photo",
      name: input.name,
      file: { type: "asset_id", asset_id: input.imageAssetId }
    })
  });
  const avatarId = response.data?.avatar_item?.id || response.data?.id;
  if (!avatarId) throw new Error("HeyGen did not return a Photo Avatar ID.");
  return { avatarId };
}

/** Avatar III uses the dedicated Photo Avatar look pipeline. */
export async function createAvatarIIIJob(input: {
  avatarId: string;
  audioAssetId: string;
  aspectRatio?: OutputRatio;
  resolution?: "1080p";
  callbackUrl?: string;
  title?: string;
}): Promise<HeyGenVideoJob> {
  const response = await heygenFetch<HeyGenEnvelope<HeyGenVideoJob>>("/v3/videos", {
    method: "POST",
    body: JSON.stringify({
      type: "avatar",
      avatar_id: input.avatarId,
      engine: { type: "avatar_iii" },
      audio_asset_id: input.audioAssetId,
      resolution: input.resolution ?? "1080p",
      aspect_ratio: input.aspectRatio ?? "9:16",
      ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
      ...(input.title ? { title: input.title } : {})
    })
  });
  if (!response.data?.video_id) throw new Error("HeyGen did not return a video ID.");
  return response.data;
}

export async function getHeyGenVideoStatus(videoId: string, model: "avatar-6" | "avatar-6-turbo" | "avatar-iii" | "avatar-iv") {
  const path = model === "avatar-6" || model === "avatar-6-turbo"
    ? `/v3/models/videos/${encodeURIComponent(videoId)}`
    : `/v3/videos/${encodeURIComponent(videoId)}`;
  return heygenFetch<HeyGenEnvelope<Record<string, unknown>>>(path, { method: "GET" });
}
