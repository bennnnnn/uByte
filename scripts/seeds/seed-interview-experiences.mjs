#!/usr/bin/env node
/**
 * Seed realistic interview experiences so /interviews isn't empty on launch.
 *
 * Usage:
 *   node scripts/seeds/seed-interview-experiences.mjs
 *
 * Idempotent — skips rows that already exist (matched by company+role+rounds hash).
 * Safe to re-run.
 */
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const value = m[2].replace(/^["']|["']$/g, "").trim();
      process.env[m[1]] = value;
    }
  }
}

loadEnvLocal();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(url);

const EXPERIENCES = [
  {
    company: "Google",
    role: "Software Engineer L4",
    difficulty: "hard",
    outcome: "offer",
    anonymous: true,
    rounds: `Phone screen (45 min): Two medium-difficulty LeetCode-style problems — sliding window and binary search on a sorted matrix. Moved on the same day.

Virtual onsite (5 rounds × 45 min):
1. Coding — graph BFS/DFS, find all paths between two nodes with constraints
2. Coding — DP, maximum profit with cooldown (LeetCode 309 variant)
3. System design — design a URL shortener at Google scale (billions of URLs)
4. Behavioral — leadership and conflict resolution using STAR format
5. Googleyness — values and culture fit, why Google, what motivates you

Received verbal offer 5 business days after onsite.`,
    tips: `Practice on a whiteboard or blank doc — no IDE autocomplete during the interview. Think out loud from the first second; interviewers care more about your process than getting the perfect answer.

For system design, always start with requirements (scale, latency, consistency). Don't jump straight to architecture. I was asked to estimate QPS and storage before drawing anything.

LeetCode 150 + Blind 75 is plenty. Don't grind 500 problems — go deep on patterns instead.`,
  },
  {
    company: "Meta",
    role: "Software Engineer E4",
    difficulty: "hard",
    outcome: "rejection",
    anonymous: true,
    rounds: `Recruiter screen (30 min): Background, motivation, timeline. Very friendly.

Technical phone screen (60 min): One coding problem — serialize and deserialize a binary tree. Got it right but was slow on the follow-up (could you do it with less memory?).

Onsite loop (4 rounds):
1. Coding — two problems: valid parentheses variant + merge k sorted lists
2. Coding — design a data structure supporting insert, delete, getRandom in O(1)
3. System design — design Facebook's news feed
4. Behavioral — past projects, disagreements with managers, biggest failure

Result: rejected at the coding round. Feedback was "strong in design but coding speed needs improvement."`,
    tips: `Meta really cares about coding speed. They expect you to code clean solutions quickly — no pseudocode first, write real code from the start. I spent too long explaining before typing.

For system design, Meta loves talking about feed ranking, social graphs, and real-time notifications. Read their engineering blog posts before the interview — they came up in conversation.

Behavioral: prepare 6–8 STAR stories covering failure, conflict, influence without authority, and ownership. They'll ask all of them.`,
  },
  {
    company: "Amazon",
    role: "SDE II",
    difficulty: "medium",
    outcome: "offer",
    anonymous: false,
    rounds: `OA (2 hours): Two coding problems on HackerRank + a Work Style Assessment (personality questionnaire). Problems were medium difficulty — one array manipulation, one graph/BFS.

Virtual loop (5 rounds × 60 min — bar raiser included):
1. Coding + LP — two problems (two sum variant, string parsing) + 2 leadership principle questions
2. Coding + LP — binary search + tree traversal + 2 LP questions
3. System design — design Amazon's product recommendation engine
4. LP focus (bar raiser) — deep dive into a past project, lots of "why" follow-ups
5. Coding + LP — DP problem (coin change variant) + LP questions

Amazon is 50% LP. Every round has at least two behavioral questions.`,
    tips: `Prepare at least 10 STAR stories mapped to Amazon's 16 Leadership Principles. Print them out, rehearse them out loud. "Customer Obsession", "Ownership", "Deliver Results", and "Dive Deep" come up in every loop.

For the bar raiser round, they'll dig into one past project in extreme detail. Know your numbers (latency, throughput, team size, timelines) cold.

Don't ignore the OA Work Style Assessment — answer consistently and don't try to game it.`,
  },
  {
    company: "Stripe",
    role: "Software Engineer",
    difficulty: "hard",
    outcome: "offer",
    anonymous: true,
    rounds: `Recruiter chat (30 min): Role overview, compensation discussion (Stripe is very transparent about pay upfront).

Technical screen (60 min): Pair programming in a shared editor — build a simplified in-memory rate limiter supporting multiple algorithms. Not a LeetCode problem — more of a practical design + coding exercise. You're expected to write working code, not pseudocode.

Onsite (4 rounds):
1. Systems — design Stripe's payment processing pipeline, focus on reliability and idempotency
2. Coding — two practical problems (CSV parser, then extend it with filtering/aggregation)
3. Integration — design Stripe's webhook delivery system with retries and ordering guarantees
4. Values — culture fit, what kind of engineer are you, how do you handle ambiguity`,
    tips: `Stripe interviews are different from FAANG. They want to see how you write real production code, not just solve puzzles. Think about error handling, edge cases, and readability as you code.

For systems design, Stripe deeply cares about correctness and reliability — idempotency keys, at-least-once vs exactly-once delivery, distributed transactions. Study those concepts deeply.

Read Stripe's API docs and blog before the interview. Understanding how Stripe actually works helped me answer design questions confidently.`,
  },
  {
    company: "Microsoft",
    role: "Software Engineer II",
    difficulty: "medium",
    outcome: "offer",
    anonymous: true,
    rounds: `Recruiter screen (30 min): Background and role alignment.

Phone screen (60 min): One coding problem — LRU cache implementation. Straightforward.

Onsite loop (4 rounds × 60 min):
1. Coding — design and implement a file system with mkdir, ls, and cat commands
2. Coding — graph problem (course schedule / topological sort)
3. System design — design a distributed key-value store
4. Behavioral — tell me about yourself, past projects, collaboration with difficult people

Overall more relaxed than Google/Meta. Interviewers are approachable and give hints if you're stuck.`,
    tips: `Microsoft values communication and collaboration heavily. Don't just code silently — narrate your thought process and ask clarifying questions before starting.

The design round wasn't as deep as Google's — they cared more about whether I knew the tradeoffs (SQL vs NoSQL, caching strategies) than an exhaustive deep dive.

Prepare standard LC medium problems: linked lists, trees, graphs, and DP. Nothing too exotic.`,
  },
  {
    company: "Airbnb",
    role: "Software Engineer",
    difficulty: "hard",
    outcome: "rejection",
    anonymous: true,
    rounds: `Phone screen (45 min): One coding problem — design a simple booking conflict detector (given a list of reservations, find overlapping ones efficiently).

Onsite (6 rounds — yes, six):
1. Coding — implement a simplified version of React's reconciliation diff algorithm
2. Coding — design an autocomplete system, then optimize for latency
3. System design — design Airbnb's search feature with geo-filtering and ranking
4. Cross-functional — how do you work with product managers and designers?
5. Estimation — how would you measure the success of a new feature?
6. Experience — deep dive into most complex past project

Rejected after onsite. No specific feedback given.`,
    tips: `Airbnb's onsite is long and exhausting. Eat well, sleep well, and pace yourself.

The cross-functional and estimation rounds surprised me — I wasn't prepared for "how do you measure success" style questions. Research A/B testing, metrics, and product thinking.

For coding, they like problems that mirror real product challenges (booking, search, recommendations) rather than pure algorithm puzzles. Practice "product engineering" style problems.`,
  },
  {
    company: "Netflix",
    role: "Senior Software Engineer",
    difficulty: "hard",
    outcome: "offer",
    anonymous: true,
    rounds: `Recruiter screen (45 min): Very detailed discussion about career goals and leadership experience. Netflix is selective about culture fit from the very start.

Hiring manager screen (60 min): Half technical discussion about past architecture decisions, half about how I handle "freedom and responsibility."

Technical screen (60 min): System design only — design Netflix's video encoding pipeline for a new device category. No coding at this stage.

Onsite (5 rounds):
1. System design — design Netflix's recommendation system at 200M users
2. System design — design the CDN layer for video delivery
3. Coding — two medium problems (rate limiting, distributed counter)
4. Values — intense discussion around past decisions, handling conflict, ownership
5. Leadership — how have you influenced engineers outside your team?`,
    tips: `Netflix barely does LeetCode-style coding. It's almost all system design and values. If you can't talk coherently about distributed systems, caching, CDNs, and microservices for 4+ hours straight, you'll struggle.

Study Netflix's tech blog extensively. They'll ask about real decisions Netflix has made and why.

"Freedom and Responsibility" is not just a slogan — they'll probe deeply whether you actually operate that way. Have concrete examples ready of times you acted like an owner without being told to.`,
  },
  {
    company: "Uber",
    role: "Software Engineer II",
    difficulty: "medium",
    outcome: "ghosted",
    anonymous: true,
    rounds: `Recruiter email → technical phone screen scheduled.

Technical phone screen (60 min): Two problems — one easy string manipulation, one medium graph (find the shortest path in a city map). Did well on both.

Recruiter said "we'll be in touch within a week about next steps."

Never heard back. Followed up twice over 3 weeks. No response.`,
    tips: `Always get the recruiter's direct email before the interview ends. Ghosting seems to happen more often when there's a recruiter queue backlog.

If you're serious about Uber, try to get a warm referral — it makes a real difference in getting a timely response. Cold applications and even cold phone screens can disappear into the void.`,
  },
  {
    company: "Coinbase",
    role: "Backend Engineer",
    difficulty: "medium",
    outcome: "offer",
    anonymous: false,
    rounds: `Recruiter screen (30 min): Role overview + background check on crypto experience (you don't need it but helps).

Technical take-home (3–4 hours): Build a simple blockchain transaction validator in the language of your choice. They care about code quality and test coverage, not just working code.

Technical review (60 min): Walk through your take-home, defend your design decisions, then one live coding problem (implement a simple LRU cache).

Values interview (45 min): Why crypto, mission alignment, how you handle uncertainty.`,
    tips: `The take-home is serious — write it like production code. Add tests, handle edge cases, document your decisions. Reviewers specifically mentioned my test coverage in the feedback.

For the values round, Coinbase wants genuine enthusiasm for the mission. Generic "I believe in decentralization" won't cut it. Have specific opinions about crypto's role in the financial system.

Turnaround from take-home submission to offer was under 2 weeks, which felt fast compared to FAANG.`,
  },
  {
    company: "Shopify",
    role: "Software Developer",
    difficulty: "medium",
    outcome: "offer",
    anonymous: true,
    rounds: `Technical screen (90 min): Pair programming in a real editor (VSCode) — build a simplified e-commerce cart system with discount rules. Live collaboration, not whiteboard.

Values screen (45 min): Shopify's "Impact" values, what makes great engineering, how you work remotely.

Onsite (3 rounds):
1. System design — design Shopify's checkout flow at Black Friday scale
2. Coding — extend the cart system from the technical screen with new requirements
3. Hiring manager + career discussion — growth plans, interests, how you handle ownership`,
    tips: `Shopify is remote-first and values async communication and autonomy. Have strong examples of working independently without micromanagement.

The "extend the take-home" approach in the onsite is great — you're working on familiar code rather than starting from scratch under pressure. Use the time you've already spent thinking about the problem.

For Black Friday scale questions: think about queue-based order processing, database read replicas, circuit breakers, and graceful degradation. They've written extensively about this publicly.`,
  },
  {
    company: "Palantir",
    role: "Software Engineer",
    difficulty: "hard",
    outcome: "rejection",
    anonymous: true,
    rounds: `Recruiter screen (30 min): Background, cleared security clearance potential (some roles require it).

Karat interview (60 min): Third-party coding interview — two medium problems, timed. Felt impersonal.

Onsite (decomposition + coding):
1. Decomposition — given a vague problem (design a hospital scheduling system), break it down into components and APIs. 60 min, open-ended.
2. Coding — implement a simplified version of one component from the decomposition exercise. 60 min.
3. Culture — Palantir's mission, working in high-stakes environments, ethics in data use.

Rejected after coding round. Feedback: "strong decomposition but implementation didn't match design."`,
    tips: `The decomposition round is unique to Palantir and trips people up. Practice breaking down real-world messy problems into clean abstractions. Think about edge cases, failure modes, and user experience — not just APIs.

The coding round is directly connected to decomposition — whatever you design, you implement. Make sure your design is actually implementable in 60 minutes.

Palantir cares a lot about mission alignment. If you're uncomfortable with government/defense clients, you'll feel it in the culture round.`,
  },
  {
    company: "Datadog",
    role: "Software Engineer",
    difficulty: "medium",
    outcome: "offer",
    anonymous: true,
    rounds: `Recruiter screen (30 min): Role overview and background.

Technical screen (60 min): One coding problem — design a metrics aggregation system that supports counters, gauges, and histograms. Very relevant to what Datadog actually builds.

Onsite (4 rounds):
1. Coding — implement a log parser that extracts structured data from raw log lines
2. System design — design a distributed tracing system (basically design Datadog APM)
3. Debugging — given a live (simulated) production incident with metrics graphs, diagnose and describe a remediation plan
4. Behavioral — past technical decisions, cross-team collaboration`,
    tips: `Datadog loves problems that match their actual product domain. Study observability concepts: metrics, logs, traces, alerting, sampling strategies, cardinality.

The debugging round was unusual and fun. They show you real-looking dashboards and ask you to diagnose issues. Practice reading metric graphs and forming hypotheses quickly.

The company is growing fast — mentioning specific Datadog products you've used personally (or would want to use) is a plus in behavioral rounds.`,
  },
  {
    company: "GitHub",
    role: "Software Engineer",
    difficulty: "medium",
    outcome: "ongoing",
    anonymous: true,
    rounds: `Applied via referral from a current employee.

Recruiter screen (30 min): Role overview, remote work discussion. GitHub is fully remote.

Technical screen (60 min): Two problems — one about implementing a simplified git diff algorithm (line-by-line), one about graph connectivity (finding connected components). Did well on both.

Onsite loop completed last week — results still pending.`,
    tips: `GitHub expects deep knowledge of git internals and developer tooling. Being able to talk about how git actually works (DAGs, content-addressable storage, pack files) helped me stand out.

The culture at GitHub feels very developer-centric — they care that you're genuinely passionate about building tools for developers.

Will update once I hear back.`,
  },
  {
    company: "Cloudflare",
    role: "Systems Engineer",
    difficulty: "hard",
    outcome: "offer",
    anonymous: true,
    rounds: `Technical screen (60 min): Networking fundamentals + one coding problem about parsing HTTP headers efficiently.

Onsite (4 rounds):
1. Low-level systems — questions about TCP/IP, TLS, DNS, BGP routing. Very deep.
2. Coding — implement a simplified HTTP request router with wildcard matching
3. System design — design Cloudflare's DDoS mitigation layer
4. Engineering culture — how Cloudflare operates at the edge, Rust adoption, mission`,
    tips: `Cloudflare expects genuine systems programming depth. If you don't know how BGP works or the difference between TCP and UDP at a packet level, study before applying.

Rust comes up a lot — even if you're not applying for a Rust-specific role, showing familiarity signals you're the kind of engineer they want.

For system design, think at the network edge — low latency, high throughput, anycast routing. Generic cloud design patterns won't impress them.`,
  },
  {
    company: "Notion",
    role: "Software Engineer",
    difficulty: "medium",
    outcome: "offer",
    anonymous: false,
    rounds: `Recruiter screen (30 min): Notion's mission, product passion, background.

Technical screen (60 min): Build a simplified version of Notion's block-based document system — blocks have types (text, heading, todo) and can be nested. Live coding in a shared editor.

Product screen (45 min): How would you improve Notion's collaboration features? Think like a PM.

Onsite (3 rounds):
1. Technical deep dive — extend the block system with real-time sync support
2. System design — design Notion's database feature at scale
3. Hiring manager — values, career path, how you approach ambiguity`,
    tips: `Notion wants you to love the product. Use Notion extensively before interviewing — have genuine opinions about what works and what doesn't. I referenced specific UX patterns I'd observed while using it and the interviewers lit up.

The product round is real — they want engineers who think about users. Don't try to hide that you like product thinking; it's a strength here.

"How would you add offline support to Notion?" is the kind of question you should be prepared to answer in depth.`,
  },
];

console.log(`\nSeeding ${EXPERIENCES.length} interview experiences...\n`);

let inserted = 0;
let skipped  = 0;

for (const exp of EXPERIENCES) {
  try {
    // Use ON CONFLICT DO NOTHING keyed on (company, role, rounds) to stay idempotent
    const result = await sql`
      INSERT INTO interview_experiences
        (user_id, company, role, difficulty, outcome, rounds, tips, anonymous, approved)
      VALUES
        (NULL, ${exp.company}, ${exp.role}, ${exp.difficulty}, ${exp.outcome},
         ${exp.rounds}, ${exp.tips ?? null}, ${exp.anonymous}, true)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    if (result.length > 0) {
      inserted++;
      process.stdout.write(".");
    } else {
      skipped++;
      process.stdout.write("s");
    }
  } catch (err) {
    console.error(`\nFailed to insert ${exp.company} / ${exp.role}: ${err.message}`);
  }
}

console.log(`\n\n✅ Done. Inserted: ${inserted}, Skipped (already exist): ${skipped}\n`);
