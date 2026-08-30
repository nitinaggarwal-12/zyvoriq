from pathlib import Path

p = Path('app/studio/ReelStudio.tsx')
s = p.read_text()

old = '  const [error, setError] = useState("");\n\n  const manifest = production?.manifest || null;'
new = '  const [error, setError] = useState("");\n  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);\n\n  const manifest = production?.manifest || null;'
if old not in s: raise SystemExit('state anchor not found')
s = s.replace(old, new, 1)

old = '  const roughCut = manifest?.outputs?.narratedRoughCut;\n  const canGenerateShot = Boolean(manifest && ["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(manifest.status) && generatedShotCount < totalShotCount);'
new = '  const roughCut = manifest?.outputs?.narratedRoughCut;\n  const generatedShots = manifest?.shots.filter(s => Boolean(s.asset?.videoUrl)) || [];\n  const selectedShot = (selectedShotId ? manifest?.shots.find(s => s.id === selectedShotId && s.asset?.videoUrl) : undefined) || (!roughCut ? generatedShots[0] : undefined);\n  const previewVideoUrl = selectedShot?.asset?.videoUrl || roughCut?.videoUrl || null;\n  const canGenerateShot = Boolean(manifest && ["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(manifest.status) && generatedShotCount < totalShotCount);'
if old not in s: raise SystemExit('preview anchor not found')
s = s.replace(old, new, 1)

old = '            {activeTab === "Scenes" && <ListPanel icon={Clapperboard} eyebrow="CANONICAL SHOT PLAN" title={manifest ? `${generatedShotCount}/${totalShotCount} real source clips generated` : "Build a plan to create shots"} items={scenes.length ? scenes : ["No persisted shot plan yet."]} />}'
new = '            {activeTab === "Scenes" && <ScenesPanel manifest={manifest} title={manifest ? `${generatedShotCount}/${totalShotCount} real source clips generated` : "Build a plan to create shots"} selectedShotId={selectedShot?.id || null} onReview={id => setSelectedShotId(id)} fallbackItems={scenes.length ? scenes : ["No persisted shot plan yet."]} />}'
if old not in s: raise SystemExit('scenes panel anchor not found')
s = s.replace(old, new, 1)

old = '''            {roughCut?.videoUrl ? (\n              <video key={roughCut.videoUrl} className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" src={roughCut.videoUrl} controls playsInline preload="metadata" />\n            ) : ('''
new = '''            {previewVideoUrl ? (\n              <div>\n                <div className="mb-3 flex items-center justify-between px-1">\n                  <div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-300">{selectedShot ? `Shot ${Math.max(1, (manifest?.shots.findIndex(s => s.id === selectedShot.id) ?? 0) + 1)} review` : "Narrated rough cut"}</div><div className="mt-1 text-xs text-slate-500">{selectedShot ? `${selectedShot.editorialStartSec.toFixed(1)}–${(selectedShot.editorialStartSec + selectedShot.editorialDurationSec).toFixed(1)}s · ${selectedShot.asset?.model || "generated source"}` : "Full production preview"}</div></div>\n                  {selectedShot && roughCut?.videoUrl && <button onClick={() => setSelectedShotId(null)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white">ROUGH CUT</button>}\n                </div>\n                <video key={previewVideoUrl} className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" src={previewVideoUrl} controls playsInline preload="metadata" />\n              </div>\n            ) : ('''
if old not in s: raise SystemExit('preview video anchor not found')
s = s.replace(old, new, 1)

anchor = '\nfunction CoverPanel({ topic }: { topic: string }) {'
component = '''

function ScenesPanel({ manifest, title, selectedShotId, onReview, fallbackItems }: { manifest: ReelProductionManifest | null; title: string; selectedShotId: string | null; onReview: (id: string) => void; fallbackItems: string[] }) {
  return <div>
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><Clapperboard className="h-5 w-5" /></div>
    <div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">CANONICAL SHOT PLAN</div>
    <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{title}</h2>
    {!manifest ? <div className="mt-8"><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-slate-300">{fallbackItems[0]}</div></div> : (
      <div className="mt-8 space-y-3">{manifest.shots.map((shot, i) => {
        const end = shot.editorialStartSec + shot.editorialDurationSec;
        const generated = Boolean(shot.asset?.videoUrl);
        const selected = selectedShotId === shot.id;
        return <div key={shot.id} className={`rounded-2xl border p-4 transition ${selected ? "border-pink-300/40 bg-pink-300/[0.06]" : "border-white/10 bg-white/[0.025]"}`}>
          <div className="flex gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{i + 1}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm leading-7 text-slate-300">{shot.editorialStartSec.toFixed(1)}–{end.toFixed(1)}s · {shot.visualIntent}</div>
              <div className={`mt-1 text-xs font-semibold ${generated ? "text-emerald-300/80" : "text-slate-600"}`}>{generated ? `Generated ${shot.asset?.actualDurationSec?.toFixed(2) || "?"}s · ${shot.asset?.model || "provider"}` : `Needs ${shot.generationDurationSec}s source`}</div>
              {generated && <button onClick={() => onReview(shot.id)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-pink-300/25 bg-pink-300/[0.06] px-3 py-2 text-xs font-black text-pink-100 transition hover:border-pink-300/50 hover:bg-pink-300/[0.1]" aria-label={`Review shot ${i + 1}`}><Video className="h-4 w-4" />{selected ? "Reviewing shot" : `Review shot ${i + 1}`}</button>}
            </div>
          </div>
        </div>;
      })}</div>
    )}
    {manifest && manifest.shots.some(s => s.asset?.videoUrl) && <div className="mt-4 text-xs leading-5 text-slate-600">Select <span className="font-bold text-slate-400">Review shot</span> to play the real generated source in the preview panel. Browser video controls support play, pause, seek, volume and full-screen review.</div>}
  </div>;
}
'''
if anchor not in s: raise SystemExit('component insertion anchor not found')
s = s.replace(anchor, component + anchor, 1)
p.write_text(s)
