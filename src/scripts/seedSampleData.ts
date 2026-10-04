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
      description: "System Administrator",
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
      description: "Staff Contributor",
      permissions: employeePermIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // 3. Sample Users
  console.log("3. Ensuring Sample Users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await User.findOneAndUpdate(
    { email: "admin@example.com" },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: adminRole._id,
      title: "Editor-in-Chief",
      department: "Editorial Board",
      bio: "Oversees editorial direction, architecture retrospectives, and cross-team publications.",
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
      title: "Senior Staff Writer",
      department: "Engineering Systems",
      bio: "Writes about distributed systems, React internals, and developer productivity tools.",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log(`- Admin: ${adminUser.email}`);
  console.log(`- Author: ${authorUser.email}`);

  // 4. Sample Categories
  console.log("4. Ensuring Categories...");
  const sampleCategories = [
    {
      name: "Engineering & Architecture",
      slug: "engineering-architecture",
      description: "Deep dives into system design, backend paradigms, and distributed data systems.",
      color: "#FF8F00",
    },
    {
      name: "Product Design",
      slug: "product-design",
      description: "Explorations of design tokens, accessible components, and craft.",
      color: "#155E75",
    },
    {
      name: "Artificial Intelligence",
      slug: "artificial-intelligence",
      description: "Practical workflows, agentic coding models, and semantic tooling.",
      color: "#047857",
    },
  ];

  const categoryDocs = [];
  for (const cat of sampleCategories) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    categoryDocs.push(doc);
  }
  console.log(`Seeded ${categoryDocs.length} categories.`);

  // 5. Sample Tags
  console.log("5. Ensuring Tags...");
  const sampleTags = [
    { name: "Next.js", slug: "nextjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "MongoDB", slug: "mongodb" },
    { name: "Full Stack", slug: "fullstack" },
  ];

  const tagDocs = [];
  for (const tag of sampleTags) {
    const doc = await Tag.findOneAndUpdate(
      { slug: tag.slug },
      tag,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    tagDocs.push(doc);
  }
  console.log(`Seeded ${tagDocs.length} tags.`);

  // 6. Sample Blogs
  console.log("6. Creating Sample Blogs...");
  const sampleBlogs = [
    {
      title: "Building Modern Full-Stack Applications with Next.js and Mongoose",
      content: `Modern web architecture demands both speed of iteration and resilience at scale. By combining the **Next.js App Router** with **MongoDB** and **Mongoose**, engineering teams can build high-velocity full-stack applications with type safety and intuitive data modeling.

## The Paradigm Shift in Route Handlers

Next.js route handlers bring server-side logic directly alongside your frontend components. Unlike traditional Express monoliths, route handlers run with optimized edge or node runtimes, auto-scaling seamlessly based on demand.

> Clean architecture isn't about writing more code; it's about drawing boundaries that allow each layer to evolve independently without fear.

### Key Architectural Benefits

- **Co-located logic**: Keep API routes and UI components in unified, domain-driven directories.
- **Strict type safety**: Share types across client interactions and server responses.
- **Connection pooling**: Cache database connections across serverless and long-lived node instances.

### Connecting to MongoDB Efficiently

Here is an example pattern for establishing a cached connection pool in serverless environments:

\`\`\`typescript
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGO_URI!);
  isConnected = db.connections[0].readyState === 1;
}
\`\`\`

## Best Practices for API Response Design

When designing RESTful APIs for production, always standardize response envelopes. Consistent status codes, clear error messages, and predictable data payloads make client integrations effortless.`,
      author: authorUser._id,
      status: "published",
      category: categoryDocs[0]._id,
      tags: [tagDocs[0]._id, tagDocs[1]._id, tagDocs[2]._id],
      views: 142,
    },
    {
      title: "Mastering Design Systems in Modern Web Development",
      content: `A design system is far more than a simple UI kit. It is a living, evolving language that bridges the communication gap between product designers and frontend developers.

## The Core Foundations

Every durable design system rests on three fundamental pillars:

- **Design Tokens**: Standardized definitions for colors, spacing, typography scales, and shadows.
- **Component Atoms**: Unopinionated primitives like buttons, badges, inputs, and modals.
- **Composition Patterns**: Pre-assembled page sections and layouts that maintain brand cohesion.

> When design tokens and code tokens share a single source of truth, friction between Figma and code virtually disappears.

### Creating Fluid Typography Scales

Typography should adapt gracefully across viewport boundaries without abrupt layout shifts:

\`\`\`css
/* Fluid typographic scale formula */
font-size: clamp(1.25rem, 1rem + 1vw, 2.5rem);
\`\`\`

## Preserving Accessibility Across the Stack

Accessibility must be baked in from day one. High-contrast color ratios, semantic HTML landmarks, and robust keyboard navigation ensure that everyone can enjoy your digital experiences.`,
      author: authorUser._id,
      status: "published",
      category: categoryDocs[1]._id,
      tags: [tagDocs[1]._id, tagDocs[3]._id],
      views: 89,
    },
    {
      title: "Future of AI-Powered Workflows in Software Teams",
      content: `The software development lifecycle is undergoing a seismic transition. From autonomous unit testing to semantic codebase indexing, AI assistants are augmenting developer creativity in unprecedented ways.

## Beyond Simple Code Autocomplete

The earliest iteration of AI tools focused primarily on next-line prediction. Today, agentic workflows can analyze entire repository trees, diagnose cryptic regression bugs, and generate verified patch sets.

> The developer's primary role is transitioning from syntax mechanic to systems architect and reviewer.

### Emerging AI Paradigms

1. **Context-aware retrieval**: Querying semantic embeddings across PR histories, issues, and production telemetry.
2. **Deterministic guardrails**: Automated linting, test suites, and schema verification run after every agent mutation.
3. **Interactive pair programming**: Conversational interfaces that challenge design assumptions and explore edge cases before code is written.`,
      author: adminUser._id,
      status: "draft",
      category: categoryDocs[2]._id,
      tags: [tagDocs[3]._id],
      views: 0,
    },
  ];

  for (const blogData of sampleBlogs) {
    await Blog.findOneAndUpdate(
      { title: blogData.title },
      blogData,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  const totalBlogs = await Blog.countDocuments();
  console.log(`Total blogs in database: ${totalBlogs}`);

  console.log("\n=========================================");
  console.log("   SAMPLE DATA SEEDING COMPLETE!         ");
  console.log("=========================================");
  console.log("Demo Credentials (Password for all: password123)");
  console.log(`- Admin:  ${adminUser.email}`);
  console.log(`- Author: ${authorUser.email}`);
  console.log("=========================================\n");

  await mongoose.disconnect();
}

seedSampleData().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
