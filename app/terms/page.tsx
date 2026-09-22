import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export default function TermsPage() {
  return (
    <LegalPageShell eyebrow="Terms" title="Terms of Service" updated="September 2026">
      <LegalSection title="Use of the service">
        <p>Zyvoriq provides AI-assisted tools for creating, managing, reviewing, and publishing media projects. Features may depend on third-party model and publishing services and may change as those services evolve.</p>
      </LegalSection>
      <LegalSection title="Your content and permissions">
        <p>You remain responsible for the content, references, prompts, assets, and publishing instructions you provide. You must have the permissions needed to use uploaded likenesses, voices, copyrighted works, trademarks, and other protected material.</p>
      </LegalSection>
      <LegalSection title="Generated output">
        <p>Rights in AI-generated output can vary by jurisdiction and by the terms of underlying providers. Zyvoriq does not guarantee that every generated output is eligible for copyright or exclusive ownership. Review applicable laws and provider terms before commercial use.</p>
      </LegalSection>
      <LegalSection title="Acceptable use">
        <p>Do not use the service for unlawful activity, non-consensual impersonation, rights-infringing content, fraud, or other prohibited uses. Human review remains required before publication.</p>
      </LegalSection>
      <LegalSection title="Availability and third-party dependencies">
        <p>The service may be interrupted by model quotas, provider outages, network failures, or maintenance. Connected publishing services require valid credentials and must confirm publication before Zyvoriq reports a post as published.</p>
      </LegalSection>
    </LegalPageShell>
  );
}
