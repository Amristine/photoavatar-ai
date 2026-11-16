"use client";

import { useMemo, useState } from "react";
import {
  Activity, AudioLines, Bell, Check, ChevronDown, CircleHelp, Clapperboard,
  Clock3, Coins, CreditCard, FileAudio, FileImage, Film, Gauge, Home,
  Layers3, LayoutDashboard, Plus, Settings2, ShieldCheck, Sparkles,
  UploadCloud, Video, Wallet, WandSparkles, X
} from "lucide-react";
import type { ModelPricing, ModelId } from "@/lib/pricing";

type Props = { models: ModelPricing[]; usdToInr: number; creditsPerInr: number };

const nav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Create video", icon: Clapperboard },
  { label: "My avatars", icon: Layers3 },
  { label: "My videos", icon: Film },
  { label: "Credits & billing", icon: Wallet }
];

export default function Dashboard({ models, usdToInr, creditsPerInr }: Props) {
  const [selectedModel, setSelectedModel] = useState<ModelId>("avatar-iii");
  const [duration, setDuration] = useState(60);
  const [photoName, setPhotoName] = useState("");
  const [audioName, setAudioName] = useState("");
  const [script, setScript] = useState("");
  const [motion, setMotion] = useState("Speak naturally to camera with relaxed shoulders, subtle head movement, expressive facial movement and gentle conversational hand gestures. Keep gestures realistic and avoid sudden movements.");
  const [resolution, setResolution] = useState("1080p");
  const [notice, setNotice] = useState("");

  const selected = models.find((m) => m.id === selectedModel) ?? models[0];
  const estimate = useMemo(() => {
    if (!selected || selected.usdPerMinute === null) return null;
    const inr = (duration / 60) * selected.usdPerMinute * usdToInr;
    return { inr, credits: Math.ceil(inr * creditsPerInr) };
  }, [selected, duration, usdToInr, creditsPerInr]);

  const onGenerate = () => setNotice("Generation is not connected yet. Add your HeyGen API key and complete the server-side generation and credit-reservation setup before enabling paid jobs.");

  return (
    <main className="min-h-screen bg-[#09090d] text-[#f4f4f8]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#252530] bg-[#0d0d13] px-4 py-6 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 shadow-glow"><WandSparkles size={21}/></div>
            <div><div className="text-[15px] font-bold tracking-tight">PhotoAvatar<span className="text-violet-400"> AI</span></div><div className="mt-0.5 text-[10px] uppercase tracking-[.2em] text-[#777789]">Creator studio</div></div>
          </div>
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#686879]">Workspace</div>
          <nav className="space-y-1">
            {nav.map((item) => <button key={item.label} onClick={() => setNotice(item.label === "Create video" ? "You are on the video creation workspace." : item.label + " section is part of the next dashboard milestone.")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] transition ${item.active ? "border border-violet-500/20 bg-violet-500/10 font-semibold text-violet-200" : "text-[#9999aa] hover:bg-white/[.04] hover:text-white"}`}><item.icon size={17}/>{item.label}{item.label === "Create video" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400"/>}</button>)}
          </nav>
          <div className="mt-auto space-y-4">
            <div className="rounded-2xl border border-[#292936] bg-gradient-to-br from-[#1c1730] to-[#11111a] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-200"><Sparkles size={14}/> Creator plan</div>
              <p className="text-[11px] leading-5 text-[#a5a3b6]">Your wallet and subscription controls will appear here when billing is connected.</p>
              <button onClick={() => setNotice("Credit purchases will be enabled after Razorpay checkout and verified webhooks are configured.")} className="mt-3 w-full rounded-lg border border-violet-400/20 bg-violet-500/10 py-2 text-xs font-semibold text-violet-200">Explore credits</button>
            </div>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs text-[#9292a3] hover:bg-white/[.04]"><Settings2 size={16}/> Settings</button>
            <div className="flex items-center gap-3 border-t border-[#252530] px-2 pt-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#282437] text-xs font-bold text-violet-200">RA</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">Your workspace</div><div className="text-[10px] text-[#777789]">Free preview</div></div><ChevronDown size={15} className="text-[#777789]"/></div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#252530] bg-[#09090d]/90 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 lg:hidden"><WandSparkles size={18}/></div><div><div className="text-sm font-semibold">Video studio</div><div className="mt-0.5 text-[11px] text-[#858596]">Create a presenter video from your photo and voice</div></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#2a2a36] bg-[#111117] px-3 py-2 sm:flex"><Wallet size={14} className="text-violet-300"/><span className="text-xs text-[#aaaaba]">Wallet not connected</span></div><button aria-label="Notifications" className="rounded-xl border border-[#292936] p-2.5 text-[#9999aa]"><Bell size={16}/></button><div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/15 text-[11px] font-bold text-violet-200">RA</div></div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-violet-300"><span className="h-1.5 w-1.5 rounded-full bg-violet-400"/> AI video generation</div><h1 className="text-2xl font-semibold tracking-tight md:text-[30px]">Create your next video</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#9292a3]">Bring a photo to life. Add your own audio, guide the motion and preview the estimated generation cost before you start.</p></div>
              <div className="flex items-center gap-2 rounded-xl border border-[#292936] bg-[#111117] px-3 py-2.5 text-[11px] text-[#a3a3b2]"><ShieldCheck size={15} className="text-emerald-400"/> Your HeyGen API key stays server-side</div>
            </div>

            {notice && <div className="mb-5 flex items-start gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-xs leading-5 text-violet-100"><CircleHelp size={16} className="mt-0.5 shrink-0"/><span className="flex-1">{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
              <div className="space-y-6">
                <section className="panel p-5 md:p-6">
                  <div className="mb-5 flex items-center justify-between"><div><div className="text-sm font-semibold">01 · Choose your model</div><div className="mt-1 text-xs text-[#858596]">Select the HeyGen engine for this generation</div></div><span className="rounded-full border border-[#343442] px-2.5 py-1 text-[10px] text-[#9696a6]">HeyGen only</span></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {models.map((model) => <button key={model.id} onClick={() => { setSelectedModel(model.id); setNotice(""); }} className={`relative rounded-xl border p-4 text-left transition ${selectedModel === model.id ? "border-violet-400/70 bg-violet-500/[.09] shadow-glow" : "border-[#30303c] bg-[#0d0d13] hover:border-[#555365]"}`}>
                      {selectedModel === model.id && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white"><Check size={12}/></span>}
                      <div className="mb-3 flex items-center gap-2"><span className="rounded-md bg-[#242033] px-2 py-1 text-[10px] font-semibold text-violet-200">{model.tag}</span>{model.status === "rate-required" && <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[9px] text-amber-300">Rate required</span>}</div>
                      <div className="text-[14px] font-semibold">{model.name}</div><div className="mt-1 min-h-8 text-[11px] leading-4 text-[#858596]">{model.description}</div>
                      <div className="mt-3 text-sm font-semibold">{model.usdPerMinute === null ? "Price not configured" : `$${model.usdPerMinute.toFixed(2)} / min`}</div>
                    </button>)}
                  </div>
                  <p className="mt-3 text-[10px] leading-5 text-[#777789]">Rates shown are configurable estimates. Confirm your HeyGen account's current endpoint pricing before enabling paid generation. Avatar 6 rates are intentionally not guessed.</p>
                </section>

                <section className="panel p-5 md:p-6">
                  <div className="mb-5"><div className="text-sm font-semibold">02 · Add your media</div><div className="mt-1 text-xs text-[#858596]">Use a clear, front-facing photo and your final recorded audio</div></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="group cursor-pointer rounded-xl border border-dashed border-[#444252] bg-[#0c0c12] p-5 transition hover:border-violet-400/60 hover:bg-violet-500/[.04]">
                      <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}/>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300"><FileImage size={19}/></div><div className="text-xs font-semibold">Reference photo</div><div className="mt-1 text-[10px] text-[#858596]">PNG, JPG or WebP · front-facing works best</div><div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-violet-300"><UploadCloud size={14}/>{photoName || "Choose photo"}</div>
                    </label>
                    <label className="group cursor-pointer rounded-xl border border-dashed border-[#444252] bg-[#0c0c12] p-5 transition hover:border-violet-400/60 hover:bg-violet-500/[.04]">
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
                  <div className="mb-2 mt-4 flex items-center justify-between"><label className="text-[11px] font-medium text-[#b5b5c2]">Motion prompt</label><span className="text-[10px] text-[#777789]">{selectedModel === "avatar-iii" ? "Avatar III does not accept custom motion prompts" : "Supported by Avatar IV and Avatar 6"}</span></div>
                  <textarea value={motion} onChange={(e) => setMotion(e.target.value)} rows={3} className="field resize-y text-xs leading-6"/>
                  <div className="mt-2 flex flex-wrap gap-2">{["Natural hand gestures","Confident presenter","Calm & friendly"].map((v) => <button key={v} onClick={() => setMotion(v + ". Speak naturally to camera with subtle head movement, expressive face and realistic conversational gestures.")} className="rounded-full border border-[#343442] px-3 py-1.5 text-[10px] text-[#aaaaba] hover:border-violet-400/50 hover:text-violet-200">{v}</button>)}</div>
                </section>

                <section className="panel p-5 md:p-6">
                  <div className="mb-4 text-sm font-semibold">04 · Output settings</div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Resolution</label><select value={resolution} onChange={(e) => setResolution(e.target.value)} className="field text-xs"><option>1080p</option><option>720p</option><option>2K</option></select></div>
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Aspect ratio</label><select className="field text-xs"><option>9:16 · Reels / Shorts</option><option>16:9 · YouTube</option><option>1:1 · Square</option></select></div>
                    <div><label className="mb-2 block text-[10px] text-[#9292a3]">Frame rate</label><select className="field text-xs"><option>30 FPS</option><option>25 FPS</option></select></div>
                  </div>
                </section>
              </div>

              <aside className="space-y-5 xl:sticky xl:top-[92px]">
                <section className="panel overflow-hidden">
                  <div className="border-b border-[#292936] bg-gradient-to-r from-violet-500/[.13] to-transparent p-5"><div className="flex items-center gap-2 text-xs font-semibold text-violet-200"><Gauge size={15}/> Generation estimate</div><div className="mt-2 text-[11px] text-[#9292a3]">Your estimated provider cost before generation</div></div>
                  <div className="space-y-5 p-5">
                    <div><div className="mb-2 flex items-center justify-between"><label className="text-xs font-medium">Audio duration</label><span className="text-xs font-semibold text-white">{duration} sec</span></div><input type="range" min="30" max="180" step="15" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-violet-500"/><div className="mt-1 flex justify-between text-[9px] text-[#777789]"><span>30 sec</span><span>3 min</span></div></div>
                    <div className="rounded-xl border border-[#302d40] bg-[#0d0c15] p-4"><div className="text-[10px] uppercase tracking-[.12em] text-[#858596]">Estimated HeyGen cost</div><div className="mt-2 text-3xl font-semibold tracking-tight">{estimate ? `₹${estimate.inr.toFixed(2)}` : "—"}</div><div className="mt-1 text-[10px] text-[#858596]">{selected?.usdPerMinute === null ? "Add confirmed Avatar 6 rate in admin settings" : `Based on $${selected?.usdPerMinute?.toFixed(2)}/min · FX ₹${usdToInr}/$`}</div><div className="my-4 h-px bg-[#292936]"/><div className="flex items-center justify-between text-xs"><span className="text-[#9292a3]">Estimated credits</span><span className="font-semibold text-violet-200">{estimate ? estimate.credits.toLocaleString() : "—"} credits</span></div></div>
                    <div className="space-y-2 text-[10px] text-[#858596]"><div className="flex justify-between"><span>Selected model</span><span className="text-[#d5d5df]">{selected?.name}</span></div><div className="flex justify-between"><span>Output resolution</span><span className="text-[#d5d5df]">{resolution}</span></div><div className="flex justify-between"><span>Wallet balance</span><span className="text-amber-300">Not connected</span></div></div>
                    <button onClick={onGenerate} disabled={!estimate} className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"><Sparkles size={15}/> Generate video <span className="text-violet-200/80">→</span></button>
                    <p className="text-center text-[9px] leading-4 text-[#777789]">Preview only. No credits are charged and no paid API request is made.</p>
                  </div>
                </section>
                <section className="panel p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold"><Activity size={14} className="text-emerald-400"/> Generation checklist</div>{[{label:"Photo selected",ok:!!photoName},{label:"Audio selected",ok:!!audioName},{label:"Model pricing available",ok:!!estimate},{label:"HeyGen API connected",ok:false}].map((item) => <div key={item.label} className="flex items-center gap-2 py-2 text-[10px]"><span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-[#292936] text-[#777789]"}`}>{item.ok ? <Check size={10}/> : <Clock3 size={10}/>}</span><span className={item.ok ? "text-[#c9c9d3]" : "text-[#858596]"}>{item.label}</span></div>)}</section>
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
