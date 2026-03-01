import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How uByte collects, uses, and protects your data.",
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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
      <p className="mb-12 text-sm text-zinc-400">Last updated: {UPDATED}</p>

      <Section title="Who We Are">
        <p>uByte (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates the website at ubyte.dev — a free interactive platform for learning the Go programming language. This policy explains exactly what data we collect, why, and how long we keep it.</p>
        <p>Questions? Email us at <a href="mailto:privacy@ubyte.dev" className="text-cyan-600 hover:underline">privacy@ubyte.dev</a>.</p>
      </Section>

      <Section title="Age Requirement">
        <p>You must be at least <strong>13 years old</strong> to create an account or use uByte. We do not knowingly collect data from children under 13. If you believe a child under 13 has created an account, please contact us and we will delete it promptly.</p>
      </Section>

      <Section title="Data We Collect">
        <p><strong>Account data</strong> — when you sign up: your name, email address, and a bcrypt hash of your password (we never store your raw password). If you sign up with Google, we receive your Google ID, name, and email from Google OAuth.</p>
        <p><strong>Learning data</strong> — the tutorials you have completed, your XP points, streak count, bookmarks (tutorial slug + code snippet + optional note), and any achievements unlocked.</p>
        <p><strong>Playground snippets</strong> — code you share via the Playground &ldquo;Share&rdquo; button is stored so others can view it via the share link. Snippets are associated with your account if you are logged in.</p>
        <p><strong>Anonymous visitor tracking</strong> — if you browse without an account, a random <code>visitor_id</code> UUID is stored in a cookie to count page views (we limit free access to 20 unique tutorial pages). No personal information is in this ID.</p>
        <p><strong>IP addresses</strong> — we log your IP address transiently for rate limiting (e.g. preventing brute-force login attempts). IP-based records are deleted within 24 hours.</p>
        <p><strong>Activity log</strong> — we keep a log of significant account actions (e.g. progress reset, password change) for security auditing. Logs are retained for 90 days.</p>
      </Section>

      <Section title="Cookies We Set">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Cookie</th>
              <th className="py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Purpose</th>
              <th className="py-2 font-semibold text-zinc-700 dark:text-zinc-300">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <tr><td className="py-2 pr-4"><code>auth_token</code></td><td className="py-2 pr-4">HttpOnly JWT — keeps you logged in</td><td className="py-2">7 days</td></tr>
            <tr><td className="py-2 pr-4"><code>csrf_token</code></td><td className="py-2 pr-4">Prevents cross-site request forgery</td><td className="py-2">Session</td></tr>
            <tr><td className="py-2 pr-4"><code>visitor_id</code></td><td className="py-2 pr-4">Anonymous page-view counting for anonymous users</td><td className="py-2">1 year</td></tr>
            <tr><td className="py-2 pr-4"><code>cookie-consent</code></td><td className="py-2 pr-4">Remembers your cookie banner choice</td><td className="py-2">1 year</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Third-Party Services">
        <p><strong>Vercel Analytics</strong> — we use Vercel&apos;s built-in analytics for anonymous usage statistics (page views, country). No cookies are set by Vercel Analytics; data is aggregated and not linked to individuals.</p>
        <p><strong>Resend</strong> — transactional email (email verification, password reset). Resend receives your email address to deliver messages. See <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Resend&apos;s Privacy Policy</a>.</p>
        <p><strong>Google OAuth</strong> — if you choose &ldquo;Continue with Google&rdquo;, Google handles authentication and shares your name and email with us. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Google&apos;s Privacy Policy</a>.</p>
        <p><strong>Piston API</strong> — code you run in the interactive steps is sent to the Piston API (emkc.org), an open-source code execution API. Do not submit sensitive information in code you run.</p>
      </Section>

      <Section title="How We Use Your Data">
        <p>We use your data only to operate the service: authenticating you, saving your progress, displaying leaderboard rankings (name and XP, visible to other logged-in users), sending transactional emails you explicitly request, and preventing abuse via rate limiting.</p>
        <p>We do not sell your data, share it with advertisers, or use it for purposes beyond operating uByte.</p>
      </Section>

      <Section title="Data Retention">
        <p>Account data is kept until you delete your account (Settings → Delete Account). Deleted accounts are removed immediately and cascaded — all progress, bookmarks, and achievements are deleted.</p>
        <p>Anonymous page-view data is kept for 365 days. Rate-limit records are kept for up to 24 hours. Email verification tokens are cleared on use or overwritten on re-request.</p>
      </Section>

      <Section title="Your Rights">
        <p><strong>Export</strong> — download all your data as JSON from your profile settings or via <code>/api/profile/export</code>.</p>
        <p><strong>Delete</strong> — delete your account and all associated data from Profile → Settings → Delete Account.</p>
        <p><strong>Correct</strong> — update your name, bio, and avatar from Profile → Settings.</p>
        <p>If you need help exercising any of these rights, email us at <a href="mailto:privacy@ubyte.dev" className="text-cyan-600 hover:underline">privacy@ubyte.dev</a>.</p>
      </Section>

      <Section title="Security">
        <p>Passwords are hashed with bcrypt (cost 10). Auth tokens are stored in HttpOnly cookies not accessible to JavaScript. All communication uses HTTPS. We implement CSRF protection, account lockout after repeated failures, and token versioning to invalidate all sessions on logout.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We will post any changes here and update the &ldquo;Last updated&rdquo; date. Continued use of uByte after changes constitutes acceptance.</p>
      </Section>
    </div>
  );
}
