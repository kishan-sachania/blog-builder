import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Permission, Role, User, Category, Tag, Blog } from "@/models";
import { permissionsToSeed } from "@/lib/rbac";

async function seedSampleData() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in environment variables");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri.trim());
  console.log("Connected to:", mongoose.connection.name);

  // 1. Permissions
  console.log("\n1. Ensuring Permissions...");
  const permDocs = [];
  for (const perm of permissionsToSeed) {
    const doc = await Permission.findOneAndUpdate(
      { resource: perm.resource, action: perm.action },
      perm,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    permDocs.push(doc);
  }

  // 2. Roles
  console.log("2. Ensuring Roles...");
  const allPermIds = permDocs.map((p) => p._id);
  const adminRole = await Role.findOneAndUpdate(
    { name: { $regex: /^admin$/i } },
    {
      name: "admin",
      description: "System Administrator with full editorial and moderation access",
      permissions: allPermIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const employeePermIds = permDocs
    .filter(
      (p) =>
        p.resource === "blog" ||
        p.resource === "category" ||
        p.resource === "tag" ||
        (p.resource === "user" && (p.action === "read" || p.action === "update"))
    )
    .map((p) => p._id);

  const employeeRole = await Role.findOneAndUpdate(
    { name: { $regex: /^(employee|author|user)$/i } },
    {
      name: "employee",
      description: "Staff Contributor with authoring and publishing permissions",
      permissions: employeePermIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // 3. Realistic Authors & Users
  console.log("3. Ensuring Sample Users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await User.findOneAndUpdate(
    { email: "admin@example.com" },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: adminRole._id,
      title: "Editor-in-Chief & Lead Architect",
      department: "Editorial Board & Core Platform",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      bio: "Oversees publication strategy, system architecture retrospectives, and cross-team engineering standards.",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const authorUser = await User.findOneAndUpdate(
    { email: "author@example.com" },
    {
      name: "Jane Author",
      email: "author@example.com",
      password: hashedPassword,
      role: employeeRole._id,
      title: "Senior Staff Writer & Systems Architect",
      department: "Engineering Systems",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bio: "Writes about distributed systems, React internals, high-concurrency datastores, and developer tooling.",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // Update existing Kishan user if exists or upsert
  const kishanUser = await User.findOneAndUpdate(
    { email: "kishan@gmail.com" },
    {
      name: "Kishan Sachania",
      email: "kishan@gmail.com",
      password: hashedPassword,
      role: employeeRole._id,
      title: "Principal Full-Stack Engineer",
      department: "Product Platform",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      bio: "Focuses on modern web performance, edge computing runtimes, and developer experience platforms.",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log(`- Admin:  ${adminUser.email}`);
  console.log(`- Author: ${authorUser.email}`);
  console.log(`- Kishan: ${kishanUser.email}`);

  // 4. Categories
  console.log("\n4. Ensuring Categories...");
  // Remove dummy categories
  await Category.deleteMany({
    slug: { $in: ["blog", "test", "dummy"] },
  });

  const categoriesToSeed = [
    {
      name: "Engineering & Architecture",
      slug: "engineering-architecture",
      description: "Deep dives into system design, backend paradigms, database internals, and scalable web architecture.",
      color: "#FF8F00",
    },
    {
      name: "Product Design",
      slug: "product-design",
      description: "Explorations of design tokens, accessible components, typography scales, and tactile UI craft.",
      color: "#155E75",
    },
    {
      name: "Artificial Intelligence",
      slug: "artificial-intelligence",
      description: "Practical workflows, agentic coding models, semantic retrieval tooling, and generative interfaces.",
      color: "#047857",
    },
    {
      name: "Cloud & DevOps",
      slug: "cloud-devops",
      description: "Infrastructure as code, zero-downtime database migrations, container runtimes, and edge deployments.",
      color: "#6366F1",
    },
    {
      name: "Developer Experience",
      slug: "developer-experience",
      description: "Engineering workflows, pragmatic refactoring philosophies, tooling velocity, and team dynamics.",
      color: "#D97706",
    },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoriesToSeed) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    categoryMap.set(cat.slug, doc);
  }
  console.log(`Seeded ${categoryMap.size} categories.`);

  // 5. Tags
  console.log("\n5. Ensuring Tags...");
  // Clean up corrupted or dummy tags
  await Tag.deleteMany({
    slug: { $in: ["cloude-upload", "1231", "dummy", "test"] },
  });

  const tagsToSeed = [
    { name: "Next.js", slug: "nextjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "MongoDB", slug: "mongodb" },
    { name: "React 19", slug: "react-19" },
    { name: "System Design", slug: "system-design" },
    { name: "Design Systems", slug: "design-systems" },
    { name: "TailwindCSS", slug: "tailwindcss" },
    { name: "AI Agents", slug: "ai-agents" },
    { name: "DevOps", slug: "devops" },
    { name: "Performance", slug: "performance" },
    { name: "Cloud Architecture", slug: "cloud-architecture" },
    { name: "Security", slug: "security" },
    { name: "API Design", slug: "api-design" },
    { name: "Clean Code", slug: "clean-code" },
  ];

  const tagMap = new Map<string, any>();
  for (const tag of tagsToSeed) {
    const doc = await Tag.findOneAndUpdate(
      { slug: tag.slug },
      tag,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    tagMap.set(tag.slug, doc);
  }
  console.log(`Seeded ${tagMap.size} tags.`);

  // 6. Delete Dummy & Legacy Unformatted Blogs
  console.log("\n6. Removing Dummy and Legacy Unformatted Blogs...");
  const dummyTitles = [
    "My Blog",
    "Actually its secoands",
    "1231",
    "Test Post",
    "Dummy Blog",
    "Building Modern Full-Stack Applications with Next.js and Mongoose",
    "Mastering Design Systems in Modern Web Development",
    "Future of AI-Powered Workflows in Software Teams",
  ];
  const deleteResult = await Blog.deleteMany({
    $or: [
      { title: { $in: dummyTitles } },
      { title: { $regex: /^(test|dummy|1231|my blog|actually its secoands)/i } },
      { content: { $regex: /<p>Helloo&nbsp;is&nbsp;task<\/p>|<p><strong>Blog&nbsp;is&nbsp;ok<\/strong><\/p>/i } },
      { category: null },
      { category: { $exists: false } },
    ],
  });
  console.log(`Deleted ${deleteResult.deletedCount} dummy/legacy blog entries.`);

  // 7. Rich Actual Blog Content
  console.log("\n7. Creating Actual High-Quality Blog Articles...");

  const actualBlogs = [
    {
      title: "Architecting Scalable Next.js Applications with MongoDB Connection Pooling and Edge Caching",
      featured: true,
      coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("engineering-architecture")?._id,
      tags: [
        tagMap.get("nextjs")?._id,
        tagMap.get("mongodb")?._id,
        tagMap.get("typescript")?._id,
        tagMap.get("performance")?._id,
        tagMap.get("system Design")?._id || tagMap.get("system-design")?._id,
      ].filter(Boolean),
      author: authorUser._id,
      status: "published",
      views: 1482,
      submittedAt: new Date("2026-09-18T10:30:00.000Z"),
      createdAt: new Date("2026-09-18T10:30:00.000Z"),
      updatedAt: new Date("2026-09-19T14:20:00.000Z"),
      content: `<p>Modern web engineering requires navigating a delicate balance: maximizing developer iteration speed while guaranteeing sub-100ms response latencies and uninterrupted database throughput under spiky production traffic. By unifying the <strong>Next.js App Router</strong> with a resilient <strong>MongoDB connection lifecycle</strong> and edge-layer caching strategies, teams can eliminate classic bottlenecks and build enterprise-grade full-stack systems.</p>

<h2>The Evolution of Route Handlers and Server Runtimes</h2>
<p>In traditional Node.js monoliths, Express or Fastify servers maintained long-lived TCP socket pools to MongoDB replica sets. When transitioning to modern hybrid frameworks like Next.js, handlers frequently execute across a spectrum of environments—ranging from long-lived Node processes in container pods to short-lived serverless and edge compute nodes.</p>

<p>Without deliberate connection pooling, high-frequency requests in serverless environments can trigger connection storms, exhausting MongoDB’s socket limits and leading to severe connection queuing latency.</p>

<blockquote>
  "Resilient architecture is not born from defensive complexity; it comes from establishing deterministic data boundaries and treating connection lifecycles as precious shared resources."
</blockquote>

<h3>Implementing Global Connection Caching</h3>
<p>To ensure database connections persist across hot reloads during development and across container execution cycles in production, implement a singleton cache pattern on the global runtime object:</p>

<pre><code>import mongoose from 'mongoose';

declare global {
  var mongooseConn: {
    conn: typeof mongoose | null;
    promise: Promise&lt;typeof mongoose&gt; | null;
  };
}

let cached = global.mongooseConn || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 15,
      minPoolSize: 2,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI!, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    global.mongooseConn = cached;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}</code></pre>

<h2>Optimizing Read Paths with Selective Projection and Compound Indexes</h2>
<p>A frequent anti-pattern in Mongoose applications is fetching entire documents with unbounded payload sizes when only a subset of fields is needed for page rendering. Consider these core optimization rules:</p>

<ul>
  <li><strong>Compound Indexing</strong>: Align index keys with your most frequent query filters. For instance, creating an index on <code>{ status: 1, createdAt: -1 }</code> speeds up chronological listing queries by multiple orders of magnitude.</li>
  <li><strong>Lean Queries</strong>: Always invoke <code>.lean()</code> on read-heavy routes to bypass Mongoose document hydration overhead, transforming query results into plain JavaScript objects directly.</li>
  <li><strong>Selective Projections</strong>: Exclude large body content fields when querying cards for list grids or feed previews.</li>
</ul>

<h3>Benchmarking Query Performance</h3>
<p>In our internal load tests simulating 10,000 concurrent reading sessions, converting unindexed full-document queries to indexed lean projections reduced memory consumption by <strong>68%</strong> and lowered p99 latency from 420ms down to <strong>38ms</strong>.</p>

<h2>Conclusion</h2>
<p>By leveraging intelligent connection pooling, lean read projections, and proactive compound indexing, your Next.js and MongoDB stack becomes an unstoppable engine capable of handling high editorial volume with rock-solid stability.</p>`,
    },
    {
      title: "Crafting Fluid Typography and Design Tokens: A Practical Guide for Modern Web Apps",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("product-design")?._id,
      tags: [
        tagMap.get("design-systems")?._id,
        tagMap.get("tailwindcss")?._id,
        tagMap.get("performance")?._id,
      ].filter(Boolean),
      author: adminUser._id,
      status: "published",
      views: 934,
      submittedAt: new Date("2026-09-22T08:15:00.000Z"),
      createdAt: new Date("2026-09-22T08:15:00.000Z"),
      updatedAt: new Date("2026-09-23T11:00:00.000Z"),
      content: `<p>A truly cohesive design system is much more than a static component library or a Figma kit. It represents a living mathematical framework that harmonizes typography, spacing, semantic color relationships, and responsive layouts across every device viewport.</p>

<h2>The Dilemma of Rigid Breakpoints</h2>
<p>Historically, responsive typography relied heavily on static media queries (e.g., <code>@media (min-width: 768px)</code>). This approach caused jarring layout jumps whenever the browser window crossed a discrete breakpoint threshold. Headers would abruptly jump from 24px to 36px, disrupting text line wrapping and user reading flow.</p>

<blockquote>
  "When design tokens and code tokens share an uninterrupted continuum, the friction between Figma mockups and production interfaces virtually vanishes."
</blockquote>

<h2>Fluid Scaling with CSS Math Functions</h2>
<p>By combining CSS <code>clamp()</code> with viewport units (<code>vw</code>) and rem-based baselines, we can craft typography scales that resize continuously and proportionally:</p>

<pre><code>:root {
  /* Fluid Body: scales smoothly from 16px (1rem) at 375px to 18px (1.125rem) at 1280px */
  --font-size-base: clamp(1rem, 0.948rem + 0.221vw, 1.125rem);

  /* Fluid Display Headline: scales from 28px to 48px */
  --font-size-hero: clamp(1.75rem, 1.336rem + 1.768vw, 3rem);

  /* Semantic Editorial Tokens */
  --color-warm-paper: #FAF8F5;
  --color-ink-primary: #343131;
  --color-accent-amber: #FF8F00;
  --color-accent-gold: #FFB22C;
}</code></pre>

<h3>Key Advantages of Fluid Scaling</h3>
<ul>
  <li><strong>Zero layout thrashing</strong>: Text smoothly accommodates intermediate screen widths such as foldables, tablets in split-screen, and resized desktop windows.</li>
  <li><strong>Reduced CSS footprint</strong>: Eliminates hundreds of lines of repetitive media query overrides across component styles.</li>
  <li><strong>Universal Accessibility</strong>: Because clamp formulas use <code>rem</code> units as base offsets, user browser zoom and OS font scaling preferences remain fully respected.</li>
</ul>

<h2>Preserving Visual Hierarchy and Micro-Interactions</h2>
<p>Typography alone cannot carry an editorial experience. Pairing fluid headers with high-contrast text ratios, generous line heights (1.75 to 1.85 for long-form prose), and warm parchment palettes creates an inviting atmosphere that encourages prolonged reading and engagement.</p>`,
    },
    {
      title: "Autonomous AI Coding Agents: Transforming Developer Velocity and Code Review Workflows",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("artificial-intelligence")?._id,
      tags: [
        tagMap.get("ai-agents")?._id,
        tagMap.get("typescript")?._id,
        tagMap.get("clean-code")?._id,
        tagMap.get("system-design")?._id,
      ].filter(Boolean),
      author: kishanUser._id,
      status: "published",
      views: 1240,
      submittedAt: new Date("2026-09-25T14:00:00.000Z"),
      createdAt: new Date("2026-09-25T14:00:00.000Z"),
      updatedAt: new Date("2026-09-26T09:30:00.000Z"),
      content: `<p>Software engineering is undergoing its most profound transformation since the advent of high-level programming languages. We have moved decisively past simple autocomplete heuristics into an era of <strong>agentic AI workflows</strong>—autonomous systems capable of synthesizing cross-file architectural changes, running verification suites, and reasoning through nuanced pull requests.</p>

<h2>From Predictive Autocomplete to Multi-Step Reasoning</h2>
<p>Early AI developer tools focused on localized next-token prediction within a single file. While useful for boilerplate generation, they lacked awareness of workspace-wide schemas, module dependencies, and business domain invariants.</p>

<p>Contemporary agentic systems employ structured tool-use patterns, autonomous lint/test feedback loops, and semantic codebase indexing to execute complex refactors autonomously.</p>

<blockquote>
  "The primary role of the software engineer is evolving: from being a manual syntax mechanic to becoming a systems architect, specification designer, and critical reviewer."
</blockquote>

<h3>The Anatomy of an Agentic Execution Loop</h3>
<ol>
  <li><strong>Semantic Context Assembly</strong>: Scanning the workspace AST, type definitions, and dependency trees to isolate relevant source boundaries.</li>
  <li><strong>Hypothesis & Plan Generation</strong>: Formulating an explicit, verifiable sequence of file modifications before making changes.</li>
  <li><strong>Deterministic Mutation</strong>: Applying targeted line-range edits without destabilizing surrounding code.</li>
  <li><strong>Automated Self-Correction</strong>: Running local type-checkers and unit test runners, automatically fixing compile errors prior to human review.</li>
</ol>

<h2>Establishing Safety Rails and Guardrails</h2>
<p>To safely integrate AI agents into continuous integration pipelines, organizations must enforce strict deterministic boundaries:</p>

<ul>
  <li><strong>Hermetic Sandboxes</strong>: Disallowing untrusted network egress during agent execution cycles.</li>
  <li><strong>RBAC & Secret Masking</strong>: Guaranteeing that environment tokens and credentials are never ingested into model context windows.</li>
  <li><strong>Mandatory Human-in-the-Loop Signoff</strong>: Treating agentic output as high-quality candidate pull requests that require human architectural approval.</li>
</ul>

<h2>The Horizon Ahead</h2>
<p>As agent reasoning capabilities continue to mature, the bottleneck in software delivery will shift from typing speed to the clarity of requirements and architectural foresight. The future belongs to teams that master collaborative human-agent pair programming.</p>`,
    },
    {
      title: "Zero-Downtime Database Migrations and Schema Versioning in Distributed Mongo Deployments",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("cloud-devops")?._id,
      tags: [
        tagMap.get("mongodb")?._id,
        tagMap.get("devops")?._id,
        tagMap.get("cloud-architecture")?._id,
        tagMap.get("system-design")?._id,
      ].filter(Boolean),
      author: authorUser._id,
      status: "published",
      views: 780,
      submittedAt: new Date("2026-09-28T16:45:00.000Z"),
      createdAt: new Date("2026-09-28T16:45:00.000Z"),
      updatedAt: new Date("2026-09-29T10:00:00.000Z"),
      content: `<p>In high-throughput distributed applications, performing database schema modifications without service degradation is one of the most critical operational challenges. Whether adding composite indexes or restructuring relationships, executing migrations without a structured pattern risks locking collections and degrading user experience.</p>

<h2>The Expand-Contract Pattern</h2>
<p>The <strong>Expand-Contract</strong> (or Parallel Run) pattern is the gold standard for executing zero-downtime database changes across distributed clusters:</p>

<ol>
  <li><strong>Phase 1 (Expand)</strong>: Deploy application code that can read from both the old and new schema structures, while writing exclusively in the new format or dual-writing to both.</li>
  <li><strong>Phase 2 (Backfill)</strong>: Run idempotent background migration jobs in small batches to transform legacy documents into the updated schema format.</li>
  <li><strong>Phase 3 (Contract)</strong>: Once 100% of documents comply with the new schema, deploy clean application code that removes legacy fallback branches and drop deprecated fields.</li>
</ol>

<blockquote>
  "Never perform a destructive schema transformation in a single release. Decouple data model evolution from application deployments."
</blockquote>

<h3>Building Background Indexes Safely</h3>
<p>In MongoDB 4.2+, index builds occur in the background without holding exclusive collection locks. However, building indexes on massive collections still consumes IOPS and CPU. Always monitor replica set secondary lag when applying index definitions across production clusters:</p>

<pre><code>// Example index creation script with collation and background safety
db.blogs.createIndex(
  { status: 1, category: 1, createdAt: -1 },
  { 
    name: "idx_blogs_category_status_recent",
    background: true 
  }
);</code></pre>

<h2>Handling Schema Versioning in Mongoose Models</h2>
<p>Adding a <code>schemaVersion</code> integer field to Mongoose schemas allows dynamic migration hooks to run on document retrieval, ensuring seamless backwards compatibility across application versions.</p>`,
    },
    {
      title: "Demystifying React 19 Server Actions, Optimistic UI, and Async Transitions",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("engineering-architecture")?._id,
      tags: [
        tagMap.get("react-19")?._id,
        tagMap.get("nextjs")?._id,
        tagMap.get("typescript")?._id,
        tagMap.get("performance")?._id,
      ].filter(Boolean),
      author: kishanUser._id,
      status: "published",
      views: 1105,
      submittedAt: new Date("2026-10-01T11:20:00.000Z"),
      createdAt: new Date("2026-10-01T11:20:00.000Z"),
      updatedAt: new Date("2026-10-02T08:40:00.000Z"),
      content: `<p>React 19 introduces a streamlined paradigm for managing data mutations, server-side execution, and pending user interface states. By replacing ad-hoc <code>useEffect</code> lifecycles and manual loading spinners with native async primitives, React makes high-fidelity UI states predictable and effortless.</p>

<h2>Native Mutation Handling with useActionState</h2>
<p>Handling form submissions previously required managing multiple pieces of disjoint state: form values, isSubmitting booleans, error objects, and success notifications. With React 19's <code>useActionState</code>, all mutation lifecycle states are encapsulated into a single composable hook:</p>

<pre><code>'use client';

import { useActionState } from 'react';
import { updateBlogStatus } from '@/app/actions/blog';

export function StatusToggleButton({ blogId, currentStatus }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const nextStatus = prevState.status === 'published' ? 'draft' : 'published';
      const res = await updateBlogStatus(blogId, nextStatus);
      return { status: res.status, error: null };
    },
    { status: currentStatus, error: null }
  );

  return (
    &lt;form action={formAction}&gt;
      &lt;button 
        type="submit" 
        disabled={isPending}
        className="px-4 py-2 rounded-lg font-medium transition-all"
      &gt;
        {isPending ? 'Syncing...' : state.status === 'published' ? 'Unpublish' : 'Publish'}
      &lt;/button&gt;
    &lt;/form&gt;
  );
}</code></pre>

<h2>Instantaneous Feedback with useOptimistic</h2>
<p>Modern users expect zero-latency responsiveness when toggling likes, bookmarking articles, or updating metadata. <code>useOptimistic</code> allows the client UI to immediately reflect desired mutations while the background network handshake resolves, automatically rolling back if an error occurs.</p>

<blockquote>
  "Optimistic rendering bridges the physical latency of the global internet, making web applications feel as instantaneous as local native software."
</blockquote>

<h2>Key Takeaways</h2>
<ul>
  <li>Reduce client JavaScript by shifting mutations directly to Server Actions.</li>
  <li>Eliminate unnecessary spinner flicker with React concurrent transitions.</li>
  <li>Always design error rollback states when implementing optimistic updates.</li>
</ul>`,
    },
    {
      title: "The Philosophy of Clean Codebases: Pragmatic Refactoring Without Paralyzing Delivery",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("developer-experience")?._id,
      tags: [
        tagMap.get("clean-code")?._id,
        tagMap.get("system-design")?._id,
        tagMap.get("typescript")?._id,
      ].filter(Boolean),
      author: adminUser._id,
      status: "published",
      views: 680,
      submittedAt: new Date("2026-10-02T15:10:00.000Z"),
      createdAt: new Date("2026-10-02T15:10:00.000Z"),
      updatedAt: new Date("2026-10-03T10:00:00.000Z"),
      content: `<p>Every engineering organization faces the tension between shipping new user-facing features and paying down accumulated technical debt. Refactoring must never become an isolated multi-month hiatus that halts roadmap progress. Instead, it must be treated as a continuous, pragmatic discipline integrated into daily development.</p>

<h2>The Boy Scout Rule in Modern Git Workflows</h2>
<p>The principle is simple: <em>Always leave the campground cleaner than you found it</em>. When touching a module to add a feature or fix a bug, invest an additional 10-15% of effort to improve variable naming, remove dead code paths, or decompose an unwieldy component.</p>

<blockquote>
  "Great software is not built through monolithic perfectionism; it is sculpted through relentless incremental care."
</blockquote>

<h3>Strategic Refactoring Guidelines</h3>
<ul>
  <li><strong>Refactor with Test Coverage First</strong>: Never refactor code without automated test guardrails. If tests do not exist, write characterization tests to document existing behavior before refactoring.</li>
  <li><strong>Separate Refactors from Feature PRs</strong>: Keep pure architectural restructuring in distinct PRs from functional changes. This makes code reviews vastly faster and minimizes regression risks.</li>
  <li><strong>Colocate Related Logic</strong>: Group files by feature domain rather than purely by technical type (e.g. keep blog components, hooks, and types together rather than scattered across global folders).</li>
</ul>

<h2>Cultivating Engineering Pride</h2>
<p>A clean codebase is not a vanity metric. It directly correlates with developer morale, lower onboarding ramp time for new hires, and dramatically reduced incident frequency during peak traffic events.</p>`,
    },
    {
      title: "Hardening Modern REST and GraphQL APIs: Rate Limiting, RBAC Tokens, and Payload Validation",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("cloud-devops")?._id,
      tags: [
        tagMap.get("security")?._id,
        tagMap.get("api-design")?._id,
        tagMap.get("typescript")?._id,
        tagMap.get("nextjs")?._id,
      ].filter(Boolean),
      author: authorUser._id,
      status: "published",
      views: 590,
      submittedAt: new Date("2026-10-03T18:00:00.000Z"),
      createdAt: new Date("2026-10-03T18:00:00.000Z"),
      updatedAt: new Date("2026-10-04T12:00:00.000Z"),
      content: `<p>In modern web architectures with public-facing API routes, security cannot be an afterthought bolted on prior to launch. Defending against credential stuffing, distributed denial of service (DDoS), and privilege escalation requires a layered, defense-in-depth strategy.</p>

<h2>Layer 1: Granular Role-Based Access Control (RBAC)</h2>
<p>Modern applications should decouple user roles from raw endpoint permissions. By defining distinct resource-action permissions (e.g. <code>blog:create</code>, <code>blog:publish</code>, <code>user:delete</code>), permission changes can be applied without altering API handler code.</p>

<p>Pairing stateless JWT tokens with database <strong>token versions</strong> enables instantaneous token revocation whenever credentials change or suspicious activity is detected.</p>

<h2>Layer 2: Strict Schema Validation with Zod</h2>
<p>Never trust unvalidated client input. Enforce runtime schema validation at the very threshold of every API route handler:</p>

<pre><code>import { z } from 'zod';

export const CreateBlogSchema = z.object({
  title: z.string().min(5).max(180).trim(),
  content: z.string().min(20).trim(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  tags: z.array(z.string()).max(10).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
});</code></pre>

<h2>Layer 3: Distributed Sliding Window Rate Limiting</h2>
<p>Enforce rate limiting on authentication and write-heavy endpoints using Redis sliding window algorithms to mitigate brute-force attacks while preserving smooth access for legitimate users.</p>`,
    },
    {
      title: "Exploring Vector Search and Hybrid Retrieval with MongoDB Atlas Vector Search",
      featured: false,
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
      category: categoryMap.get("artificial-intelligence")?._id,
      tags: [
        tagMap.get("ai-agents")?._id,
        tagMap.get("mongodb")?._id,
        tagMap.get("typescript")?._id,
      ].filter(Boolean),
      author: authorUser._id,
      status: "draft",
      views: 0,
      submittedAt: new Date("2026-10-04T14:30:00.000Z"),
      createdAt: new Date("2026-10-04T14:30:00.000Z"),
      updatedAt: new Date("2026-10-04T14:30:00.000Z"),
      content: `<p>Traditional lexical keyword search fails when users search for concepts using synonyms or natural language descriptions. Combining dense vector embeddings with sparse BM25 keyword matching unlocks high-precision hybrid retrieval.</p>

<h2>Draft Architecture Overview</h2>
<p>We are prototyping a semantic search pipeline for our article repository using MongoDB Atlas Vector Search and cosine similarity distance metrics.</p>

<h3>Planned Milestones:</h3>
<ul>
  <li>Generate text embeddings on blog creation via background worker.</li>
  <li>Configure vector index definition in Atlas.</li>
  <li>Build reciprocal rank fusion (RRF) search endpoint.</li>
</ul>`,
    },
  ];

  for (const blogData of actualBlogs) {
    await Blog.findOneAndUpdate(
      { title: blogData.title },
      blogData,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  const totalBlogs = await Blog.countDocuments();
  const publishedBlogs = await Blog.countDocuments({ status: "published" });
  const draftBlogs = await Blog.countDocuments({ status: "draft" });

  console.log(`\nTotal blogs in database: ${totalBlogs}`);
  console.log(`- Published: ${publishedBlogs}`);
  console.log(`- Drafts:    ${draftBlogs}`);

  console.log("\n=========================================");
  console.log("   SAMPLE DATA SEEDING COMPLETE!         ");
  console.log("=========================================");
  console.log("Demo Credentials (Password for all: password123)");
  console.log(`- Admin:  ${adminUser.email}`);
  console.log(`- Author: ${authorUser.email}`);
  console.log(`- Kishan: ${kishanUser.email}`);
  console.log("=========================================\n");

  await mongoose.disconnect();
}

seedSampleData().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
