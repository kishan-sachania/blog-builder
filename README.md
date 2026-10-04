# Blog Builder

A publication and editorial management platform built with Next.js App Router, MongoDB/Mongoose, and dynamic Role-Based Access Control (RBAC).

## Overview

Blog Builder includes:
- **Public Journal:** Curated reading experience with categorized essays, tag filtering, reading time estimates, and author attribution.
- **Author Studio:** Author workspace to write, format, draft, and publish stories with image uploads.
- **Admin & Moderation Panel:** Editorial oversight tools to review submissions, manage topic categories, organize tags, and administer user roles.
- **Authentication & RBAC:** Dual-token JWT system (short-lived access token + rotating refresh token) stored in httpOnly cookies with database-driven permission checks.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** `jsonwebtoken`, `bcryptjs`, and secure cookie sessions
- **Styling & UI:** Tailwind CSS, Lucide Icons, TipTap rich text editor
- **Media Uploads:** Cloudinary Node SDK

---

## Getting Started

### 1. Prerequisites

- Node.js 18+ (or 20+)
- Running MongoDB instance (local or MongoDB Atlas)

### 2. Environment Configuration

Create a `.env` or `.env.local` file in the root directory:

```env
# Database Connection
MONGO_URI=mongodb://localhost:27017/blog_builder

# JWT Secrets
ACCESS_SECRET=your_super_secret_access_key_here
REFRESH_SECRET=your_super_secret_refresh_key_here

# Cloudinary (Optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed Database & Admin User

Run the seeding scripts to initialize permissions, roles, and default credentials:

```bash
# Initialize RBAC permissions & roles
npm run db:seed

# Create default admin user (admin@example.com / password123)
npm run create:admin

# Or seed full demo data (categories, tags, sample stories, authors)
npm run seed:data
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the journal.

---

## Demo Accounts

When seeded via `npm run seed:data` or `npm run create:admin`:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@example.com` | `password123` | Full access (`/admin`, `/studio`, public journal) |
| **Author / Employee** | `author@example.com` | `password123` | Author Studio (`/studio`), story publishing |

---

## Project Structure

```text
src/
├── app/                  # Next.js App Router (pages & API route handlers)
│   ├── (public)/         # Reader journal, topics, stories, and author pages
│   ├── admin/            # Editorial dashboard, moderation queue, categories
│   ├── api/              # RESTful API endpoints (auth, blog, category, tag, user)
│   ├── auth/             # Login & Registration views
│   └── studio/           # Author workspace, story editor, author profile
├── components/           # Reusable UI components organized by domain
│   ├── admin/            # Admin sidebar, tables, category managers
│   ├── article/          # Reader typography, article headers, author cards
│   ├── common/           # Navbar, footer, avatar, modal, pagination
│   ├── home/             # Featured stories, hero, recent essays grid
│   └── studio/           # TipTap editor, story tables, stats widgets
├── hooks/                # Custom React hooks (useApi, useAuth, usePagination)
├── lib/                  # Core utilities (db connection, cookies, api-response, rbac)
├── models/               # Mongoose schema definitions (Blog, User, Role, Category, Tag)
├── scripts/              # Database maintenance & seeding CLI scripts
├── services/             # Domain business logic & queries (blog, user, role, token, tag)
└── types/                # Single source of truth TypeScript interfaces
```

---

## RBAC Architecture

Permissions are defined dynamically in MongoDB with the structure `{ resource, action }`:
- **Resources:** `blog`, `user`, `category`, `tag`
- **Actions:** `create`, `read`, `update`, `delete`

Route handlers protect endpoints using the `withPermission(resource, action, handler)` higher-order function:

```typescript
import { withPermission } from '@/lib/rbac';
import { blogService } from '@/services/blogService';
import { ApiResponse } from '@/lib/api-response';

export const GET = withPermission('blog', 'read', async (req) => {
  const blogs = await blogService.getBlogs();
  return ApiResponse.success(200, true, 'Blogs fetched', blogs);
});
```

---

## Scripts Reference

- `npm run dev` — Starts local development server
- `npm run build` — Compiles production Next.js build
- `npm run start` — Runs the compiled production server
- `npm run db:seed` — Seeds default RBAC roles and permissions
- `npm run create:admin` — Upserts the default administrator account
- `npm run seed:data` — Seeds sample authors, categories, tags, and articles
