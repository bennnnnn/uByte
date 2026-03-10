import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using uByte.",
  alternates: { canonical: absoluteUrl("/terms") },
};

const UPDATED = "3 March 2026";

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

      <Section title="Plans, Payments, and Refunds">
        <p><strong>Free tier</strong> — uByte offers a free tier with limited access to tutorials, interview prep problems, and features as described on the pricing page.</p>
        <p><strong>Pro subscription</strong> — paid subscriptions are billed monthly or annually through Paddle, our Merchant of Record. By subscribing, you agree to Paddle&apos;s <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Terms of Service</a>. Paddle handles all payment processing, invoicing, and sales tax/VAT.</p>
        <p><strong>Automatic renewal</strong> — subscriptions renew automatically at the end of each billing period unless cancelled. You can cancel at any time from your Paddle subscription management portal.</p>
        <p><strong>Refunds</strong> — if you are not satisfied with your Pro subscription, you may request a refund within 7 days of your initial purchase by contacting <a href="mailto:support@ubyte.dev" className="text-indigo-600 hover:underline">support@ubyte.dev</a>. Refunds are processed through Paddle. After the 7-day window, no refunds will be issued for the current billing period, but you may cancel to prevent future charges.</p>
        <p><strong>Price changes</strong> — we may change subscription prices with 30 days&apos; notice via email. Changes take effect at the next billing cycle.</p>
      </Section>

      <Section title="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Attempt to bypass, exploit, or disrupt the platform or its security</li>
          <li>Abuse the code execution service (e.g. mining, denial-of-service attacks, network scanning)</li>
          <li>Use the Service to harass, spam, or harm others</li>
          <li>Scrape the Service in a manner that degrades performance for other users</li>
          <li>Impersonate another person or entity</li>
          <li>Use the Service for any unlawful purpose</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that violate these rules without notice.</p>
      </Section>

      <Section title="Code Execution">
        <p>Interactive tutorial steps and interview prep problems send your code to third-party execution services (Judge0 for Python, JavaScript, Java, C++, and Rust; Go Playground for Go) for compilation and execution. Do not submit secret keys, passwords, or personal information in code you run.</p>
        <p>Using the code execution service to attempt denial-of-service attacks, cryptocurrency mining, or network intrusion is strictly prohibited and may result in immediate account termination.</p>
      </Section>

      <Section title="Certifications">
        <p>Pro subscribers may take certification exams. Upon passing, you receive a verifiable digital certificate. Certificates attest only that you passed the exam at a given time; they do not represent an accredited qualification. We reserve the right to revoke certificates obtained through cheating or other violations of these Terms.</p>
      </Section>

      <Section title="Playground Snippets">
        <p>When you click &ldquo;Share&rdquo; in the Playground, your code is stored on our servers and assigned a public share link. Anyone with the link can view your snippet. Do not share code containing secrets, personal data, or malicious content.</p>
        <p>You retain ownership of code you write. By sharing a snippet you grant us a non-exclusive licence to store and serve it. We may delete snippets that violate these Terms or after extended periods of inactivity.</p>
      </Section>

      <Section title="AI Code Feedback">
        <p>Pro users may receive AI-generated code feedback powered by third-party AI services. AI responses are informational and may contain errors. We are not liable for actions taken based on AI feedback.</p>
      </Section>

      <Section title="Leaderboard and Public Profile Data">
        <p>Your display name, XP points, and learning progress are visible on your public profile and the Leaderboard. By using the Service you consent to this display. You can change your display name from your profile settings at any time.</p>
      </Section>

      <Section title="Tutorial Content">
        <p>All tutorial text, step instructions, and code examples on uByte are our original content and are protected by copyright. You may use the code examples in your own projects under the MIT licence. You may not reproduce tutorial text for commercial purposes without written permission.</p>
      </Section>

      <Section title="Disclaimer of Warranties">
        <p>uByte is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. We do not guarantee that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The Service will be available at all times</li>
          <li>Tutorial content is free of errors</li>
          <li>Completing tutorials or certifications will result in employment or specific skill outcomes</li>
        </ul>
      </Section>

      <Section title="Limitation of Liability">
        <p>To the maximum extent permitted by law, uByte and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, lost profits, or business interruption.</p>
      </Section>

      <Section title="Termination">
        <p>You may delete your account at any time from Profile → Settings. We may suspend or terminate your account for violations of these Terms. Upon termination, your data is deleted as described in our Privacy Policy.</p>
        <p>If you have an active paid subscription at the time of account deletion, your subscription will be cancelled and no further charges will occur. No partial-period refunds are issued for voluntary deletion.</p>
      </Section>

      <Section title="Governing Law">
        <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict-of-law provisions. Any disputes arising from these Terms or the Service shall first be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration under the rules of the American Arbitration Association. Nothing in this section limits your statutory rights under applicable consumer protection law.</p>
        <p>If you have a complaint, contact us at <a href="mailto:support@ubyte.dev" className="text-indigo-600 hover:underline">support@ubyte.dev</a>.</p>
      </Section>
    </div>
  );
}
