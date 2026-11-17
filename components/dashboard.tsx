"use client";

import { useEffect, useState } from "react";
import {
  Activity, Bell, Check, ChevronDown, CircleHelp, Clapperboard, Clock3,
  FileAudio, FileImage, Film, Layers3, LayoutDashboard, Settings2,
  ShieldCheck, Sparkles, UploadCloud, Video, Wallet, WandSparkles, X
} from "lucide-react";
import type { ModelPricing, ModelId, OutputResolution } from "@/lib/pricing";

type Props = {
  models: ModelPricing[];
  creditConfig: { usdToInr: number; creditsPerInr: number; marginMultiplier: number };
};

const DRAFT_KEY = "photoavatar-ai-creator-draft";
const DEFAULT_MOTION = "Speak naturally to camera with relaxed shoulders, subtle head movement, expressive facial movement and gentle conversational hand gestures. Keep gestures realistic and avoid sudden movements.";
type CreatorDraft = { selectedModel: ModelId; duration: number; aspectRatio: "9:16" | "16:9" | "1:1"; photoName: string; audioName: string; script: string; motion: string; resolution: string };

function readDraft(): Partial<CreatorDraft> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}"); } catch { return {}; }
}

const nav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Create video", icon: Clapperboard },
  { label: "My avatars", icon: Layers3 },
  { label: "My videos", icon: Film },
  { label: "Credits & billing", icon: Wallet }
];

