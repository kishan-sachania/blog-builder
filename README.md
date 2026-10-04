# Blog Builder

A full-stack, enterprise-grade publication and editorial management platform built with **Next.js 16 (App Router)**, **MongoDB / Mongoose**, and dynamic database-driven **Role-Based Access Control (RBAC)**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack & Architectural Rationale](#tech-stack--architectural-rationale)
- [Features Implemented](#features-implemented)
  - [1. Public Reader Journal & Discovery](#1-public-reader-journal--discovery)
  - [2. Author Studio Workspace](#2-author-studio-workspace)
  - [3. Editorial Admin & Moderation Panel](#3-editorial-admin--moderation-panel)
  - [4. Authentication & RBAC Security Engine](#4-authentication--rbac-security-engine)
  - [5. Media & Asset Management](#5-media--asset-management)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Install Dependencies](#2-clone--install-dependencies)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Database Initialization & Seeding](#4-database-initialization--seeding)
  - [5. Start Development Server](#5-start-development-server)
  - [6. Production Build](#6-production-build)
- [Demo Accounts](#demo-accounts)
- [Available Scripts](#available-scripts)

---

## Overview

**Blog Builder** is designed to provide a comprehensive, end-to-end publishing workflow:
- **Readers** explore curated long-form articles, filter by topics and tags, view author portfolios, and enjoy a typography-first reading experience.
- **Authors** write, edit, and format rich-text stories with cover images, manage draft lifecycles, and submit pieces for editorial review.
- **Editors & Admins** oversee the editorial pipeline through a dedicated moderation queue, manage system users, organize categories/tags, and monitor platform analytics.

---

## Tech Stack & Architectural Rationale

| Category | Technology | Rationale & Purpose |
|---|---|---|
| **Core Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Leverages Server Components for fast SEO-optimized public reader pages and Client Components for dynamic Studio/Admin dashboards. Includes built-in API route handlers and Edge Middleware for route protection and token refresh. |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Guarantees end-to-end type safety across database models, API payloads, custom hooks, and UI component props to eliminate runtime regressions. |
| **Frontend Library** | [React 19](https://react.dev/) | Modern UI rendering foundation utilizing concurrent features, hooks, and dynamic imports. |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/) | Schema-flexible document database ideally suited for articles, rich nested content, dynamic taxonomy (categories/tags), and relational references (`User`, `Role`, `Permission`, `Blog`). Mongoose handles indexes and lifecycle hooks (e.g. password hashing). |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS | Utility-first styling framework enabling a bespoke editorial aesthetic (`#FAF8F5`, warm neutrals, and `#FF8F00` accents) with fast build performance and zero CSS runtime overhead. |
| **Authentication & Security** | `jsonwebtoken` + `bcryptjs` | Dual-token authentication architecture: short-lived Access Tokens and rotating Refresh Tokens stored in secure `httpOnly` cookies with database-backed `tokenVersion` checks for instant session revocation. |
| **Rich Text Editor** | [React Quill (`react-quill-new`)](https://github.com/zenoamaro/react-quill) | Lightweight, reliable WYSIWYG editor loaded dynamically on the client side with custom toolbar modules (headers, code blocks, blockquotes, lists, links). |
| **Schema Validation** | [Zod 3](https://zod.dev/) + React Hook Form | Declarative schema validation ensuring strictly validated inputs for authentication, story drafting, user creation, and category management on both frontend and backend. |
| **Media & Asset Hosting** | [Cloudinary Node SDK](https://cloudinary.com/) | Cloud-native media management for fast, optimized, and responsive image uploads (cover photos and author avatars). |
| **HTTP Client** | [Axios](https://axios-http.com/) | Centralized client-side HTTP layer with automated cookie propagation, custom error interceptors, and consistent JSON formatting. |
| **Icons** | [Lucide React](https://lucide.dev/) | Tree-shakeable, clean icon set aligned with the editorial dashboard aesthetic. |
| **Script Runner** | `tsx` | Executes TypeScript database migration and seeding scripts directly with native `.env` file resolution. |

---

## Features Implemented

### 1. Public Reader Journal & Discovery
- **Curated Landing Page (`/`):** Hero section spotlighting top essays, top topic pills with live article counters, a dedicated featured story banner, and a responsive recent stories grid.
- **Search & Multi-Facet Filtering:** Live debounce search query with category and tag filters to quickly discover content.
- **Article Reader View (`/stories/[slug]`):**
  - Clean, typography-focused layout optimized for legibility.
  - Automatic reading time estimate calculation.
  - Category badges, tag chips, and published date attribution.
  - Rich text HTML rendering for formatted code blocks, quotes, and headers.
  - Embedded Author Bio card with direct links to author profile.
  - Related stories recommendation section.
- **Topic Hubs (`/topics` & `/topics/[slug]`):** Browse publication topics with custom color accents and filtered story catalogs.
- **Author Profiles (`/authors/[id]`):** Dedicated author bio pages showcasing department, title, avatar, and complete archive of published works.

### 2. Author Studio Workspace
- **Studio Dashboard (`/studio`):** Real-time metrics overview displaying author’s total stories, pending reviews, drafts, and published articles.
- **Story Management (`/studio/stories`):** Tabular view of author's stories with status badges (`Draft`, `In Review`, `Published`, `Rejected`, `Archived`) and quick action menus.
- **Rich Article Editor (`/studio/new` & `/studio/edit/[id]`):**
  - Dynamic client-side ReactQuill WYSIWYG editor.
  - Cover image uploader integrated directly with Cloudinary with fallback preview.
  - Category selector & multi-tag manager.
  - Draft autosaving & one-click **"Submit for Review"** submission workflow.
  - Feedback inspection: view editorial rejection notes directly inside the editor to make necessary revisions.
- **Author Profile Settings (`/studio/profile`):** Update personal biography, title, department, and custom avatar upload.

### 3. Editorial Admin & Moderation Panel
- **Editorial Overview Dashboard (`/admin`):**
  - High-level platform analytics: total published stories, pending moderation count, active contributors, total views, and category distributions.
  - Overview of recent story submissions and active authors.
- **Moderation Queue (`/admin/moderation`):**
  - Dedicated workflow for editorial staff to review incoming `in_review` submissions.
  - Inspect submission timestamp, author profile, and article preview.
  - **Approve & Publish** stories with a single click.
  - **Reject / Request Changes** with required editorial feedback notes sent directly to the author.
- **Global Article Catalog (`/admin/stories`):** Filter, search, feature/unfeature on home page, change status, or delete any story across the platform.
- **Category & Taxonomy Management (`/admin/categories`):** Create, update, or remove categories with custom slug generation, color hex themes, and descriptions.
- **User & Role Administration (`/admin/users`):**
  - User directory with search, role filtering (`admin` vs `employee`), and pagination.
  - Modal form to provision new team members with specific roles and initial passwords.
  - Edit user profiles, update permissions, or deactivate accounts.

### 4. Authentication & RBAC Security Engine
- **Dual-Token JWT Architecture:**
  - Short-lived Access Token stored in an `httpOnly` secure cookie.
  - Long-lived Refresh Token stored in an `httpOnly` secure cookie.
  - Database-backed `tokenVersion` counter on users to invalidate all active sessions immediately upon password change or account deactivation.
- **Edge Middleware Protection (`src/middleware.ts`):**
  - Intercepts requests to `/admin/*`, `/studio/*`, and auth routes.
  - Performs silent, server-side token refresh when the access token expires while a valid refresh token exists.
  - Redirects unauthenticated visitors to `/auth/login` with dynamic `callbackUrl` preservation.
- **Dynamic Database-Driven RBAC (`src/lib/rbac.ts`):**
  - Granular permissions model formatted as `{ resource, action }` for `blog`, `user`, `category`, and `tag` across `create`, `read`, `update`, and `delete`.
  - Higher-order API route wrapper `withPermission(resource, action, handler)` and `withAuth(handler)`.
  - Admin role bypass for system-wide operations.

### 5. Media & Asset Management
- **Cloudinary Integration (`/api/upload`):** Secure endpoint for direct multipart form image uploads with preset support.
- **Client Upload Components:** Reusable `ImageUpload` and `AvatarUpload` components with preview, progress indicators, and removal triggers.

---

## Project Structure

```text
blog-builder/
├── .env.example               # Environment variables template
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration (remote image patterns)
├── package.json               # Project dependencies and operational scripts
├── postcss.config.mjs         # PostCSS configuration for Tailwind CSS v4
├── tsconfig.json              # TypeScript compiler configuration
├── public/                    # Static assets & icons
└── src/
    ├── app/                   # Next.js App Router (pages, layouts & API handlers)
    │   ├── layout.tsx         # Root layout with Google Inter font & global providers
    │   ├── page.tsx           # Reader homepage & curated journal feed
    │   ├── globals.css        # Global CSS & Tailwind CSS imports
    │   ├── icon.svg           # Application SVG favicon
    │   │
    │   ├── (reader)/          # Public Reader Views
    │   │   ├── stories/[slug]/# Article detail reading view & author cards
    │   │   ├── topics/        # All categories directory & topic-filtered feeds
    │   │   └── authors/[id]/  # Public author biography & published story list
    │   │
    │   ├── auth/              # Authentication Pages
    │   │   ├── login/         # Sign-in page
    │   │   └── register/      # Sign-up page
    │   │
    │   ├── studio/            # Author Workspace
    │   │   ├── page.tsx       # Author dashboard & metrics
    │   │   ├── stories/       # Story management table
    │   │   ├── new/           # Create new article (Rich Text Editor)
    │   │   ├── edit/[id]/     # Edit existing article
    │   │   └── profile/       # Author profile & avatar editor
    │   │
    │   ├── admin/             # Editorial & Administration Panel
    │   │   ├── page.tsx       # Analytics & platform overview dashboard
    │   │   ├── moderation/    # Editorial review queue (approve/reject workflow)
    │   │   ├── stories/       # Global story catalog & featured story toggles
    │   │   ├── categories/    # Category & Tag taxonomy manager
    │   │   ├── users/         # Team member provisioning & role administration
    │   │   └── authors/       # Admin author management view
    │   │
    │   └── api/               # RESTful API Route Handlers
    │       ├── auth/          # /login, /register, /logout, /me, /refresh
    │       ├── blog/          # Blog CRUD, status updates, views, and filtering
    │       ├── category/      # Category taxonomy CRUD
    │       ├── tag/           # Tag taxonomy CRUD
    │       ├── user/          # User management & profile endpoints
    │       └── upload/        # Cloudinary media upload handler
    │
    ├── components/            # Modular React UI Components
    │   ├── admin/             # Admin sidebar, moderation modals, user management tables
    │   ├── article/           # Reader article header, rich content typography, author bio
    │   ├── auth/              # Login and registration form cards
    │   ├── common/            # Navbar, footer, badges, confirmation modals, uploaders
    │   ├── home/              # Hero, top categories, featured story, recent stories grid
    │   └── studio/            # Studio sidebar, Quill rich text editor, story data table
    │
    ├── hooks/                 # Custom React Hooks
    │   ├── useApi.ts          # Centralized API call runner with loading & error state
    │   ├── useDebounce.ts     # Input debounce utility for live search
    │   └── usePagination.ts   # Client-side pagination state controller
    │
    ├── lib/                   # Core Utilities & Shared Logic
    │   ├── api-response.ts    # Standardized JSON response helper
    │   ├── auth.ts            # Server-side user extraction & permission resolution
    │   ├── axios.ts           # Configured Axios instance with baseURL & interceptors
    │   ├── cookies.ts         # Secure cookie setting & removal helpers
    │   ├── db.ts              # Cached Mongoose connection helper
    │   ├── rbac.ts            # RBAC permission matrix & route protection wrappers
    │   ├── roles.ts           # Role constant definitions & helpers
    │   ├── util.ts            # Reading time estimator, slug generator, date formatters
    │   └── validations/       # Zod schemas (login, register, user, category, story)
    │
    ├── models/                # Mongoose Schema Definitions
    │   ├── Blog.ts            # Story schema (title, content, author, status, tags, etc.)
    │   ├── Category.ts        # Category schema (name, slug, color, description)
    │   ├── Permission.ts      # Granular RBAC permission schema (resource + action)
    │   ├── Role.ts            # Role schema referencing permission documents
    │   ├── Tag.ts             # Tag schema (name, slug)
    │   └── User.ts            # User schema (email, bcrypt password, role, tokenVersion)
    │
    ├── scripts/               # CLI Database & Maintenance Scripts
    │   ├── initSchemas.ts     # Initialize schema collections & compound indexes
    │   ├── seed-rbac.ts       # Seeds default permissions and admin/employee roles
    │   ├── seed.ts            # Runner script for RBAC seeding
    │   └── seedSampleData.ts  # Seeds demo users, categories, tags, and articles
    │
    ├── services/              # Business Logic & Database Service Layer
    │   ├── analyticsService.ts# Aggregations for platform analytics & author metrics
    │   ├── blogService.ts     # Story queries, pagination, status transitions
    │   ├── categoryService.ts # Category lookup and management operations
    │   ├── roleService.ts     # Role retrieval and permission populator
    │   ├── tagService.ts      # Tag retrieval and upsert logic
    │   ├── tokenService.ts    # JWT creation, signing, and verification
    │   └── userService.ts     # User CRUD, password updates, profile queries
    │
    ├── types/                 # Global TypeScript Interface Definitions
    │   └── index.ts           # User, Post, Category, Tag, Analytics type contracts
    │
    └── middleware.ts          # Next.js Edge Middleware for route guarding & token refresh
```

---

## Setup & Installation

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: Version `18.18.0` or `>= 20.0.0`
- **npm** (or `pnpm` / `yarn` / `bun`)
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.
- **Cloudinary Account** *(Optional)*: For hosting story cover images and author avatars in the cloud.

---

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/blog-builder.git
cd blog-builder

# Install all dependencies
npm install
```

---

### 3. Environment Configuration

Copy the sample `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your configuration values:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/blog_builder

# JWT Secret Keys (Use long, secure random strings)
ACCESS_SECRET=your_super_secret_jwt_access_key_1234567890
REFRESH_SECRET=your_super_secret_jwt_refresh_key_1234567890

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary Media Configuration (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=blog_builder_uploads
```

---

### 4. Database Initialization & Seeding

Run the automated database scripts to create indexes, configure RBAC permissions, and populate realistic demo data:

```bash
# Step 1: Initialize database collections and compound indexes
npm run db:init

# Step 2: Seed RBAC permissions and default roles ('admin' & 'employee')
npm run db:seed

# Step 3: Populate sample articles, realistic categories, tags, and demo accounts
npm run db:sample
```

---

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the public journal.

---

### 6. Production Build

To test or deploy the production build:

```bash
# Compile and optimize production bundle
npm run build

# Start production server
npm run start
```

---


## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js local development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and optimizes the application for production deployment. |
| `npm run start` | Boots the compiled Next.js production server. |
| `npm run lint` | Runs ESLint to verify code quality and style standards. |
| `npm run db:init` | Connects to MongoDB and builds all schema indexes and collections. |
| `npm run db:seed` | Seeds base RBAC permissions and default `admin` and `employee` roles. |
| `npm run db:sample` | Seeds comprehensive demo content (categories, tags, sample articles, and demo users). |

---

## License

This project is licensed under the [MIT License](LICENSE).
