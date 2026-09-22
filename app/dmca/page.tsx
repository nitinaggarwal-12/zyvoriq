import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export default function DmcaPage() {
  return (
    <LegalPageShell eyebrow="Copyright" title="Copyright & Takedown Requests" updated="September 2026">
      <LegalSection title="Reporting copyright concerns">
        <p>If you believe content available through Zyvoriq infringes your copyright, submit a request with enough information for the material and claimed work to be identified.</p>
      </LegalSection>
      <LegalSection title="What to include">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your name and contact information.</li>
          <li>A description of the copyrighted work.</li>
          <li>The project, URL, or other identifier for the material at issue.</li>
          <li>A statement describing why you believe the use is unauthorized.</li>
          <li>Any additional information reasonably needed to investigate the request.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Submit a request">
        <p>Use the Support page and select the Legal / copyright category. Zyvoriq will record the request for review.</p>
        <Link href="/contact" className="inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Open Support</Link>
      </LegalSection>
    </LegalPageShell>
  );
}
