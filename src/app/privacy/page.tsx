import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How uByte collects, uses, and protects your data.",
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
        <p>uByte (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates the website at ubyte.dev — an interactive platform for learning programming languages including Go, Python, JavaScript, Java, Rust, and C++. This policy explains what data we collect, why, and how long we keep it.</p>
        <p>Questions? Email us at <a href="mailto:privacy@ubyte.dev" className="text-indigo-600 hover:underline">privacy@ubyte.dev</a>.</p>
      </Section>

      <Section title="Age Requirement">
        <p>You must be at least <strong>13 years old</strong> to create an account or use uByte. We do not knowingly collect data from children under 13. If you believe a child under 13 has created an account, please contact us and we will delete it promptly.</p>
      </Section>

      <Section title="Legal Bases for Processing (GDPR)">
        <p>If you are in the European Economic Area (EEA) or United Kingdom, we process your data under the following legal bases:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Contract</strong> — processing necessary to provide the Service (account management, progress tracking, code execution, billing).</li>
          <li><strong>Consent</strong> — optional analytics cookies are only loaded after you click &ldquo;Accept all&rdquo; in our cookie banner.</li>
          <li><strong>Legitimate interest</strong> — security measures (rate limiting, fraud prevention, error monitoring) and service improvement.</li>
        </ul>
      </Section>

      <Section title="Data We Collect">
        <p><strong>Account data</strong> — when you sign up: your name, email address, and a bcrypt hash of your password (we never store your raw password). If you sign up with Google, we receive your Google ID, name, and email from Google OAuth.</p>
        <p><strong>Learning data</strong> — the tutorials you have completed, your XP points, streak count, bookmarks (tutorial slug + code snippet + optional note), and any achievements unlocked.</p>
        <p><strong>Interview prep data</strong> — your practice problem attempts, solutions, and notes.</p>
        <p><strong>Certification data</strong> — exam attempts, scores, and certificates earned.</p>
        <p><strong>Playground snippets</strong> — code you share via the Playground &ldquo;Share&rdquo; button is stored so others can view it via the share link.</p>
        <p><strong>Payment data</strong> — if you subscribe to a paid plan, payment processing is handled entirely by Paddle. We receive your Paddle customer ID and subscription status but never see your full card number or bank details.</p>
        <p><strong>Anonymous visitor tracking</strong> — if you browse without an account, a random <code>visitor_id</code> UUID is stored in a cookie to count page views. No personal information is in this ID.</p>
        <p><strong>IP addresses</strong> — we log your IP address transiently for rate limiting (e.g. preventing brute-force login attempts). IP-based records are deleted within 24 hours.</p>
        <p><strong>Activity log</strong> — we keep a log of significant account actions (e.g. progress reset, password change) for security auditing. Logs are retained for 90 days.</p>
      </Section>

      <Section title="Cookies We Set">
        <p>We categorise our cookies as follows:</p>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-2">Strictly necessary (always active)</p>
        <table className="w-full text-left text-xs mt-2">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Cookie</th>
              <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Purpose</th>
              <th className="py-2 font-semibold text-zinc-700 dark:text-zinc-300">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr><td className="py-2 pr-4"><code>auth_token</code></td><td className="py-2 pr-4">HttpOnly JWT — keeps you logged in</td><td className="py-2">30 days</td></tr>
            <tr><td className="py-2 pr-4"><code>csrf_token</code></td><td className="py-2 pr-4">Prevents cross-site request forgery</td><td className="py-2">7 days</td></tr>
            <tr><td className="py-2 pr-4"><code>visitor_id</code></td><td className="py-2 pr-4">Anonymous page-view counting for free-tier limits</td><td className="py-2">1 year</td></tr>
          </tbody>
        </table>

        <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-4">Optional (require consent)</p>
        <table className="w-full text-left text-xs mt-2">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Cookie / Storage</th>
              <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Purpose</th>
              <th className="py-2 font-semibold text-zinc-700 dark:text-zinc-300">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr><td className="py-2 pr-4">Vercel Analytics</td><td className="py-2 pr-4">Anonymous page-view statistics to improve the site</td><td className="py-2">Session</td></tr>
          </tbody>
        </table>

        <p className="mt-3">Your consent preference is stored in your browser&apos;s <code>localStorage</code> under the key <code>cookie-consent</code>. You can change your choice at any time by clearing your browser&apos;s local storage for ubyte.dev, which will re-display the cookie banner.</p>
      </Section>

      <Section title="Third-Party Services">
        <p>We use the following third-party services that may process your data:</p>
        <p><strong>Paddle</strong> — payment processing for subscriptions. Paddle acts as the Merchant of Record and processes your payment details. We only receive your customer ID and subscription status. See <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Paddle&apos;s Privacy Policy</a>.</p>
        <p><strong>Google OAuth</strong> — if you choose &ldquo;Continue with Google&rdquo;, Google handles authentication and shares your name and email with us. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google&apos;s Privacy Policy</a>.</p>
        <p><strong>Resend</strong> — transactional email (email verification, password reset). Resend receives your email address to deliver messages. See <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Resend&apos;s Privacy Policy</a>.</p>
        <p><strong>Sentry</strong> — error monitoring. When an error occurs, Sentry receives diagnostic data (browser type, page URL, error details). No personal data is intentionally sent. See <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sentry&apos;s Privacy Policy</a>.</p>
        <p><strong>Vercel Analytics</strong> — anonymous page-view statistics (only loaded after you consent to optional cookies). Data is aggregated and not linked to individuals. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Vercel&apos;s Privacy Policy</a>.</p>
        <p><strong>Code execution services</strong> — code you run in interactive tutorials and interview prep is sent to third-party execution engines (Judge0 for Python, JavaScript, Java, C++, and Rust; Go Playground for Go). Your code is sent for compilation and execution only. Do not submit sensitive information in code you run.</p>
        <p><strong>xAI (Grok)</strong> — if you use the AI code feedback feature (Pro plan), your code submission is sent to xAI&apos;s API for analysis. See <a href="https://x.ai/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">xAI&apos;s Privacy Policy</a>.</p>
      </Section>

      <Section title="How We Use Your Data">
        <p>We use your data only to operate the service: authenticating you, saving your progress, displaying leaderboard rankings (name and XP, visible to other users), processing payments through Paddle, sending transactional emails you explicitly request, and preventing abuse via rate limiting.</p>
        <p>We do not sell your data, share it with advertisers, or use it for purposes beyond operating uByte.</p>
      </Section>

      <Section title="Data Retention">
        <p>Account data is kept until you delete your account (Profile → Settings → Delete Account). Deleted accounts are removed immediately and cascaded — all progress, bookmarks, achievements, and submissions are deleted.</p>
        <p>Anonymous page-view data is kept for 365 days. Rate-limit records are kept for up to 24 hours. Email verification tokens are cleared on use or overwritten on re-request.</p>
      </Section>

      <Section title="Your Rights">
        <p>Under GDPR and similar privacy laws, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Access &amp; export</strong> — download all your data as JSON from your profile settings or via <code>/api/profile/export</code>.</li>
          <li><strong>Delete</strong> — delete your account and all associated data from Profile → Settings → Delete Account.</li>
          <li><strong>Correct</strong> — update your name, bio, and avatar from Profile → Settings.</li>
          <li><strong>Object</strong> — you may object to processing based on our legitimate interest by contacting us.</li>
          <li><strong>Withdraw consent</strong> — you can withdraw cookie consent at any time by clearing your browser&apos;s localStorage for ubyte.dev.</li>
          <li><strong>Complain</strong> — you have the right to lodge a complaint with your local data protection authority.</li>
        </ul>
        <p>To exercise any of these rights, email us at <a href="mailto:privacy@ubyte.dev" className="text-indigo-600 hover:underline">privacy@ubyte.dev</a>.</p>
      </Section>

      <Section title="International Transfers">
        <p>Our servers and third-party services may process data outside your country of residence. Where data is transferred outside the EEA, we rely on the provider&apos;s standard contractual clauses or equivalent safeguards.</p>
      </Section>

      <Section title="Security">
        <p>Passwords are hashed with bcrypt (cost 10). Auth tokens are stored in HttpOnly cookies not accessible to JavaScript. All communication uses HTTPS. We implement CSRF protection, account lockout after repeated failures, and token versioning to invalidate all sessions on logout.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We will post any changes here and update the &ldquo;Last updated&rdquo; date. For material changes, we will notify registered users via email. Continued use of uByte after changes constitutes acceptance.</p>
      </Section>
    </div>
  );
}
