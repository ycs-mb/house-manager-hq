# CasaYashHQ Launch Guide

This document covers local setup, environment configuration, deployment, and launch checks for the CasaYashHQ website.

## 1. Local Development Setup

### Prerequisites

- Node.js 20+
- npm 10+ (or pnpm 9+)
- A Supabase Postgres database
- A Notion integration token with access to all required Notion databases

### Clone and install

```bash
git clone <repo-url>
cd casayashhq
npm install
```

### Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill `.env.local` using the variable reference table in this README.

### Set up database schema

```bash
npx prisma migrate dev
```

### Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## 2. Environment Variables Reference

| Variable | Purpose | Where to get value |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | Secret used by NextAuth session and JWT handling. | Generate locally with `openssl rand -base64 32` or `npx auth secret`. |
| `NEXTAUTH_URL` | Base URL used by server-side dashboard data fetches and auth callbacks. | Local: `http://localhost:3000`. Production: your Vercel domain. |
| `CEO_EMAIL` | Login email for CEO credential auth. | Set manually (team-owned admin email). |
| `CEO_PASSWORD_HASH` | Bcrypt hash checked by credentials auth. | Generate from the chosen CEO password using the command below. |
| `NOTION_TOKEN` | API token for Notion client access. | Notion integration secret from Notion developer settings. |
| `NOTION_MEALS_DB_ID` | Notion data source ID used by Meals dashboard/API. | Notion database ID (or data source ID) from the meals database URL. |
| `NOTION_GROCERY_DB_ID` | Reserved grocery database ID in env template. | Notion grocery database URL (if grocery feature is added). |
| `NOTION_CHORES_DB_ID` | Notion data source ID used by Chores dashboard/API. | Notion chores database URL. |
| `NOTION_MAINTENANCE_DB_ID` | Reserved maintenance database ID in env template. | Notion maintenance database URL (if maintenance feature is added). |
| `NOTION_BUDGET_DB_ID` | Notion data source ID used by Budget dashboard/API. | Notion budget database URL. |
| `NOTION_ACTIVITY_DB_ID` | Notion data source ID used by Activity dashboard/API. | Notion activity database URL. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma (local and deploy). | Supabase project settings > Database > Connection string. |
| `PAPERCLIP_API_URL` | Base Paperclip API URL for approval callback integrations. | Your Paperclip server URL (local example: `http://localhost:3100/api`). |
| `PAPERCLIP_COMPANY_ID` | Paperclip company identifier for API calls. | Paperclip company settings/control plane. |

### Generate `CEO_PASSWORD_HASH` (bcrypt)

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash(process.argv[1],12).then(h=>console.log(h))" "your-strong-password"
```

Copy the printed hash into `CEO_PASSWORD_HASH`.

## 3. Deployment Guide (Vercel)

1. Push the latest code to the Git provider (`main` or release branch).
2. In Vercel, click **Add New... > Project** and import this repository.
3. Configure environment variables in Vercel Project Settings using the table above.
4. Deploy the project.
5. After deploy completes, verify:
   - `/` (landing page) loads
   - `/login` loads and accepts CEO credentials
   - `/dashboard`, `/dashboard/meals`, `/dashboard/chores`, `/dashboard/budget`, `/dashboard/approvals` load
6. Optional custom domain:
   - Add domain in Vercel Project Settings > Domains
   - Update DNS records as instructed by Vercel
   - Set `NEXTAUTH_URL` to the final custom domain URL and redeploy

## 4. Supabase Setup

1. Create a new Supabase project.
2. From **Project Settings > Database**, copy the Postgres connection string.
3. Set that connection string as `DATABASE_URL` in `.env.local` (local) and Vercel env vars (production).
4. Run migrations:

```bash
npx prisma migrate dev
```

For production schema updates, use a production-safe migration workflow from CI or a controlled release environment.

## 5. Post-Launch Checklist

- [ ] Landing page renders correctly on mobile, tablet, and desktop
- [ ] CEO login works at `/login`
- [ ] Dashboard pages load with real Notion data
- [ ] Approvals flow works end-to-end
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` exits with code 0
