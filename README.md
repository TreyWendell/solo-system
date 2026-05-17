# Ascend

A Solo Leveling-inspired RPG habit tracker. Complete daily quests to earn XP, level up your stats, and climb the ranks from E to S.

**[Live Demo](https://solo-system-git-master-trey-wendell-s-projects.vercel.app)**

> Demo account: `demo@demo.com` / `demodemo`

## Screenshots

| Login | Dashboard | Stats |
|-------|-----------|-------|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) | ![Stats](screenshots/stats.png) |

## Features

- **Daily Quests** — Complete quests each day to earn XP. Quests reset at midnight.
- **7 Core Stats** — Strength, Intelligence, Stamina, Discipline, Agility, Charisma, Creativity. Each stat has its own XP and level.
- **Streaks & Bonuses** — Consecutive days of activity earn bonus XP (+10% at 3d, +20% at 7d, +30% at 14d, +50% at 30d).
- **Rank Progression** — Global level gates your rank: E (0) → D (10) → C (25) → B (50) → A (100) → S (200).
- **Weekly XP Chart** — Dashboard chart showing XP earned per day over the last 7 days.
- **Stat History Modal** — Click any stat card to see every quest that contributed XP to it, with streak indicators and dates.
- **Achievements** — Unlock badges for milestones like first quest, streaks, and total XP thresholds.
- **Admin Panel** — `/admin` lets you create, edit, and delete quest templates, and manually grant or remove XP from any stat.
- **AI Quest Generation** — Generate a personalized quest via Claude, targeting your weakest stats.
- **ARIA Coach** — AI progress coach on the dashboard that analyzes your rank, streak, and stats and delivers personalized advice each session.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| Auth | NextAuth v5 (JWT, credentials) |
| AI | Anthropic SDK (`claude-opus-4-7`) |
| Charts | Recharts |
| Validation | Zod v4 |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Anthropic API key (optional — AI features degrade gracefully without it)

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/solo_system"
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"

# Optional — enables AI Quest Generation and ARIA Coach
ANTHROPIC_API_KEY="sk-ant-..."
```

3. **Run database migrations**

```bash
npx prisma migrate dev
```

4. **Seed quest templates and achievements**

```bash
npx prisma db seed
```

5. **Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login / register pages
│   └── (dashboard)/      # Authenticated app
│       ├── dashboard/    # Main dashboard
│       ├── quests/       # Full quest list
│       ├── stats/        # Stat detail page
│       ├── social/       # Friends & leaderboard
│       ├── profile/      # User profile
│       ├── notifications/
│       └── admin/        # Quest template editor + XP grants
├── actions/
│   ├── quests.ts         # completeQuest, uncompleteQuest, assignTodayQuests
│   ├── stats.ts          # getStatQuestHistory
│   ├── admin.ts          # Template CRUD, grantStatXp
│   ├── ai.ts             # generateAiQuest, getProgressCoaching
│   └── auth.ts           # Login, register, logout
├── components/
│   ├── admin/            # TemplateManager, XpGrantForm
│   ├── dashboard/        # XpOverview, WeeklyChart, StatCard, ActivityFeed, AiCoachCard
│   ├── quests/           # QuestCard, QuestList, GenerateQuestButton
│   ├── stats/            # StatDetailCard, StatQuestModal
│   ├── layout/           # Sidebar, BottomNav
│   └── ui/               # Shared primitives (Button, Badge, Avatar, XpBar…)
├── lib/
│   ├── constants.ts      # XP formula, rank thresholds, stat/category metadata
│   ├── ai.ts             # Anthropic client singleton
│   ├── auth.ts           # Full NextAuth config (server only)
│   ├── auth.config.ts    # Edge-safe NextAuth config (used by middleware)
│   ├── db.ts             # Prisma client singleton with PrismaPg adapter
│   └── utils.ts          # formatRelative, startOfDay, cn, etc.
└── types/
    └── index.ts          # Shared TypeScript types
prisma/
├── schema.prisma         # Database schema
├── seed.ts               # 20 quest templates + 17 achievements
└── config.ts             # Prisma 7 config (datasource URL lives here)
```

## Key Design Decisions

**XP Formula** — `xpForLevel(n) = floor(100 * max(0, n-1)^1.5)`. Level 1 requires 0 XP so new users start at level 1 with a full bar, not negative progress.

**Weekly Chart** — Derived from `DailyQuest.completedAt` directly, not XpHistory. This means unchecking a quest instantly removes its XP from the chart with no separate reversal record to manage.

**Auth Split** — NextAuth config is split into `auth.config.ts` (no Node.js imports, used by Edge middleware) and `auth.ts` (full config with bcryptjs + PrismaAdapter, used by server code only).

**Prisma 7** — Datasource URL goes in `prisma.config.ts`, not `schema.prisma`. The client requires the `@prisma/adapter-pg` driver adapter — bare `new PrismaClient()` will error.

**AI Integration** — Both AI features use `claude-opus-4-7` with prompt caching (`cache_control: ephemeral`) on system prompts to reduce latency on repeat calls. The ARIA coach response is cached for 1 hour per user via `unstable_cache` to limit API spend; admin accounts bypass the cache for a fresh analysis on every load. If `ANTHROPIC_API_KEY` is not set, both features degrade gracefully with an offline message.

## Admin Panel

Navigate to `/admin` in the sidebar. Requires admin privileges — grant them with:

```bash
npx tsx --env-file=.env scripts/make-admin.ts your@email.com
```

Three sections:

- **Manual XP Grant** — Select a stat, enter an amount (negative to remove XP), optionally add a reason. Updates the stat's level and logs to stat history.
- **Quest Templates** — Create, edit (pencil icon), or delete (trash icon) templates. The form lets you set title, description, category, difficulty, XP reward, per-stat rewards, and active/system flags. Templates marked active and system are included in the daily quest pool.
- **User Management** — Grant or revoke admin privileges for any user.
