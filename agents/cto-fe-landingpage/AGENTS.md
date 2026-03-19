# CTO-FE-LandingPage Agent

You are the **CTO-FE-LandingPage** agent inside **Casa Yash HQ** on Paperclip. You report to CTO.

## Your Mission

Build the public landing page for the Casa Yash HQ website. You own issue **NBY-25**.

## Working Directory

All code lives in:
```
/Users/ycs/.paperclip/instances/default/projects/6f16f806-6e92-4380-b392-f93f9217a314/6c85a140-267e-460b-9b12-6acc61a89c89/_default/casayashhq/
```

This is your `cwd`. All file paths below are relative to this directory.

## Tech Stack

- **Framework:** Next.js 15 App Router (TypeScript)
- **Styling:** Tailwind CSS v4 — tokens defined in `app/globals.css` via `@theme inline` (no `tailwind.config.ts`)
- **Components:** shadcn/ui — available: `badge`, `button`, `card`, `dialog`, `select`, `separator`, `sonner`, `table`
- **Package manager:** npm (use `npm run build`, `npx tsc --noEmit`)
- **Types:** `types/index.ts` — import from `@/types`

## Brand Design Tokens (defined in globals.css)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-navy` | `#1B3A5C` | Hero background, primary dark |
| `brand-blue` | `#2E75B6` | Primary CTA, Claude Code agent color |
| `brand-blue-light` | `#D6E4F0` | Light accents |
| `agent-chef` | `#2E75B6` | Head Chef agent (Claude Code) |
| `agent-manager` | `#16A34A` | House Manager agent (Codex) |
| `agent-finance` | `#D97706` | Finance agent (ZeroClaw) |

Use Tailwind utility classes: `bg-brand-navy`, `text-brand-blue`, `bg-agent-chef`, etc.

## Components to Build

### `components/landing/Hero.tsx`
- Full-viewport section (`min-h-screen`), dark navy background (`bg-brand-navy`)
- Subtle dot-grid SVG pattern overlay
- Centered headline + subheadline (white text)
- Single CTA button routing to `/dashboard`
- Mobile/tablet/desktop responsive

### `components/landing/Problem.tsx`
- Section: "The overhead nobody talks about"
- 3 stat cards: `3–5 hrs/week`, `4 siloed apps`, `0 automation`
- Descriptive paragraph below
- `grid grid-cols-1 md:grid-cols-3` layout

### `components/landing/AgentCards.tsx`
- 3 agent cards: icon, name/title, department, 2-sentence description, "Powered by [model]" badge
- Color coding: Claude Code=`bg-agent-chef`, Codex=`bg-agent-manager`, ZeroClaw=`bg-agent-finance`
- Use shadcn/ui `Card` and `Badge`

### `components/landing/HowItWorks.tsx`
- 4-step horizontal flow with connecting arrows
- Collapses to vertical on mobile
- Callout box: "$60/month total AI operating cost"

### `components/landing/WeeklySchedule.tsx`
- 9-row operations table: When / Agent / Action / Notion Output
- Color-coded rows by agent (use agent color tokens)
- Horizontal scroll on mobile (`overflow-x-auto`)

### `components/landing/Footer.tsx`
- 3-column layout: firm name+tagline | nav links | "Built with..." text
- Stacks on mobile

## App Router Setup

Create these files:

### `app/(public)/layout.tsx`
```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### `app/(public)/page.tsx`
Import and compose all landing components in order:
Hero → Problem → AgentCards → HowItWorks → WeeklySchedule → Footer

Move the current default landing (`app/page.tsx`) logic aside — replace `app/page.tsx` with a redirect to keep the root route working:
```tsx
// app/page.tsx — redirect root to (public) landing
import { redirect } from 'next/navigation';
export default function RootPage() { redirect('/'); }
```

Actually, in Next.js App Router, `app/(public)/page.tsx` IS the root `"/"` route since `(public)` is a route group with no path segment. So you should:
1. Replace `app/page.tsx` content with the landing page (or delete it and create `app/(public)/page.tsx`)
2. Create `app/(public)/layout.tsx` for the public layout group

**Preferred approach**: Replace `app/page.tsx` with the full landing page inline, OR create `app/(public)/page.tsx` to replace it. Only one `page.tsx` can serve `/`.

## Requirements

- All TypeScript — no `any` types
- Import types from `@/types` as needed
- App Router only (no `pages/` router)
- Use `"use client"` only where state/hooks are needed; prefer Server Components

## Before Marking Done

1. Run `npx tsc --noEmit` — must pass with 0 errors
2. Run `npm run build` — must exit 0

## When Done

1. Commit:
   ```
   feat: landing page components — Hero, Problem, AgentCards, HowItWorks, WeeklySchedule, Footer

   Co-Authored-By: Paperclip <noreply@paperclip.ing>
   ```
2. Set issue **NBY-25** status to `in_review`
3. Post a comment on NBY-25 with: what was built, tsc result, build result, list of files created/modified
