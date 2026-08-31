import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveArtifact } from "@/lib/artifact/resolver";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function payloadText(value: unknown) {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value ?? ""); }
}

export default async function ArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveArtifact(id);
  if (!resolved) notFound();
  const { artifact, project, payload, children } = resolved;
  const projectEditPath = project.id.startsWith("studio1_") ? `/studio1?productionId=${encodeURIComponent(project.id)}` : `/studio/inspector?productionId=${encodeURIComponent(project.id)}`;

  return <main className="min-h-screen bg-[#07090d] px-5 py-10 text-slate-100 md:px-10">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Canonical Zyvoriq artifact</div>
          <h1 className="mt-2 break-words text-3xl font-black tracking-[-0.035em] text-white">{artifact.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400"><span className="rounded-lg border border-white/10 px-2 py-1">{artifact.kind}</span><span className="rounded-lg border border-white/10 px-2 py-1">{artifact.role}</span><span className="rounded-lg border border-white/10 px-2 py-1">revision {project.revision}</span></div>
        </div>
        <div className="flex flex-wrap gap-2"><Link href={projectEditPath} className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950">Open project</Link><Link href="/studio/library" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold">Library</Link></div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Artifact ID</div><div className="mt-2 break-all font-mono text-sm text-white">{artifact.id}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Parent project ID</div><div className="mt-2 break-all font-mono text-sm text-white">{artifact.parentProjectId || project.id}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Canonical URL path</div><div className="mt-2 break-all font-mono text-sm text-white">{artifact.canonicalPath}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Project URL path</div><div className="mt-2 break-all font-mono text-sm text-white">{project.canonicalPath}</div></div>
      </section>

      {artifact.mediaUrl && <section className="mt-6 rounded-3xl border border-white/10 bg-[#0b0e13] p-4">
        {artifact.kind === "audio" ? <audio src={artifact.mediaUrl} controls preload="metadata" className="w-full"/> : artifact.kind === "image" ? <img src={artifact.mediaUrl} alt={artifact.title} className="max-h-[70vh] w-full rounded-2xl object-contain"/> : <video src={artifact.mediaUrl} controls playsInline preload="metadata" className="max-h-[75vh] w-full rounded-2xl bg-black object-contain"/>}
        <a href={artifact.mediaUrl} target="_blank" className="mt-3 inline-flex rounded-xl border border-white/10 px-3 py-2 text-xs font-bold">Open raw media</a>
      </section>}

      {children?.length ? <section className="mt-8"><div className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">Generated children · {children.length}</div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children.map(child => <Link key={child.id} href={child.canonicalPath} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 hover:bg-white/[0.05]"><div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{child.kind} · {child.role}</div><div className="mt-1 font-bold text-white">{child.title}</div><div className="mt-2 break-all font-mono text-[10px] text-slate-600">{child.id}</div></Link>)}</div></section> : null}

      <section className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5"><div className="text-xs font-black uppercase tracking-[0.16em] text-pink-300">Artifact payload</div><pre className="mt-4 max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/30 p-4 text-xs leading-6 text-slate-300">{payloadText(payload)}</pre></section>
    </div>
  </main>;
}