export default function Dashboard({ models, creditConfig }: Props) {
  const [initialDraft] = useState<Partial<CreatorDraft>>(readDraft);
  const [selectedModel, setSelectedModel] = useState<ModelId>(initialDraft.selectedModel ?? "avatar-iii");
  const [duration, setDuration] = useState(initialDraft.duration ?? 60);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">(initialDraft.aspectRatio ?? "9:16");
  const [photoName, setPhotoName] = useState(initialDraft.photoName ?? "");
  const [audioName, setAudioName] = useState(initialDraft.audioName ?? "");
  const [script, setScript] = useState(initialDraft.script ?? "");
  const [motion, setMotion] = useState(initialDraft.motion ?? DEFAULT_MOTION);
  const [resolution, setResolution] = useState(initialDraft.resolution ?? "1080p");
  const [notice, setNotice] = useState("");
  const selected = models.find((m) => m.id === selectedModel) ?? models[0];
  const supportedResolutions = selectedModel === "avatar-iii" || selectedModel === "avatar-iv" ? ["720p", "1080p"] : ["1080p", "2K"];
  const effectiveResolution = supportedResolutions.includes(resolution) ? resolution : "1080p";
  const usdPerMinute = selected?.rates[effectiveResolution as OutputResolution];
  const estimatedInr = usdPerMinute === undefined ? null : (duration / 60) * usdPerMinute * creditConfig.usdToInr * creditConfig.marginMultiplier;
  const estimatedCredits = estimatedInr === null ? null : Math.ceil(estimatedInr * creditConfig.creditsPerInr);
  const hasDraft = Boolean(photoName || audioName || script.trim() || selectedModel !== "avatar-iii" || duration !== 60 || aspectRatio !== "9:16" || resolution !== "1080p");

  useEffect(() => {
    const draft: CreatorDraft = { selectedModel, duration, aspectRatio, photoName, audioName, script, motion, resolution };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { setNotice("Could not save this draft in browser storage. Export or copy your script before leaving this page."); }
  }, [selectedModel, duration, aspectRatio, photoName, audioName, script, motion, resolution]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!hasDraft) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasDraft]);

  const onGenerate = () => setNotice("Video generation is not connected yet. Your creator settings are automatically saved in this browser. Once generation is connected, completed videos will be saved locally as well.");

  return (
    <main className="min-h-screen bg-[#09090d] text-[#f4f4f8]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#252530] bg-[#0d0d13] px-4 py-6 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700"><WandSparkles size={21}/></div>
            <div><div className="text-[15px] font-bold">PhotoAvatar<span className="text-violet-400"> AI</span></div><div className="mt-0.5 text-[10px] uppercase tracking-[.2em] text-[#777789]">Creator studio</div></div>
          </div>
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#686879]">Workspace</div>
          <nav className="space-y-1">
            {nav.map((item) => <button key={item.label} onClick={() => setNotice(item.label === "Create video" ? "You are on the video creation workspace." : item.label + " will be available in a later dashboard milestone.")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] ${item.active ? "border border-violet-500/20 bg-violet-500/10 font-semibold text-violet-200" : "text-[#9999aa] hover:bg-white/[.04]"}`}><item.icon size={17}/>{item.label}</button>)}
          </nav>
          <div className="mt-auto space-y-4">
            <div className="rounded-2xl border border-[#292936] bg-[#111117] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-200"><Sparkles size={14}/> Creator workspace</div>
              <p className="text-[11px] leading-5 text-[#a5a3b6]">Your videos, avatars and settings will be managed here.</p>
            </div>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs text-[#9292a3]"><Settings2 size={16}/> Settings</button>
            <div className="flex items-center gap-3 border-t border-[#252530] px-2 pt-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#282437] text-xs font-bold text-violet-200">RA</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">Your workspace</div><div className="text-[10px] text-[#777789]">Preview</div></div><ChevronDown size={15} className="text-[#777789]"/></div>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#252530] bg-[#09090d]/90 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 lg:hidden"><WandSparkles size={18}/></div><div><div className="text-sm font-semibold">Video studio</div><div className="mt-0.5 text-[11px] text-[#858596]">Create a presenter video from your photo and voice</div></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#2a2a36] bg-[#111117] px-3 py-2 sm:flex"><Wallet size={14} className="text-violet-300"/><span className="text-xs text-[#aaaaba]">Wallet not connected</span></div><button aria-label="Notifications" className="rounded-xl border border-[#292936] p-2.5 text-[#9999aa]"><Bell size={16}/></button></div>
          </header>
          <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[.06] px-3 py-2 text-[10px] text-emerald-200"><ShieldCheck size={14}/> Draft auto-saves in this browser. Refreshing or closing the tab will prompt before leaving when you have entered data.</div>
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-violet-300"><span className="h-1.5 w-1.5 rounded-full bg-violet-400"/> AI video generation</div><h1 className="text-2xl font-semibold tracking-tight md:text-[30px]">Create your next video</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#9292a3]">Bring a photo to life. Add your own audio and guide the motion to create a presenter video.</p></div>
              <div className="flex items-center gap-2 rounded-xl border border-[#292936] bg-[#111117] px-3 py-2.5 text-[11px] text-[#a3a3b2]"><ShieldCheck size={15} className="text-emerald-400"/> Your HeyGen API key stays server-side</div>
            </div>
            {notice && <div className="mb-5 flex items-start gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-xs leading-5 text-violet-100"><CircleHelp size={16} className="mt-0.5 shrink-0"/><span className="flex-1">{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
              <div className="space-y-6">
                <section className="panel p-5 md:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><div className="text-sm font-semibold">01 · Choose your model</div><div className="mt-1 text-xs text-[#858596]">Select the HeyGen engine for this generation</div></div><span className="rounded-full border border-[#343442] px-2.5 py-1 text-[10px] text-[#9696a6]">HeyGen only</span></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {models.map((model) => <button key={model.id} onClick={() => { setSelectedModel(model.id); setResolution("1080p"); setNotice(""); }} className={`relative rounded-xl border p-4 text-left transition ${selectedModel === model.id ? "border-violet-400/70 bg-violet-500/[.09]" : "border-[#30303c] bg-[#0d0d13] hover:border-[#555365]"}`}>
                      {selectedModel === model.id && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white"><Check size={12}/></span>}
                      <div className="text-[14px] font-semibold">{model.name}</div><div className="mt-2 min-h-8 text-[11px] leading-4 text-[#858596]">{model.description}</div>
                    </button>)}
                  </div>
                </section>
                <section className="panel p-5 md:p-6">
                  <div className="mb-5"><div className="text-sm font-semibold">02 · Add your media</div><div className="mt-1 text-xs text-[#858596]">Use a clear, front-facing photo and your final recorded audio</div></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="group cursor-pointer rounded-xl border border-dashed border-[#444252] bg-[#0c0c12] p-5">
                      <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}/>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300"><FileImage size={19}/></div><div className="text-xs font-semibold">Reference photo</div><div className="mt-1 text-[10px] text-[#858596]">PNG, JPG or WebP · front-facing works best</div><div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-violet-300"><UploadCloud size={14}/>{photoName || "Choose photo"}</div>
                    </label>
                    <label className="group cursor-pointer rounded-xl border border-dashed border-[#444252] bg-[#0c0c12] p-5">
                      <input className="hidden" type="file" accept="audio/*" onChange={(e) => setAudioName(e.target.files?.[0]?.name ?? "")}/>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><FileAudio size={19}/></div><div className="text-xs font-semibold">Your voice recording</div><div className="mt-1 text-[10px] text-[#858596]">MP3, WAV, M4A or supported audio</div><div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-violet-300"><UploadCloud size={14}/>{audioName || "Choose audio"}</div>
                    </label>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#292936] bg-[#0d0d13] p-3 text-[10px] leading-5 text-[#858596]"><ShieldCheck size={13} className="mr-1 inline text-emerald-400"/> Upload processing will be connected to private storage. Files are not sent to HeyGen from this preview.</div>
                </section>
                <section className="panel p-5 md:p-6">
                  <div className="mb-5"><div className="text-sm font-semibold">03 · Script & motion direction</div><div className="mt-1 text-xs text-[#858596]">Add your script and describe how the presenter should move</div></div>
                  <label className="mb-2 block text-[11px] font-medium text-[#b5b5c2]">Timestamped script <span className="text-[#707080]">(optional)</span></label>
                  <textarea value={script} onChange={(e) => setScript(e.target.value)} rows={4} placeholder={"00:00 - Hello everyone, welcome back.\n00:08 - Today we're going to talk about...\n00:20 - Let's get started."} className="field resize-y text-xs leading-6"/>
                  <div className="mb-2 mt-4 flex items-center justify-between"><label className="text-[11px] font-medium text-[#b5b5c2]">Motion prompt</label><span className="text-[10px] text-[#777789]">{selectedModel === "avatar-iii" ? "Avatar 3 Photo does not accept custom motion prompts" : "Supported by Avatar 4 Photo and Avatar 6"}</span></div>
                  <textarea value={motion} onChange={(e) => setMotion(e.target.value)} rows={3} className="field resize-y text-xs leading-6"/>
                  <div className="mt-2 flex flex-wrap gap-2">{["Natural hand gestures","Confident presenter","Calm & friendly"].map((v) => <button key={v} onClick={() => setMotion(v + ". Speak naturally to camera with subtle head movement, expressive face and realistic conversational gestures.")} className="rounded-full border border-[#343442] px-3 py-1.5 text-[10px] text-[#aaaaba]">{v}</button>)}</div>
                </section>
                <section className="panel p-5 md:p-6">
                  <div className="mb-4 text-sm font-semibold">04 · Output settings</div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Resolution</label><select value={effectiveResolution} onChange={(e) => setResolution(e.target.value)} className="field text-xs">{supportedResolutions.map((res) => <option key={res} value={res}>{res}</option>)}</select></div>
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Aspect ratio</label><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as "9:16" | "16:9" | "1:1")} className="field text-xs"><option value="9:16">9:16 · Reels / Shorts</option><option value="16:9">16:9 · YouTube</option><option value="1:1">1:1 · Square</option></select></div>
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Video length</label><select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="field text-xs"><option value={5}>5 seconds</option><option value={10}>10 seconds</option><option value={15}>15 seconds</option><option value={30}>30 seconds</option><option value={45}>45 seconds</option><option value={60}>1 minute</option><option value={90}>1 minute 30 seconds</option><option value={120}>2 minutes</option><option value={180}>3 minutes</option></select></div>
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Frame rate</label><select className="field text-xs"><option>30 FPS</option><option>25 FPS</option></select></div>
                  </div>
                </section>
              </div>
              <aside className="space-y-5 xl:sticky xl:top-[92px]">
                <section className="panel p-5">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-violet-200"><Video size={15}/> Generation settings</div>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between"><span className="text-[#9292a3]">Selected model</span><span>{selected?.name}</span></div>
                    <div className="flex justify-between"><span className="text-[#9292a3]">Output resolution</span><span>{effectiveResolution}</span></div>
                    <div className="flex justify-between"><span className="text-[#9292a3]">Aspect ratio</span><span>{aspectRatio}</span></div>
                    <div className="flex justify-between"><span className="text-[#9292a3]">Video length</span><span className="font-semibold">{duration >= 60 ? `${Math.floor(duration / 60)}m${duration % 60 ? ` ${duration % 60}s` : ""}` : `${duration}s`}</span></div>
                    <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-500/[.07] p-4">
                      <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold text-violet-200">Estimated generation cost</span><span className="text-[9px] text-[#858596]">Per video</span></div>
                      {estimatedInr === null || estimatedCredits === null ? <p className="text-[11px] text-[#aaaaba]">Pricing is not configured for this model and resolution.</p> : <><div className="flex items-baseline justify-between"><span className="text-[11px] text-[#9292a3]">Estimated price</span><span className="text-lg font-bold">₹{estimatedInr.toFixed(2)}</span></div><div className="mt-2 flex items-baseline justify-between"><span className="text-[11px] text-[#9292a3]">Credits required</span><span className="text-sm font-semibold text-violet-200">{estimatedCredits.toLocaleString("en-IN")} credits</span></div></>}
                      <p className="mt-3 text-[9px] leading-4 text-[#777789]">Estimate updates with your model, resolution and video length. Final usage may vary by provider.</p>
                    </div>
                  </div>
                  <button onClick={onGenerate} className="btn-primary mt-5 flex w-full items-center justify-center gap-2"><Sparkles size={15}/> Generate video <span className="text-violet-200/80">→</span></button>
                  <p className="mt-3 text-center text-[9px] leading-4 text-[#777789]">Preview only. No paid API request is made yet.</p>
                </section>
                <section className="panel p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold"><Activity size={14} className="text-emerald-400"/> Generation checklist</div>{[{label:"Photo selected",ok:!!photoName},{label:"Audio selected",ok:!!audioName},{label:"HeyGen API connected",ok:false}].map((item) => <div key={item.label} className="flex items-center gap-2 py-2 text-[10px]"><span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-[#292936] text-[#777789]"}`}>{item.ok ? <Check size={10}/> : <Clock3 size={10}/>}</span><span className={item.ok ? "text-[#c9c9d3]" : "text-[#858596]"}>{item.label}</span></div>)}</section>
                <div className="flex items-start gap-2 px-1 text-[10px] leading-5 text-[#777789]"><CircleHelp size={13} className="mt-0.5 shrink-0"/> Only upload images and audio you own or are authorized to use. The avatar subject must consent to AI representation.</div>
              </aside>
            </div>
            <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#252530] pt-5 text-[10px] text-[#6f6f80] sm:flex-row"><span>© 2026 PhotoAvatar AI · Powered by HeyGen</span><span className="flex items-center gap-3"><span>Privacy</span><span>Terms</span><span>Support</span></span></footer>
          </div>
        </section>
      </div>
    </main>
  );
}
