import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using uByte.",
  alternates: { canonical: absoluteUrl("/terms") },
};

const UPDATED = "28 February 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Terms of Service</h1>
      <p className="mb-12 text-sm text-zinc-400">Last updated: {UPDATED}</p>

      <Section title="Acceptance">
        <p>By using uByte (&ldquo;the Service&rdquo;) you agree to these Terms. If you do not agree, do not use the Service. We may update these Terms at any time; continued use constitutes acceptance of any changes.</p>
      </Section>

      <Section title="Age Requirement">
        <p>You must be at least <strong>13 years old</strong> to create an account. By registering, you confirm that you meet this requirement. We reserve the right to terminate accounts that violate this rule.</p>
      </Section>

      <Section title="Your Account">
        <p>One account per person. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately if you suspect unauthorised access.</p>
        <p>You may not create accounts for others, use bots to create accounts, or share your account.</p>
      </Section>

      <Section title="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Attempt to bypass, exploit, or disrupt the platform or its security</li>
          <li>Abuse the code runner (e.g. mining, denial-of-service attacks, network scanning)</li>
          <li>Use the Service to harass, spam, or harm others</li>
          <li>Scrape the Service in a manner that degrades performance for other users</li>
          <li>Impersonate another person or entity</li>
          <li>Use the Service for any unlawful purpose</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these rules without notice.</p>
      </Section>

      <Section title="The Code Runner">
        <p>Interactive code steps send your code to the Piston API (emkc.org), an open-source code execution API. Do not submit secret keys, passwords, or personal information in code you run.</p>
        <p>Using the code runner to attempt denial-of-service attacks, cryptocurrency mining, or network intrusion is strictly prohibited and may result in immediate account termination and reporting to relevant authorities.</p>
      </Section>

      <Section title="Playground Snippets">
        <p>When you click &ldquo;Share&rdquo; in the Playground, your code is stored on our servers and assigned a public share link. Anyone with the link can view your snippet. Do not share code containing secrets, personal data, or malicious content.</p>
        <p>You retain ownership of code you write. By sharing a snippet you grant us a non-exclusive licence to store and serve it. We may delete snippets that violate these Terms or after extended periods of inactivity.</p>
      </Section>

      <Section title="Leaderboard and Public Profile Data">
        <p>Your display name and XP points are visible on the Leaderboard to other logged-in users. By using the Service you consent to this display. You can change your display name from your profile settings at any time.</p>
      </Section>

      <Section title="Tutorial Content">
        <p>All tutorial text, step instructions, and code examples on uByte are our original content and are protected by copyright. You may use the code examples in your own projects under the MIT licence. You may not reproduce tutorial text for commercial purposes without written permission.</p>
      </Section>

      <Section title="Disclaimer of Warranties">
        <p>uByte is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. We do not guarantee that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The Service will be available at all times</li>
          <li>Tutorial content is free of errors</li>
          <li>Completing tutorials will result in employment or specific skill outcomes</li>
        </ul>
      </Section>

      <Section title="Limitation of Liability">
        <p>To the maximum extent permitted by law, uByte and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, lost profits, or business interruption.</p>
      </Section>

      <Section title="Termination">
        <p>You may delete your account at any time from Profile → Settings. We may suspend or terminate your account for violations of these Terms. Upon termination, your data is deleted as described in our Privacy Policy.</p>
      </Section>

      <Section title="Governing Law">
        <p>These Terms are governed by applicable law. Any disputes shall be resolved through good-faith negotiation. If you have a complaint, contact us at <a href="mailto:support@ubyte.dev" className="text-indigo-600 hover:underline">support@ubyte.dev</a>.</p>
      </Section>
    </div>
  );
}
