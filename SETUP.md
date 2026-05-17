# SYSTEM — Setup & Deployment Guide

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 14+ (local or remote)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/solo_system"
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Also update `prisma.config.ts` — the `datasource.url` must match your `DATABASE_URL`.

### 4. Create Database & Run Migrations
```bash
# Create the database first in PostgreSQL, then:
npm run db:migrate

# Or push schema directly (dev):
npm run db:push
```

### 5. Seed Data
```bash
npm run db:seed
```

This creates:
- 20 system quest templates across all categories
- 17 achievements with various rarities

### 6. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Create Vercel Project
- Connect GitHub repo at vercel.com/new
- Framework: Next.js (auto-detected)

### 3. Environment Variables (Vercel Dashboard)
```
DATABASE_URL          = your-production-postgres-url
AUTH_SECRET           = openssl rand -base64 32
AUTH_URL              = https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL   = https://your-domain.vercel.app
CRON_SECRET           = openssl rand -base64 32
```

### 4. Database Options
- **Neon** (recommended): Free serverless PostgreSQL, perfect for Vercel
- **Supabase**: Free tier available
- **Vercel Postgres**: Built-in option

### 5. Run Migrations on Production
```bash
DATABASE_URL=<prod-url> npx prisma migrate deploy
DATABASE_URL=<prod-url> npm run db:seed
```

### 6. Cron Jobs (vercel.json)
Already configured in `vercel.json`:
- `/api/cron/daily-quests` — Midnight daily (assign quests)
- `/api/cron/decay` — 3am daily (stat decay)

Crons are authenticated via `Authorization: Bearer <CRON_SECRET>`.

---

## Architecture Overview

```
src/
  app/
    (auth)/          # Login, Register pages
    (dashboard)/     # Protected dashboard routes
      dashboard/     # Main dashboard
      quests/        # Daily quests
      stats/         # Stat details
      profile/       # Own profile + public profiles
      social/        # Friends list
      notifications/ # Notifications
    api/
      auth/          # NextAuth handler
      cron/          # Background jobs (decay, daily quests)
  actions/           # Server actions (auth, quests, social)
  components/
    auth/            # Login/register forms
    dashboard/       # XP overview, stat cards, charts
    quests/          # Quest card, quest list
    stats/           # Stat detail card, radar chart
    achievements/    # Achievement grid
    social/          # Friends list, add friend, pending requests
    profile/         # Public profile view
    notifications/   # Notification list
    layout/          # Sidebar navigation
    ui/              # Base UI components (Button, Card, Input, etc.)
  lib/
    auth.ts          # NextAuth configuration
    db.ts            # Prisma client singleton
    constants.ts     # XP formulas, rank thresholds, metadata
    utils.ts         # Date helpers, formatters
    validations.ts   # Zod schemas
  types/             # TypeScript types
  middleware.ts      # Route protection
```

## RPG Systems

### Level Formula
```
xpForLevel(n) = floor(100 * n^1.5)
```

### Rank Thresholds
| Rank | Level Required |
|------|---------------|
| E    | 0             |
| D    | 10            |
| C    | 25            |
| B    | 50            |
| A    | 100           |
| S    | 200           |

### Streak Bonuses
| Streak | Bonus |
|--------|-------|
| 3+ days | +10% XP |
| 7+ days | +20% XP |
| 14+ days | +30% XP |
| 30+ days | +50% XP |

### Stat Decay (configurable in `src/lib/constants.ts`)
- Grace period: 2 days
- Decay rate: 2% XP per day after grace period
- Max decay: 15% total
- Streak broken on any inactivity

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (credentials) |
| Server State | TanStack Query v5 |
| Toasts | Sonner |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod v4 |

---

## Future Extensions

The architecture is designed to support:

- **Fitness API integrations** — Apple Health, Google Fit, Strava
  - Add `src/services/integrations/` with OAuth flows
- **Push notifications** — Add web-push or FCM
  - Notification model already exists
- **AI-generated quests** — Add `src/services/ai-quests.ts`
  - Use Claude/GPT to generate personalized quests
- **Mobile app** — Expose REST API routes, or use React Native with shared components
- **Premium subscriptions** — Add `plan` field to User model
- **Team challenges** — Add `Group` and `GroupChallenge` models
