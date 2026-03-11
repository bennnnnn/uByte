import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How uByte collects, uses, and protects your personal data.",
  alternates: { canonical: absoluteUrl("/privacy") },
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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
      <p className="mb-12 text-sm text-zinc-400">Last updated: {UPDATED}</p>

      <Section title="Who We Are">
        <p>
          uByte (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website{" "}
          <strong>ubyte.dev</strong> — an online platform for learning programming through
          interactive tutorials, interview preparation, and certification exams. Our contact
          email is{" "}
          <a href="mailto:privacy@ubyte.dev" className="text-indigo-600 hover:underline">
            privacy@ubyte.dev
          </a>
          .
        </p>
      </Section>

      <Section title="Data We Collect">
        <p><strong>Account data</strong> — when you register, we collect your name, email address, and a hashed password (we never store your password in plain text). If you sign in with Google, we receive your name, email, and Google account ID.</p>
        <p><strong>Learning progress</strong> — tutorial step completions, practice problem attempts, certification exam results, XP points, streaks, and achievements.</p>
        <p><strong>Code submissions</strong> — code you write and run in tutorials or interview prep is sent to third-party execution services (see &ldquo;Third-Party Services&rdquo; below) to produce output. We do not permanently store the code you run unless you explicitly share a snippet.</p>
        <p><strong>Shared snippets</strong> — if you click &ldquo;Share&rdquo; in the Playground, the snippet is stored on our servers and accessible via its unique link.</p>
        <p><strong>Payment data</strong> — subscriptions are processed by Paddle, our Merchant of Record. We never see or store your card details. We receive a Paddle customer ID and subscription status to activate your plan.</p>
        <p><strong>AI feedback</strong> — Pro users may request AI-generated code feedback. Your code and the step context are sent to a third-party AI API to generate a response. We cache AI responses briefly to reduce API costs.</p>
        <p><strong>Usage and analytics</strong> — we collect page views and conversion events via Vercel Analytics (privacy-friendly, no cross-site tracking, no cookies). Error reports are collected via Sentry.</p>
        <p><strong>Push notification subscriptions</strong> — if you consent to notifications, we store your browser push endpoint and encryption keys to deliver streak reminders.</p>
        <p><strong>Contact messages</strong> — if you contact us via the contact form or email, we retain your message to respond to it.</p>
      </Section>

      <Section title="How We Use Your Data">
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide and personalise the Service (progress tracking, XP, streaks, certificates)</li>
          <li>Process your subscription and activate Pro features</li>
          <li>Send transactional emails (email verification, welcome, streak reminders, receipt)</li>
          <li>Send push notifications if you have opted in (streak reminders only)</li>
          <li>Detect and prevent abuse, fraud, and security incidents</li>
          <li>Improve the platform using aggregated, anonymised analytics</li>
          <li>Respond to support requests</li>
        </ul>
        <p>We do not sell your personal data. We do not use your data for advertising.</p>
      </Section>

      <Section title="Legal Basis (GDPR)">
        <p>If you are in the European Economic Area (EEA) or UK, our legal bases for processing are:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Contract</strong> — processing necessary to provide the Service you signed up for (account, progress, payments)</li>
          <li><strong>Legitimate interests</strong> — security, fraud prevention, analytics, and improving the Service</li>
          <li><strong>Consent</strong> — push notifications (you can withdraw at any time via your browser settings)</li>
          <li><strong>Legal obligation</strong> — retaining payment records as required by law</li>
        </ul>
      </Section>

      <Section title="Third-Party Services">
        <p>We share data with the following processors, only to the extent necessary to operate the Service:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Paddle</strong> (paddle.com) — payment processing and subscription management. Paddle is the Merchant of Record and has its own <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privacy Policy</a>.</li>
          <li><strong>Neon</strong> (neon.tech) — PostgreSQL database hosting. Data is stored in the US.</li>
          <li><strong>Vercel</strong> (vercel.com) — hosting and edge network. Logs request metadata for a limited period.</li>
          <li><strong>Resend</strong> (resend.com) — transactional email delivery.</li>
          <li><strong>Judge0</strong> — code execution for Python, JavaScript, Java, C++, and Rust. Code is sent to Judge0 servers for compilation and is not permanently stored by them.</li>
          <li><strong>Go Playground</strong> (go.dev) — code execution and formatting for Go. Subject to Google&apos;s <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privacy Policy</a>.</li>
          <li><strong>Vercel AI Gateway</strong> — AI code hints and feedback for Pro users. Code context is routed through Vercel&apos;s AI Gateway (ai.vercel.dev) and is subject to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Vercel&apos;s Privacy Policy</a>.</li>
          <li><strong>Sentry</strong> (sentry.io) — error monitoring. May capture stack traces and request metadata (never passwords or payment data).</li>
          <li><strong>Google OAuth</strong> — sign-in with Google. Subject to Google&apos;s Privacy Policy.</li>
        </ul>
      </Section>

      <Section title="Cookies and Local Storage">
        <p>We use a minimal set of cookies and browser storage:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Authentication cookie</strong> — a signed JWT to keep you logged in. HTTP-only, Secure, SameSite.</li>
          <li><strong>CSRF token cookie</strong> — protects form submissions from cross-site request forgery.</li>
          <li><strong>Theme preference</strong> — stored in <code>localStorage</code> to remember light/dark mode. Never sent to our servers.</li>
          <li><strong>Vercel Analytics</strong> — uses no cookies and performs no cross-site tracking.</li>
        </ul>
        <p>We do not use advertising cookies or third-party tracking pixels. If you accept our cookie consent banner, you also consent to Sentry error reporting.</p>
      </Section>

      <Section title="Data Retention">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Account data</strong> — retained until you delete your account</li>
          <li><strong>Learning progress</strong> — retained until account deletion</li>
          <li><strong>Shared code snippets</strong> — retained until you delete them or your account is closed; we may also purge inactive snippets after 12 months</li>
          <li><strong>Payment records</strong> — retained for 7 years as required by tax law (managed by Paddle)</li>
          <li><strong>Email logs</strong> — basic send/bounce records retained for 90 days</li>
          <li><strong>Error logs</strong> — retained in Sentry for 90 days</li>
        </ul>
      </Section>

      <Section title="Your Rights">
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Access</strong> — request a copy of the data we hold about you</li>
          <li><strong>Correction</strong> — update inaccurate data (most can be done via Profile → Settings)</li>
          <li><strong>Deletion</strong> — delete your account and all associated data via Profile → Settings → Delete account</li>
          <li><strong>Portability</strong> — request your data in a machine-readable format</li>
          <li><strong>Objection / Restriction</strong> — object to or restrict certain processing</li>
          <li><strong>Withdraw consent</strong> — opt out of push notifications at any time via browser settings</li>
        </ul>
        <p>
          To exercise any right, email{" "}
          <a href="mailto:privacy@ubyte.dev" className="text-indigo-600 hover:underline">
            privacy@ubyte.dev
          </a>
          . We will respond within 30 days. EEA/UK residents may also lodge a complaint with their local data protection authority.
        </p>
        <p><strong>California residents (CCPA)</strong> — you have the right to know what personal information we collect, the right to delete it, and the right to opt out of its sale. We do not sell personal information.</p>
      </Section>

      <Section title="Children">
        <p>uByte is not directed at children under 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with their data, contact us at{" "}
          <a href="mailto:privacy@ubyte.dev" className="text-indigo-600 hover:underline">privacy@ubyte.dev</a> and we will delete it promptly.</p>
      </Section>

      <Section title="International Transfers">
        <p>uByte is operated from the United States. If you are accessing the Service from outside the US, your data may be transferred to and processed in the US and other countries where our service providers operate. We ensure appropriate safeguards are in place (such as Standard Contractual Clauses where required) for transfers from the EEA or UK.</p>
      </Section>

      <Section title="Security">
        <p>We implement industry-standard security measures including HTTPS everywhere, HTTP-only signed cookies, bcrypt password hashing, CSRF protection, rate limiting on authentication endpoints, and input validation. No system is perfectly secure; we cannot guarantee absolute security, but we take reasonable precautions and will notify affected users of any breach as required by law.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes by email or by a notice on the platform at least 14 days before the change takes effect. Continued use of the Service after the effective date constitutes acceptance of the updated policy.</p>
      </Section>

      <Section title="Contact">
        <p>
          For privacy-related questions or to exercise your rights, contact us at{" "}
          <a href="mailto:privacy@ubyte.dev" className="text-indigo-600 hover:underline">
            privacy@ubyte.dev
          </a>
          . For general support, use{" "}
          <a href="/contact" className="text-indigo-600 hover:underline">
            our contact form
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
