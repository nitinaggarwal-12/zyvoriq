import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell eyebrow="Privacy" title="Privacy Policy" updated="September 2026">
      <LegalSection title="Information you provide">
        <p>Zyvoriq may store project briefs, generated project state, uploaded reference media, reusable people and location assets, publishing settings, and support requests that you choose to provide.</p>
      </LegalSection>
      <LegalSection title="How information is used">
        <p>Information is used to provide project creation, generation, editing, asset reuse, support, and publishing functionality. Connected third-party services may process information when you explicitly use those integrations.</p>
      </LegalSection>
      <LegalSection title="Reference media and identity assets">
        <p>If you upload images, voice-related metadata, or other identity references, you are responsible for having the rights and permissions needed to use them. Zyvoriq uses saved references to support continuity and generation inside your projects.</p>
      </LegalSection>
      <LegalSection title="Storage and deletion">
        <p>Project and asset data may be retained in the application database until it is deleted or retention rules require removal. Product-level export and deletion controls should be used where available; support can be contacted for requests that are not yet self-service.</p>
      </LegalSection>
      <LegalSection title="Third-party services">
        <p>Publishing and model providers have their own terms and privacy practices. Zyvoriq only enables a publishing channel when the required connection is configured.</p>
      </LegalSection>
    </LegalPageShell>
  );
}
